'use client';

import { useMusicStore } from '@/stores/music-store';

export default function SongCreationChoice() {
  const {
    creationChoiceView,
    setCreationChoiceView,
    setStep,
    startGeneration,
    cardDesignPrompt,
    cardId,
    isStartingGeneration,
    songCredits,
  } = useMusicStore();

  const canGenerateAi = songCredits >= 1;

  const handleCreateOwn = () => {
    setCreationChoiceView('create_own');

    if (!canGenerateAi) {
      setStep('credits_check');
      return;
    }
  };

  const handleBackToInitial = () => {
    setCreationChoiceView('entry');
    setStep('initial');
  };

  const handleBackToEntry = () => {
    setCreationChoiceView('entry');
  };

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
        {creationChoiceView === 'entry' ? (
          <>
            <button
              onClick={handleBackToInitial}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

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

                  if (!canGenerateAi) {
                    setCreationChoiceView('entry');
                    setStep('credits_check');
                    return;
                  }

                  setCreationChoiceView('entry');
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
                onClick={handleCreateOwn}
                disabled={isStartingGeneration}
                iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />

              <ChoiceCard
                title="Choose a Ready Song"
                description="Browse curated songs by occasion and mood. These do not use AI song credits."
                onClick={() => {
                  setCreationChoiceView('entry');
                  setStep('premade_browse');
                }}
                disabled={isStartingGeneration}
                iconPath="M3 10.5l9-6 9 6M4.5 9.75V19.5A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.5V9.75M9 21V12h6v9"
              />
            </div>

            {!canGenerateAi && (
              <p className="mt-6 text-center text-sm text-amber-600">
                You&apos;re out of AI song credits, but Ready Songs are still available.
              </p>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleBackToEntry}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {!canGenerateAi ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Add AI song credits to generate a custom track, or go back and choose a Ready Song instead.
              </div>
            ) : null}

            <h2 className="text-2xl font-bold text-center mb-2">Create My Own</h2>
            <p className="text-gray-500 text-center mb-8">
              Pick the level of control you want for this song.
            </p>

            <div className="space-y-4">
              <ChoiceCard
                title="Guided questionnaire"
                description="Answer a few questions and we&apos;ll build the best prompt for you behind the scenes."
                onClick={() => {
                  setCreationChoiceView('create_own');
                  setStep(canGenerateAi ? 'guided' : 'credits_check');
                }}
                disabled={isStartingGeneration}
                iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />

              <ChoiceCard
                title="Manual prompting"
                description="Write your own prompt, then use the magic wand if you want help tightening it up."
                onClick={() => {
                  setCreationChoiceView('create_own');
                  setStep(canGenerateAi ? 'manual' : 'credits_check');
                }}
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
