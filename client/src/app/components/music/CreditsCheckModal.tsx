'use client';

import { useState, useEffect } from 'react';
import PricingModal from '../PricingModal';
import ReferralModal from '../ReferralModal';
import { useMusicStore } from '@/stores/music-store';

interface CreditsCheckModalProps {
  onSkip: () => void;
}

export default function CreditsCheckModal({ onSkip }: CreditsCheckModalProps) {
  const [showPricing, setShowPricing] = useState(false);
  const [showReferral, setShowReferral] = useState(true);
  const { songCredits, setStep } = useMusicStore();

  const handleBack = () => {
    setStep('creation_choice');
  };

  // If user somehow got credits (e.g. purchased), continue
  useEffect(() => {
    if (songCredits >= 1) {
      setStep('creation_choice');
    }
  }, [songCredits, setStep]);

  if (songCredits >= 1) {
    return null;
  }

  if (showReferral) {
    return (
      <ReferralModal
        isOpen
        onClose={() => setShowReferral(false)}
        onMaybeLater={() => setShowReferral(false)}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">No AI Song Credits</h2>
          <p className="text-gray-500 mb-2">
            You need at least 1 song credit to generate a custom AI song.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Current balance: {songCredits} song credits. Ready Songs are still free to use.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setShowPricing(true)}
              className="w-full py-3.5 rounded-xl bg-[#111111] text-white font-semibold hover:bg-[#333] transition-colors cursor-pointer"
            >
              Add Song Credits
            </button>
            <button
              onClick={() => setStep('premade_browse')}
              className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Choose a Ready Song Instead
            </button>
            <button
              onClick={handleBack}
              className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Back
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

      {showPricing && (
        <PricingModal onClose={() => setShowPricing(false)} />
      )}
    </>
  );
}
