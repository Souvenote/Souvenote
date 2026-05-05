'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  recipientName: string;
  insideMessage: string;
  signOff: string;
  onSetField: (field: string, value: any) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function PhaseInsideMessage({
  recipientName,
  insideMessage,
  signOff,
  onSetField,
  onBack,
  onContinue,
}: Props) {
  const displayName = recipientName || 'them';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Your Inside Message</h2>
        <p className="text-gray-500">
          This is your personal message to {displayName} — written by you, not by AI.
          It will appear on the inside of the card.
        </p>
      </div>

      <div className="space-y-10">
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Your message to {displayName}
          </label>
          <textarea
            rows={5}
            maxLength={500}
            placeholder="Write your personal inside message here..."
            value={insideMessage}
            onChange={(e) => onSetField('insideMessage', e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 resize-none text-base leading-relaxed"
          />
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">{insideMessage.length}/500 chars</span>
            {insideMessage.length >= 480 && (
              <span className="text-xs text-amber-600 font-medium">{500 - insideMessage.length} chars remaining</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Sign-off <span className="text-gray-300 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            maxLength={30}
            placeholder="e.g., Love, Sarah"
            value={signOff}
            onChange={(e) => onSetField('signOff', e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5"
          />
          <p className="text-[10px] text-gray-400">{signOff.length}/30 chars</p>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between">
        <button onClick={onBack} className="px-8 py-4 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button
          onClick={onContinue}
          className="px-10 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl"
        >
          Continue to Music <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
