'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VIBES = ['Romantic', 'Funny', 'Cute', 'Heartfelt', 'Elegant', 'Playful', 'Calm', 'Celebratory'];
const STYLES = ['Photographic', 'Cinematic', 'Cartoon', 'Anime', 'Watercolor', 'Painterly', 'Minimal', 'Vintage', 'Fantasy', 'Dreamy'];
const ENHANCEMENT_TYPES = ['Lighting', 'Color grading', 'Artistic filter', 'Soft glow'];
const STRENGTHS = ['Subtle', 'Moderate', 'Strong'];
const TEXT_EXTRAS = ['Zodiac sign', 'Birthdate', 'Year', 'Custom number'];
const VISUAL_EXTRAS = ['Flowers', 'Hearts', 'Stars', 'Balloons', 'Cake', 'Pets', 'Confetti', 'Sparkles', 'Ribbons'];
const OCCASIONS = ['Birthday', 'Anniversary', "Valentine's Day", "Mother's Day", "Father's Day", 'Christmas', 'Easter', 'Thank You', 'Congratulations', 'Just Because'];

interface Props {
  occasion: string;
  recipientName: string;
  moodPrimary: string;
  moodSecondary: string | null;
  style: string;
  enhancementType: string[];
  enhancementStrength: string;
  decorativeElements: string[];
  textAdditions: string[];
  onSetField: (field: string, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function PhaseEnhance({
  occasion,
  recipientName,
  moodPrimary,
  moodSecondary,
  style,
  enhancementType,
  enhancementStrength,
  decorativeElements,
  textAdditions,
  onSetField,
  onBack,
  onNext,
}: Props) {
  const toggleVibe = (vibe: string) => {
    if (moodPrimary === vibe) {
      onSetField('moodPrimary', '');
      onSetField('moodSecondary', null);
    } else if (!moodPrimary) {
      onSetField('moodPrimary', vibe);
    } else if (!moodSecondary) {
      onSetField('moodSecondary', vibe);
    } else {
      onSetField('moodPrimary', moodSecondary);
      onSetField('moodSecondary', vibe);
    }
  };

  const toggleEnhancement = (type: string) => {
    const next = enhancementType.includes(type)
      ? enhancementType.filter((t) => t !== type)
      : [...enhancementType, type];
    onSetField('enhancementType', next);
  };

  const toggleExtra = (extra: string) => {
    if (TEXT_EXTRAS.includes(extra)) {
      const next = textAdditions.includes(extra)
        ? textAdditions.filter((e) => e !== extra)
        : [...textAdditions, extra];
      onSetField('textAdditions', next);
    } else {
      const next = decorativeElements.includes(extra)
        ? decorativeElements.filter((e) => e !== extra)
        : [...decorativeElements, extra];
      onSetField('decorativeElements', next);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Enhance: Re-render in a New Style</h2>
        <p className="text-gray-500">Everything stays the same — only the artistic medium changes.</p>
      </div>

      <div className="space-y-10">
        {/* Occasion */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Occasion</label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => onSetField('occasion', o)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  occasion === o ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">What style polish do you prefer?</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => onSetField('style', s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  style === s ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Vibe */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
            What vibe should the card have? <span className="text-gray-300 font-normal">(pick 1–2)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <button
                key={v}
                onClick={() => toggleVibe(v)}
                className={`px-5 py-3 rounded-xl text-xs font-bold border transition-all ${
                  moodPrimary === v
                    ? 'bg-black text-white border-black'
                    : moodSecondary === v
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {v}
                {moodPrimary === v && ' (primary)'}
                {moodSecondary === v && ' (secondary)'}
              </button>
            ))}
          </div>
        </div>

        {/* Enhancement Type */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">How should the photo be enhanced?</label>
          <div className="flex flex-wrap gap-2">
            {ENHANCEMENT_TYPES.map((et) => (
              <button
                key={et}
                onClick={() => toggleEnhancement(et)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  enhancementType.includes(et) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {et}
              </button>
            ))}
          </div>
        </div>

        {/* Enhancement Strength */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">How strong should the effect be?</label>
          <div className="flex gap-3">
            {STRENGTHS.map((s) => (
              <button
                key={s}
                onClick={() => onSetField('enhancementStrength', s)}
                className={`flex-1 py-4 rounded-2xl text-xs font-bold border transition-all ${
                  enhancementStrength === s ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">
            {enhancementStrength === 'Subtle' && 'Mostly original photo with a stylistic touch.'}
            {enhancementStrength === 'Moderate' && 'Clearly stylized — face and surroundings re-drawn, content matches original.'}
            {enhancementStrength === 'Strong' && 'Fully re-illustrated — every element drawn from scratch in the new medium.'}
          </p>
        </div>

        {/* Extras */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Anything else to include?</label>
          <div className="flex flex-wrap gap-2">
            {TEXT_EXTRAS.map((e) => (
              <button
                key={e}
                onClick={() => toggleExtra(e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  textAdditions.includes(e) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {VISUAL_EXTRAS.map((e) => (
              <button
                key={e}
                onClick={() => toggleExtra(e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  decorativeElements.includes(e) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between">
        <button onClick={onBack} className="px-8 py-4 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={onNext} disabled={!moodPrimary || !style} className="px-10 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl disabled:opacity-30">
          Next: Card Text <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
