'use client';

import { create } from 'zustand';
import { musicApi, premadeSongsApi, ApiError, type GenerateSongRequest } from '@/lib/api';

let activePollTimer: ReturnType<typeof setTimeout> | null = null;
let activePollSession = 0;

export type GenerationMethod = 'card_based' | 'guided' | 'manual_prompt' | 'premade';
export type FlowStep =
  | 'initial'         // Add Song / Skip modal
  | 'credits_check'   // Insufficient credits
  | 'creation_choice' // Based on card or custom?
  | 'premade_browse'  // Browse ready songs
  | 'guided'          // Guided questionnaire
  | 'manual'          // Manual prompt
  | 'generating'      // Waiting for Mureka
  | 'completed'       // Song ready
  | 'failed';         // Generation failed

export interface GeneratedSong {
  id: string;
  title?: string;
  audioUrl?: string;
  duration?: number;
  prompt: string;
  engineeredPrompt?: string;
  lyrics?: string;
  style?: string;
  status: string;
  generationMethod: string;
  createdAt: string;
  expiresAt: string;
}

interface MusicState {
  // Flow state
  currentStep: FlowStep;
  
  // Generation
  currentSongId: string | null;
  generatedSong: GeneratedSong | null;
  generationMethod: GenerationMethod | null;
  isPolling: boolean;
  isStartingGeneration: boolean;

  // Card context
  cardId: string | null;
  cardDesignPrompt: string | null;

  // Credits
  songCredits: number;
  imageCredits: number;

  // Error
  error: string | null;

  // Actions
  setStep: (step: FlowStep) => void;
  setCardContext: (cardId: string | null, designPrompt: string | null) => void;
  setCredits: (image: number, song: number) => void;
  fetchCredits: () => Promise<void>;
  
  startGeneration: (params: GenerateSongRequest) => Promise<void>;
  selectPremadeSong: (premadeSongId: string) => Promise<void>;
  
  pollStatus: () => Promise<void>;
  stopPolling: () => void;
  linkSongToCard: (cardId: string) => Promise<void>;
  resetFlow: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentStep: 'initial',
  currentSongId: null,
  generatedSong: null,
  generationMethod: null,
  isPolling: false,
  isStartingGeneration: false,
  cardId: null,
  cardDesignPrompt: null,
  songCredits: 0,
  imageCredits: 0,
  error: null,

  setStep: (step) => set({ currentStep: step, error: null }),

  setCardContext: (cardId, designPrompt) =>
    set({ cardId, cardDesignPrompt: designPrompt }),

  setCredits: (image, song) =>
    set({ imageCredits: image, songCredits: song }),

  fetchCredits: async () => {
    try {
      const credits = await musicApi.getCredits();
      set({ imageCredits: credits.image, songCredits: credits.song });
    } catch {
      // Silently fail - credits will show as 0
    }
  },

  startGeneration: async (params) => {
    if (get().isStartingGeneration) {
      return;
    }

    const generationMethod: GenerationMethod = params.mode === 'guided'
      ? 'guided'
      : params.mode === 'card_based'
        ? 'card_based'
        : 'manual_prompt';
    const request = {
      ...params,
      cardId: params.cardId ?? get().cardId ?? undefined,
    } as GenerateSongRequest;

    set({
      currentStep: 'generating',
      currentSongId: null,
      generatedSong: null,
      generationMethod,
      error: null,
      isStartingGeneration: true,
    });

    try {
      const song = await musicApi.generateSong(request);

      get().stopPolling();

      set({
        currentSongId: song.id,
        generatedSong: song,
        songCredits: Math.max(0, get().songCredits - 1),
        isStartingGeneration: false,
      });

      // Start polling
      void get().pollStatus();
    } catch (err) {
      const isInsufficientCredits =
        err instanceof ApiError && err.data?.error === 'insufficient_credits';
      const message = isInsufficientCredits
        ? 'Not enough song credits'
        : err instanceof Error
          ? err.message
          : 'Failed to start generation';

      set({
        currentStep: isInsufficientCredits ? 'credits_check' : 'failed',
        error: isInsufficientCredits ? null : message,
        isStartingGeneration: false,
      });
    }
  },

  selectPremadeSong: async (premadeSongId) => {
    if (get().isStartingGeneration) {
      return;
    }

    set({
      error: null,
      isStartingGeneration: true,
    });

    try {
      const song = await premadeSongsApi.select(premadeSongId);

      set({
        currentSongId: song.id,
        generatedSong: song,
        generationMethod: 'premade',
        currentStep: 'completed',
        isStartingGeneration: false,
      });
    } catch (err) {
      set({
        currentStep: 'premade_browse',
        error: err instanceof Error ? err.message : 'Could not select this ready song',
        isStartingGeneration: false,
      });
    }
  },

  pollStatus: async () => {
    const songId = get().currentSongId;
    if (!songId || get().isPolling) return;

    activePollSession += 1;
    const pollSession = activePollSession;

    if (activePollTimer) {
      clearTimeout(activePollTimer);
      activePollTimer = null;
    }

    set({ isPolling: true });

    const poll = async () => {
      try {
        const song = await musicApi.checkStatus(songId);

        if (
          pollSession !== activePollSession ||
          !get().isPolling ||
          get().currentSongId !== songId
        ) {
          return;
        }

        set({ generatedSong: song });

        if (song.status === 'completed') {
          set({ currentStep: 'completed', isPolling: false });
          return;
        }

        if (song.status === 'failed') {
          set({
            currentStep: 'failed',
            isPolling: false,
            error: 'Song generation failed. Your credit has been refunded.',
          });
          return;
        }

        // Still generating - poll again in 4 seconds
        if (get().isPolling) {
          activePollTimer = setTimeout(() => {
            void poll();
          }, 4000);
        }
      } catch {
        if (
          pollSession !== activePollSession ||
          !get().isPolling ||
          get().currentSongId !== songId
        ) {
          return;
        }

        set({
          currentStep: 'failed',
          isPolling: false,
          error: 'Lost connection while checking generation status',
        });
      }
    };

    await poll();
  },

  stopPolling: () => {
    activePollSession += 1;

    if (activePollTimer) {
      clearTimeout(activePollTimer);
      activePollTimer = null;
    }

    set({ isPolling: false });
  },

  linkSongToCard: async (cardId) => {
    const songId = get().currentSongId;
    if (!songId) return;

    try {
      await musicApi.linkSongToCard(songId, cardId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to link song to card';
      set({ error: message });
      throw err;
    }
  },

  resetFlow: () => {
    get().stopPolling();
    set({
      currentStep: 'initial',
      currentSongId: null,
      generatedSong: null,
      generationMethod: null,
      isPolling: false,
      isStartingGeneration: false,
      cardId: null,
      cardDesignPrompt: null,
      error: null,
    });
  },
}));
