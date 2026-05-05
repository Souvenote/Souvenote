'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShieldCheck } from 'lucide-react';
import type { ImageUsageMode } from '@/stores/build-my-card-store';

interface Props {
  imageUsageMode: ImageUsageMode | null;
  occasion: string;
  recipientName: string;
  recipientRelationship: string;
  moodPrimary: string;
  moodSecondary: string | null;
  orientation: string;
  aspectRatio: string;
  textContent: string;
  style: string;
  designElementStyle: string;
  designElements: string[];
  scenario: string;
  environment: string;
  enhancementType: string[];
  enhancementStrength: string;
  decorativeElements: string[];
  textAdditions: string[];
  referenceImages: File[];
  identityPreservation: boolean;
  isCheckingCredits: boolean;
  onBack: () => void;
  onCreateNow: () => void;
}

export default function PhaseReview({
  imageUsageMode,
  occasion,
  recipientName,
  recipientRelationship,
  moodPrimary,
  moodSecondary,
  orientation,
  aspectRatio,
  textContent,
  style,
  designElementStyle,
  designElements,
  scenario,
  environment,
  enhancementType,
  enhancementStrength,
  decorativeElements,
  textAdditions,
  referenceImages,
  identityPreservation,
  isCheckingCredits,
  onBack,
  onCreateNow,
}: Props) {
  const branchLabel = imageUsageMode === 'preserve'
    ? 'Preserve (photo + overlays)'
    : imageUsageMode === 'transform'
      ? 'Transform (reimagined scene)'
      : 'Enhance (re-render in new style)';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Review &amp; Generate</h2>
        <p className="text-gray-500">Your design is ready for GPT Image 2 to create.</p>
      </div>

      <div className="bg-gray-50 rounded-[40px] p-8 md:p-12 space-y-10">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{occasion || 'Untitled'} Card</h3>
            <p className="text-sm text-gray-400">For {recipientRelationship || 'recipient'} &middot; {branchLabel}</p>
          </div>
        </div>

        {/* Mode */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Mode</h4>
          <p className="font-bold">{branchLabel}</p>
          <p className="text-xs text-gray-400">
            Aspect: {aspectRatio} &middot; Orientation: {orientation}
            {referenceImages.length > 0 && ` · ${referenceImages.length} photo${referenceImages.length > 1 ? 's' : ''} uploaded`}
            {identityPreservation && ' · Identity preservation ON'}
          </p>
        </div>

        {/* Recipient */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recipient</h4>
          <p className="font-bold">{recipientName || 'Not set'} — {recipientRelationship || 'Not set'}</p>
        </div>

        {/* Mood / Style */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Creative Direction</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vibe</label>
              <p className="font-bold">
                {moodPrimary}{moodSecondary ? ` + ${moodSecondary}` : ''}
              </p>
            </div>
            {style && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Style</label>
                <p className="font-bold">{style}</p>
              </div>
            )}
            {scenario && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memory / Feeling</label>
                <p className="text-sm italic text-gray-600">{scenario}</p>
              </div>
            )}
            {environment && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scene</label>
                <p className="font-bold">{environment}</p>
              </div>
            )}
            {designElementStyle && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Design Style</label>
                <p className="font-bold">{designElementStyle}</p>
              </div>
            )}
            {designElements.length > 0 && designElements[0] !== 'None' && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Design Elements</label>
                <p className="font-bold">{designElements.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhance-specific */}
        {imageUsageMode === 'enhance' && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Enhancement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                <p className="font-bold">{enhancementType.length > 0 ? enhancementType.join(', ') : 'None'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Strength</label>
                <p className="font-bold">{enhancementStrength}</p>
              </div>
            </div>
          </div>
        )}

        {/* Text */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Front-of-Card Text</h4>
          <p className="text-sm italic text-gray-600 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            &ldquo;{textContent || 'No message yet'}&rdquo;
          </p>
          {textAdditions.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Text Additions</label>
              <p className="font-bold text-sm">{textAdditions.join(', ')}</p>
            </div>
          )}
          {decorativeElements.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decorative Motifs</label>
              <p className="font-bold text-sm">{decorativeElements.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="px-10 py-5 border border-gray-200 rounded-3xl font-bold hover:bg-gray-50">
          Edit
        </button>
        <button
          onClick={onCreateNow}
          disabled={isCheckingCredits}
          className="flex-1 py-5 bg-gradient-to-r from-black to-gray-800 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {isCheckingCredits ? 'Checking credits...' : 'Create Now (1 Credit)'}
        </button>
      </div>
    </div>
  );
}
