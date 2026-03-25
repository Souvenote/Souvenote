'use client';

import { useMusicStore } from '@/stores/music-store';

interface AddSongModalProps {
  onSkip: () => void;
}

export default function AddSongModal({ onSkip }: AddSongModalProps) {
  const { setCreationChoiceView, setStep } = useMusicStore();

  const handleAddSong = () => {
    setCreationChoiceView('entry');
    setStep('creation_choice');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-2">Make it memorable</h2>
        <p className="text-gray-500 mb-8">
          Add an AI song or choose a ready-to-send track for your greeting card.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleAddSong}
            className="w-full py-3.5 rounded-xl bg-[#111111] text-white font-semibold hover:bg-[#333] transition-colors cursor-pointer"
          >
            Add a Song
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
