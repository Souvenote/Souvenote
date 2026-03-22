'use client';

import { create } from 'zustand';
import { musicApi, ApiError } from '@/lib/api';

export type GenerationMethod = 'card_based' | 'guided' | 'manual_prompt';
export type FlowStep =
  | 'initial'         // Add Song / Skip modal
  | 'credits_check'   // Insufficient credits
  | 'creation_choice' // Based on card or custom?
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
  
  startGeneration: (params: {
    prompt: string;
    lyrics?: string;
    style?: string;
    model?: string;
    generationMethod: GenerationMethod;
  }) => Promise<void>;
  
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
    set({
      currentStep: 'generating',
      generationMethod: params.generationMethod,
      error: null,
    });

    try {
      const song = await musicApi.generateSong({
        prompt: params.prompt,
        lyrics: params.lyrics,
        style: params.style,
        model: params.model,
        cardId: get().cardId || undefined,
        generationMethod: params.generationMethod,
      });

      set({
        currentSongId: song.id,
        generatedSong: song,
        songCredits: get().songCredits - 1,
      });

      // Start polling
      get().pollStatus();
    } catch (err) {
      const message =
        err instanceof ApiError && err.data?.error === 'insufficient_credits'
          ? 'Not enough song credits'
          : err instanceof Error
          ? err.message
          : 'Failed to start generation';

      set({
        currentStep: 'failed',
        error: message,
      });
    }
  },

  pollStatus: async () => {
    const songId = get().currentSongId;
    if (!songId || get().isPolling) return;

    set({ isPolling: true });

    const poll = async () => {
      try {
        const song = await musicApi.checkStatus(songId);
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
          setTimeout(poll, 4000);
        }
      } catch {
        set({
          currentStep: 'failed',
          isPolling: false,
          error: 'Lost connection while checking generation status',
        });
      }
    };

    poll();
  },

  stopPolling: () => set({ isPolling: false }),

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

  resetFlow: () =>
    set({
      currentStep: 'initial',
      currentSongId: null,
      generatedSong: null,
      generationMethod: null,
      isPolling: false,
      error: null,
    }),
}));
