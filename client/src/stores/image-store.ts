'use client';

import { create } from 'zustand';
import { imageApi, ApiError, type GenerateImageRequest, type GeneratedImageRecord } from '@/lib/api';

interface ImageState {
  isGenerating: boolean;
  generatedImage: GeneratedImageRecord | null;
  imageCredits: number;
  error: string | null;
  isInsufficientCredits: boolean;

  generate: (params: GenerateImageRequest) => Promise<GeneratedImageRecord | null>;
  fetchCredits: () => Promise<void>;
  resetImage: () => void;
}

export const useImageStore = create<ImageState>((set, get) => ({
  isGenerating: false,
  generatedImage: null,
  imageCredits: 0,
  error: null,
  isInsufficientCredits: false,

  generate: async (params) => {
    if (get().isGenerating) return null;

    set({
      isGenerating: true,
      generatedImage: null,
      error: null,
      isInsufficientCredits: false,
    });

    try {
      const image = await imageApi.generate(params);

      set({
        generatedImage: image,
        imageCredits: Math.max(0, get().imageCredits - 1),
        isGenerating: false,
      });

      return image;
    } catch (err) {
      const isInsufficientCredits =
        err instanceof ApiError && err.data?.error === 'insufficient_credits';
      const message = isInsufficientCredits
        ? 'Not enough image credits'
        : err instanceof Error
          ? err.message
          : 'Failed to generate image';

      set({
        isGenerating: false,
        error: isInsufficientCredits ? null : message,
        isInsufficientCredits,
      });

      return null;
    }
  },

  fetchCredits: async () => {
    try {
      const images = await imageApi.getMyImages();
      // Credits come from the music credits endpoint which returns both
      // We use a separate mechanism - the generate endpoint returns 402 if no credits
      // For now, we don't pre-fetch the number; the store relies on the component's credit loading
    } catch {
      // Silently fail
    }
  },

  resetImage: () => {
    set({
      isGenerating: false,
      generatedImage: null,
      error: null,
      isInsufficientCredits: false,
    });
  },
}));
