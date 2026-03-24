'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMusicStore } from '@/stores/music-store';
import { cardsApi, musicApi } from '@/lib/api';
import AddSongModal from '@/app/components/music/AddSongModal';
import CreditsCheckModal from '@/app/components/music/CreditsCheckModal';
import SongCreationChoice from '@/app/components/music/SongCreationChoice';
import ReadyToSendSongBrowser from '@/app/components/music/ReadyToSendSongBrowser';
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
  const cardTemplateId = searchParams.get('cardTemplateId');
  const templateTitle = searchParams.get('templateTitle');
  const occasion = searchParams.get('occasion');
  const sourceFlow = searchParams.get('sourceFlow');
  const recipient = searchParams.get('recipient');
  const relationship = searchParams.get('relationship');
  const caption = searchParams.get('caption');
  const birthday = searchParams.get('birthday');
  const fontStyle = searchParams.get('fontStyle');
  const personalMessage = searchParams.get('personalMessage');
  const legacyMessage = searchParams.get('message');
  const selectedPriceCadParam = searchParams.get('selectedPriceCad');
  const [initializedRouteKey, setInitializedRouteKey] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizationError, setFinalizationError] = useState<string | null>(null);
  const {
    currentStep,
    error,
    currentSongId,
    generatedSong,
    setCardContext,
    fetchCredits,
    setStep,
    resetFlow,
  } = useMusicStore();

  const isRouteReady = initializedRouteKey === routeContextKey;

  useEffect(() => {
    resetFlow();
    setCardContext(cardId, designPrompt);
    setFinalizationError(null);
    setIsFinalizing(false);
    setInitializedRouteKey(routeContextKey);
    void fetchCredits();

    return () => {
      useMusicStore.getState().stopPolling();
    };
  }, [cardId, designPrompt, routeContextKey, resetFlow, setCardContext, fetchCredits]);

  const canFinalizeCard = Boolean(
    cardId || cardTemplateId || designPrompt || templateTitle || occasion,
  );
  const selectedPriceCad = selectedPriceCadParam ? Number(selectedPriceCadParam) : null;

  const buildPersonalizationData = () => {
    const data: Record<string, string | boolean | number> = {
      ...(templateTitle ? { templateTitle } : {}),
      ...(occasion ? { occasion } : {}),
      ...((personalMessage || legacyMessage)
        ? { personalMessage: personalMessage || legacyMessage || '' }
        : {}),
      ...(recipient ? { recipientName: recipient } : {}),
      ...(relationship ? { relationship } : {}),
      ...(caption ? { caption } : {}),
      ...(birthday ? { birthday } : {}),
      ...(fontStyle ? { fontStyle } : {}),
      ...(sourceFlow ? { sourceFlow } : {}),
      ...(sourceFlow === 'ready' ? { readyToSend: true } : {}),
      ...(typeof selectedPriceCad === 'number' && Number.isFinite(selectedPriceCad)
        ? { selectedPriceCad: Number(selectedPriceCad.toFixed(2)) }
        : {}),
    };

    return Object.keys(data).length > 0 ? data : undefined;
  };

  const finalizeCard = async (songId?: string) => {
    if (!canFinalizeCard) {
      return null;
    }

    setFinalizationError(null);

    if (cardId) {
      if (songId) {
        await musicApi.linkSongToCard(songId, cardId);
      }

      return { id: cardId };
    }

    setIsFinalizing(true);

    try {
      const createdCard = await cardsApi.create({
        ...(cardTemplateId ? { cardTemplateId } : {}),
        ...(designPrompt ? { designPrompt } : {}),
        format: 'physical',
        ...(songId ? { songId } : {}),
        status: 'complete',
        personalizationData: buildPersonalizationData(),
      });

      if (songId) {
        await musicApi.linkSongToCard(songId, createdCard.id);
      }

      return createdCard;
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : 'Could not save your card right now.';
      setFinalizationError(message);
      throw saveError;
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSkip = async () => {
    if (isFinalizing) {
      return;
    }

    try {
      if (canFinalizeCard) {
        const card = await finalizeCard();
        if (card?.id) {
          router.push(`/delivery/${card.id}`);
          return;
        }
        return;
      }

      router.push('/options');
    } catch {
      // Error state is shown in the UI.
    }
  };

  const handleUseSong = async () => {
    if (isFinalizing) {
      return;
    }

    const songId = generatedSong?.id || currentSongId || undefined;

    try {
      if (songId || canFinalizeCard) {
        const card = await finalizeCard(songId);
        if (card?.id) {
          router.push(`/delivery/${card.id}`);
          return;
        }
        return;
      }

      router.push('/options');
    } catch {
      // Error state is shown in the UI.
    }
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

      {finalizationError && (
        <div className="fixed top-6 left-1/2 z-[60] max-w-md -translate-x-1/2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-lg text-center">
          {finalizationError}
        </div>
      )}

      {/* Flow modals */}
      {currentStep === 'initial' && <AddSongModal onSkip={handleSkip} />}
      {currentStep === 'credits_check' && <CreditsCheckModal onSkip={handleSkip} />}
      {currentStep === 'creation_choice' && <SongCreationChoice />}
      {currentStep === 'premade_browse' && <ReadyToSendSongBrowser />}
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
