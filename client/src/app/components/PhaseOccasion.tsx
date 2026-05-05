'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

const OCCASION_CARDS = [
  { label: 'Birthday', icon: '🎂', color: 'bg-pink-50' },
  { label: 'Christmas', icon: '🎄', color: 'bg-blue-50' },
  { label: "Valentine's Day", icon: '❤️', color: 'bg-red-50' },
  { label: "Mother's Day", icon: '🌸', color: 'bg-purple-50' },
  { label: "Father's Day", icon: '👔', color: 'bg-slate-50' },
  { label: 'Anniversary', icon: '💍', color: 'bg-amber-50' },
  { label: 'Weddings', icon: '💒', color: 'bg-emerald-50' },
  { label: 'Graduations', icon: '🎓', color: 'bg-indigo-50' },
  { label: 'New Baby / Baby Shower', icon: '👶', color: 'bg-orange-50' },
  { label: 'Thank You', icon: '🙏', color: 'bg-cyan-50' },
  { label: 'Get Well Soon', icon: '🌼', color: 'bg-yellow-50' },
  { label: 'Sympathy', icon: '🕯️', color: 'bg-gray-50' },
  { label: 'Congratulations', icon: '🎉', color: 'bg-lime-50' },
  { label: 'Retirement', icon: '🏖️', color: 'bg-teal-50' },
  { label: 'New Home', icon: '🏠', color: 'bg-brown-50' },
  { label: 'Farewell', icon: '👋', color: 'bg-stone-50' },
];

interface Props {
  occasion: string;
  onOccasionSelect: (occasion: string) => void;
  onNext: () => void;
}

export default function PhaseOccasion({ occasion, onOccasionSelect, onNext }: Props) {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
          Let&apos;s Build Your Card!
        </h1>
        <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
          Answer a few questions and GPT Image 2 will design the perfect greeting card.
        </p>
      </div>

      <div className="space-y-12 max-w-6xl mx-auto">
        <div className="relative group max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="e.g., My sister's 30th birthday..."
            value={occasion}
            onChange={(e) => onOccasionSelect(e.target.value)}
            className="w-full px-8 py-7 bg-white border-2 border-gray-100 rounded-[35px] text-lg font-medium focus:outline-none focus:border-black transition-all shadow-sm hover:shadow-xl pr-36"
          />
          <button
            onClick={onNext}
            disabled={!occasion}
            className="absolute right-3 top-3 bottom-3 px-10 bg-black text-white rounded-3xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-20 shadow-lg active:scale-95"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-gray-100 flex-1" />
            <label className="text-xs font-black uppercase tracking-widest text-gray-300 shrink-0">Popular Occasions</label>
            <div className="h-px bg-gray-100 flex-1" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {OCCASION_CARDS.map((occ) => (
              <button
                key={occ.label}
                onClick={() => {
                  onOccasionSelect(occ.label);
                  onNext();
                }}
                className={`group flex flex-col items-center p-8 rounded-[40px] border-2 transition-all hover:scale-[1.05] hover:shadow-2xl hover:z-10 ${
                  occasion === occ.label
                    ? 'border-black bg-gray-50 scale-105 shadow-xl'
                    : 'border-transparent bg-gray-50/50 hover:bg-white hover:border-gray-200'
                }`}
              >
                <div className={`w-20 h-28 ${occ.color} rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-sm group-hover:-rotate-6 transition-all`}>
                  {occ.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors text-center">{occ.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
