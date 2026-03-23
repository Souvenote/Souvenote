'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMusicStore } from '@/stores/music-store';
import AddSongModal from '@/app/components/music/AddSongModal';
import CreditsCheckModal from '@/app/components/music/CreditsCheckModal';
import SongCreationChoice from '@/app/components/music/SongCreationChoice';
import GuidedQuestionnaire from '@/app/components/music/GuidedQuestionnaire';
import ManualPromptView from '@/app/components/music/ManualPromptView';
import GeneratingOverlay from '@/app/components/music/GeneratingOverlay';
import PostGenerationModal from '@/app/components/music/PostGenerationModal';

function MusicGenerationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeContextKey = searchParams.toString();
  const cardId = searchParams.get('cardId');
  const designPrompt = searchParams.get('designPrompt');
  const [initializedRouteKey, setInitializedRouteKey] = useState<string | null>(null);
  const {
    currentStep,
    error,
    setCardContext,
    fetchCredits,
    setStep,
    resetFlow,
  } = useMusicStore();

  const isRouteReady = initializedRouteKey === routeContextKey;

  useEffect(() => {
    resetFlow();
    setCardContext(cardId, designPrompt);
    setInitializedRouteKey(routeContextKey);
    void fetchCredits();

    return () => {
      useMusicStore.getState().stopPolling();
    };
  }, [cardId, designPrompt, routeContextKey, resetFlow, setCardContext, fetchCredits]);

  const handleSkip = () => {
    router.push('/options');
  };

  const handleUseSong = () => {
    router.push('/options');
  };

  if (!isRouteReady) {
    return null;
  }

  return (
    <>
      {/* Error toast */}
      {error && currentStep === 'failed' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg z-[60] text-sm font-medium max-w-md text-center">
          {error}
          <button
            onClick={() => setStep('creation_choice')}
            className="ml-3 underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Flow modals */}
      {currentStep === 'initial' && <AddSongModal onSkip={handleSkip} />}
      {currentStep === 'credits_check' && <CreditsCheckModal onSkip={handleSkip} />}
      {currentStep === 'creation_choice' && <SongCreationChoice />}
      {currentStep === 'guided' && <GuidedQuestionnaire />}
      {currentStep === 'manual' && <ManualPromptView />}
      {currentStep === 'generating' && <GeneratingOverlay />}
      {currentStep === 'completed' && <PostGenerationModal onUseSong={handleUseSong} />}
    </>
  );
}

export default function MusicGenerationPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-3">Music Generation</h1>
        <p className="text-gray-500">
          Add a personalized AI-generated song to your greeting card.
        </p>
      </div>

      <Suspense fallback={null}>
        <MusicGenerationContent />
      </Suspense>
    </main>
  );
}
