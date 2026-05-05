'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VIBES = ['Romantic', 'Funny', 'Cute', 'Heartfelt', 'Elegant', 'Playful', 'Calm', 'Celebratory'];
const DESIGN_ELEMENTS = ['Border', 'Frame', 'Stickers', 'Icons', 'Light overlays', 'None'];
const DESIGN_STYLES = ['Vintage frame', 'Watercolor border', 'Gold foil accents', 'Modern minimal', 'Hand-drawn doodle', 'Floral wreath', 'Geometric pattern'];
const TEXT_EXTRAS = ['Zodiac sign', 'Birthdate', 'Year', 'Custom number'];
const VISUAL_EXTRAS = ['Flowers', 'Hearts', 'Stars', 'Balloons', 'Cake', 'Pets', 'Confetti', 'Sparkles', 'Ribbons'];
const OCCASIONS = ['Birthday', 'Anniversary', "Valentine's Day", "Mother's Day", "Father's Day", 'Christmas', 'Easter', 'Thank You', 'Congratulations', 'Just Because'];

interface Props {
  occasion: string;
  recipientName: string;
  moodPrimary: string;
  moodSecondary: string | null;
  designElements: string[];
  designElementStyle: string;
  decorativeElements: string[];
  textAdditions: string[];
  onSetField: (field: string, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function PhasePreserve({
  occasion,
  recipientName,
  moodPrimary,
  moodSecondary,
  designElements,
  designElementStyle,
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

  const toggleDesignElement = (el: string) => {
    if (el === 'None') {
      onSetField('designElements', ['None']);
      onSetField('designElementStyle', '');
      return;
    }
    let next = designElements.includes(el)
      ? designElements.filter((d) => d !== el)
      : [...designElements.filter((d) => d !== 'None'), el];
    onSetField('designElements', next);
  };

  const toggleExtra = (extra: string) => {
    const allSelected = new Set([...decorativeElements, ...textAdditions]);
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
        <h2 className="text-3xl font-bold tracking-tight">Preserve: Design Your Overlay</h2>
        <p className="text-gray-500">The photo stays exactly as-is. We&apos;ll add text and design overlays.</p>
      </div>

      <div className="space-y-10">
        {/* Occasion (prefilled) */}
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

        {/* Vibe multi-select */}
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

        {/* Design Elements */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Design elements to add</label>
          <div className="flex flex-wrap gap-2">
            {DESIGN_ELEMENTS.map((el) => (
              <button
                key={el}
                onClick={() => toggleDesignElement(el)}
                className={`px-5 py-3 rounded-xl text-xs font-bold border transition-all ${
                  designElements.includes(el) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>

        {/* Design Element Style (conditional) */}
        {!designElements.includes('None') && designElements.length > 0 && (
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Design element style</label>
            <div className="flex flex-wrap gap-2">
              {DESIGN_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => onSetField('designElementStyle', s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    designElementStyle === s ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Extras */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Anything else to include?</label>
          <div className="space-y-2">
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
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between">
        <button onClick={onBack} className="px-8 py-4 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={onNext} disabled={!moodPrimary} className="px-10 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl disabled:opacity-30">
          Next: Card Text <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
