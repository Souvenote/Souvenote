'use client';

import { useEffect, useState } from 'react';
import { useMusicStore } from '@/stores/music-store';

type CreationStep = 'entry' | 'create_own';

export default function SongCreationChoice() {
  const { setStep, startGeneration, cardDesignPrompt, cardId, isStartingGeneration } = useMusicStore();
  const [creationStep, setCreationStep] = useState<CreationStep>(
    cardDesignPrompt ? 'entry' : 'create_own',
  );

  useEffect(() => {
    setCreationStep(cardDesignPrompt ? 'entry' : 'create_own');
  }, [cardDesignPrompt]);

  const ChoiceCard = ({
    title,
    description,
    onClick,
    iconPath,
    disabled = false,
  }: {
    title: string;
    description: string;
    onClick: () => void;
    iconPath: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
        disabled
          ? 'border-gray-100 opacity-50 cursor-not-allowed'
          : 'border-gray-200 hover:border-[#111111] hover:shadow-md cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {creationStep === 'entry' ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Create Your Song</h2>
            <p className="text-gray-500 text-center mb-8">
              Start from your card or build your own song from scratch.
            </p>

            <div className="space-y-4">
              <ChoiceCard
                title="Based on your card design"
                description="We&apos;ll read your card direction and turn it into a personalized song automatically."
                onClick={() => {
                  if (!cardDesignPrompt) return;

                  startGeneration({
                    mode: 'card_based',
                    cardId: cardId || undefined,
                    designPrompt: cardDesignPrompt,
                  });
                }}
                disabled={!cardDesignPrompt || isStartingGeneration}
                iconPath="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />

              <ChoiceCard
                title="Create my own"
                description="Choose a guided questionnaire or write your own prompt with optional AI enhancement."
                onClick={() => setCreationStep('create_own')}
                disabled={isStartingGeneration}
                iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </div>
          </>
        ) : (
          <>
            {cardDesignPrompt && (
              <button
                onClick={() => setCreationStep('entry')}
                className="text-gray-400 hover:text-gray-600 mb-4 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <h2 className="text-2xl font-bold text-center mb-2">Create My Own</h2>
            <p className="text-gray-500 text-center mb-8">
              Pick the level of control you want for this song.
            </p>

            <div className="space-y-4">
              <ChoiceCard
                title="Guided questionnaire"
                description="Answer a few questions and we&apos;ll build the best prompt for you behind the scenes."
                onClick={() => setStep('guided')}
                disabled={isStartingGeneration}
                iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />

              <ChoiceCard
                title="Manual prompting"
                description="Write your own prompt, then use the magic wand if you want help tightening it up."
                onClick={() => setStep('manual')}
                disabled={isStartingGeneration}
                iconPath="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
