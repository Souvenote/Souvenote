'use client';

import { create } from 'zustand';
import type { GeneratedImageRecord } from '@/lib/api';

export type ImageUsageMode = 'preserve' | 'transform' | 'enhance';
export type MultiSubjectIntent = 'all' | 'centered' | 'custom';
export type Orientation = 'portrait' | 'landscape';
export type EnhancementStrength = 'Subtle' | 'Moderate' | 'Strong';

export interface PhotoAnalysis {
  width: number;
  height: number;
  orientation: Orientation;
  faceCount: number;
}

export interface BuildCardStore {
  phase: number;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  generatedImageId: string | null;
  sessionImages: GeneratedImageRecord[];

  imageUsageMode: ImageUsageMode | null;
  photoAnalysis: PhotoAnalysis | null;
  isCustomMode: boolean;

  occasion: string;
  recipientName: string;
  recipientRelationship: string;
  multiSubjectIntent: MultiSubjectIntent;
  orientation: Orientation;
  aspectRatio: string;

  moodPrimary: string;
  moodSecondary: string | null;
  colorPalette: string;
  textContent: string;
  textAdditions: string[];
  decorativeElements: string[];
  locale: string;
  identityPreservation: boolean;

  designElements: string[];
  designElementStyle: string;
  scenario: string;
  style: string;
  environment: string;
  enhancementType: string[];
  enhancementStrength: EnhancementStrength;

  senderName: string;
  insideMessage: string;
  cardFinish: string;
  signOff: string;

  referenceImages: File[];

  setPhase: (phase: number) => void;
  setField: (key: string, value: unknown) => void;
  setIsGenerating: (val: boolean) => void;
  setGeneratedImage: (url: string | null, id: string | null) => void;
  addSessionImage: (img: GeneratedImageRecord) => void;
  resetForm: () => void;
}

const initialState = {
  phase: 0,
  isGenerating: false,
  generatedImageUrl: null as string | null,
  generatedImageId: null as string | null,
  sessionImages: [] as GeneratedImageRecord[],
  imageUsageMode: null as ImageUsageMode | null,
  photoAnalysis: null as PhotoAnalysis | null,
  isCustomMode: false,
  occasion: '',
  recipientName: '',
  recipientRelationship: '',
  multiSubjectIntent: 'all' as MultiSubjectIntent,
  orientation: 'portrait' as Orientation,
  aspectRatio: '5:7',
  moodPrimary: '',
  moodSecondary: null as string | null,
  colorPalette: '',
  textContent: '',
  textAdditions: [] as string[],
  decorativeElements: [] as string[],
  locale: 'en-US',
  identityPreservation: false,
  designElements: [] as string[],
  designElementStyle: '',
  scenario: '',
  style: '',
  environment: '',
  enhancementType: [] as string[],
  enhancementStrength: 'Moderate' as EnhancementStrength,
  senderName: '',
  insideMessage: '',
  cardFinish: '',
  signOff: '',
  referenceImages: [] as File[],
};

export const useBuildCardStore = create<BuildCardStore>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setField: (key, value) => set({ [key]: value }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setGeneratedImage: (url, id) =>
    set({ generatedImageUrl: url, generatedImageId: id }),
  addSessionImage: (img) =>
    set((s) => ({ sessionImages: [...s.sessionImages, img] })),
  resetForm: () => set(initialState),
}));
