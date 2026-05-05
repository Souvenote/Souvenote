'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronRight,
  Sparkles,
  Star,
  Info,
  X,
  ShieldCheck,
} from 'lucide-react';
import PricingPopup from './PricingPopup';
import { musicApi, imageApi, editRequestsApi, type GeneratedImageRecord } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useBuildCardStore } from '@/stores/build-my-card-store';
import PhaseOccasion from './PhaseOccasion';
import PhasePhotoIntent from './PhasePhotoIntent';
import PhasePreserve from './PhasePreserve';
import PhaseTransform from './PhaseTransform';
import PhaseEnhance from './PhaseEnhance';
import PhaseCardText from './PhaseCardText';
import PhaseReview from './PhaseReview';
import PhaseInsideMessage from './PhaseInsideMessage';

export default function BuildMyCard() {
  const router = useRouter();
  const store = useBuildCardStore();
  const { user, loading: authLoading } = useAuth();

  const [credits, setCredits] = useState<number | null>(null);
  const [creditsUnavailable, setCreditsUnavailable] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [showEditRequest, setShowEditRequest] = useState(false);
  const [editRequestText, setEditRequestText] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showAlternateModal, setShowAlternateModal] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (authLoading) return;
    if (!user) {
      if (mounted) { setCredits(0); setCreditsUnavailable(false); }
      return;
    }
    musicApi.getCredits().then((c) => {
      if (mounted) { setCredits(c.image); setCreditsUnavailable(false); }
    }).catch(() => {
      if (mounted) { setCredits(0); setCreditsUnavailable(true); }
    });
    return () => { mounted = false; };
  }, [authLoading, user]);

  const isCheckingCredits = authLoading || credits === null;

  const handleCreateNow = async () => {
    if (isCheckingCredits) return;
    if (!creditsUnavailable && (credits ?? 0) <= 0) {
      setPricingOpen(true);
      return;
    }

    store.setIsGenerating(true);
    setGenerationError(null);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const NEGATIVE_PROMPT = 'mockup, 3D render of a card, hands holding card, envelope, card on table, floating card, perspective angle, white border, white frame, padding, white margin, letterbox, blurry, low resolution, pixelated, grain, noise, artifacts, distorted anatomy, extra fingers, bad hands, logos, trademarked, celebrity, signature, watermark, NSFW, violence, gore';

      const aspectRatio = store.aspectRatio as '3:4' | '4:3' | '1:1' | '5:7' | '7:5';
      const falAspectRatio = (aspectRatio === '5:7' ? '3:4' : aspectRatio === '7:5' ? '4:3' : aspectRatio) as '3:4' | '4:3' | '1:1';

      const intake: Record<string, any> = {
        image_usage_mode: store.imageUsageMode,
        recipient: store.recipientName,
        recipient_relationship: store.recipientRelationship,
        occasion: store.occasion,
        multi_subject_intent: store.multiSubjectIntent,
        mood_primary: store.moodPrimary,
        mood_secondary: store.moodSecondary || null,
        orientation: store.orientation,
        aspect_ratio: store.aspectRatio,
        color_palette: store.colorPalette || undefined,
        text_content: store.textContent || undefined,
        text_additions: store.textAdditions,
        decorative_elements: store.decorativeElements,
        locale: 'en-US',
        identity_preservation: store.identityPreservation,
      };

      if (store.imageUsageMode === 'preserve') {
        intake.design_element_style = store.designElementStyle || undefined;
        intake.design_elements = store.designElements;
      } else if (store.imageUsageMode === 'transform') {
        intake.scenario = store.scenario || undefined;
        intake.style = store.style || undefined;
        intake.environment = store.environment || undefined;
      } else if (store.imageUsageMode === 'enhance') {
        intake.style = store.style || undefined;
        intake.enhancement_type = store.enhancementType;
        intake.enhancement_strength = store.enhancementStrength;
      }

      const controller = new AbortController();
      const generationTimeoutMs = 200_000;
      timeoutId = setTimeout(() => controller.abort(new Error('TIMEOUT')), generationTimeoutMs);

      const result = await imageApi.generate({
        prompt: 'build_my_card',
        negativePrompt: NEGATIVE_PROMPT,
        aspectRatio: falAspectRatio,
        cardType: 'build_my_card',
        intake,
        imageModel: store.referenceImages.length > 0 || store.identityPreservation
          ? 'gpt_image_2_edit'
          : 'gpt_image_2',
        identityPreservation: store.identityPreservation,
        imageUsageMode: store.imageUsageMode as 'preserve' | 'transform' | 'enhance',
        referenceImages: store.referenceImages.length > 0 ? store.referenceImages.slice(0, 5) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      store.setGeneratedImage(result.imageUrl || null, result.id || null);
      store.addSessionImage(result);
      setCredits((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
      store.setIsGenerating(false);
    } catch (err: any) {
      clearTimeout(timeoutId);
      store.setIsGenerating(false);

      if (err?.name === 'AbortError' || err?.message === 'TIMEOUT') {
        setGenerationError('Generation timed out. The image is taking longer than expected. Please try again.');
        return;
      }

      if (err?.data?.error === 'insufficient_credits') {
        setPricingOpen(true);
        return;
      }

      setGenerationError(err?.message || 'Failed to generate image. Please try again.');
    }
  };

  const handleApprove = () => {
    if (!store.generatedImageUrl || isApproving) return;
    void (async () => {
      setIsApproving(true);
      try {
        let imageUrl = store.generatedImageUrl;
        let approvedId = store.generatedImageId;
        if (store.generatedImageId) {
          const approved = await imageApi.upscale(store.generatedImageId);
          imageUrl = approved.imageUrl || imageUrl;
          approvedId = approved.id || approvedId;
        }
        const searchParams = new URLSearchParams({
          designPrompt: `Build My Card — ${store.imageUsageMode} mode`,
          imageUrl: imageUrl!,
          aspectRatio: store.aspectRatio,
        });
        if (approvedId) searchParams.set('imageId', approvedId);
        if (store.occasion) searchParams.set('occasion', store.occasion);
        if (store.recipientRelationship) searchParams.set('recipientRelationship', store.recipientRelationship);
        if (store.textContent) searchParams.set('message', store.textContent);
        if (store.senderName) searchParams.set('senderName', store.senderName);
        if (store.insideMessage) searchParams.set('insideMessage', store.insideMessage);
        if (store.cardFinish) searchParams.set('cardFinish', store.cardFinish);
        if (store.moodPrimary) searchParams.set('moodPrimary', store.moodPrimary);
        if (store.moodSecondary) searchParams.set('moodSecondary', store.moodSecondary);
        if (store.style) searchParams.set('style', store.style);
        if (store.imageUsageMode) searchParams.set('imageUsageMode', store.imageUsageMode);
        router.push(`/create/editor?${searchParams.toString()}`);
      } catch {
        alert('Could not prepare the high-resolution version. Please try again.');
      } finally {
        setIsApproving(false);
      }
    })();
  };

  const handleApproveWithEdit = async () => {
    if (!editRequestText.trim() || !store.generatedImageId) return;
    setIsSubmittingEdit(true);
    try {
      await editRequestsApi.create({
        imageId: store.generatedImageId,
        description: editRequestText,
      });
      setShowEditRequest(false);
      setEditRequestText('');
      handleApprove();
    } catch {
      alert('Could not submit edit request. Please try again.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleApproveSessionImage = (image: GeneratedImageRecord) => {
    if (isApproving) return;
    void (async () => {
      setIsApproving(true);
      try {
        const approved = image.id ? await imageApi.upscale(image.id) : image;
        const sp = new URLSearchParams({
          designPrompt: `Build My Card — ${store.imageUsageMode} mode`,
          imageUrl: approved.imageUrl || image.imageUrl || '',
          aspectRatio: store.aspectRatio,
        });
        if (approved.id) sp.set('imageId', approved.id);
        if (store.occasion) sp.set('occasion', store.occasion);
        if (store.recipientRelationship) sp.set('recipientRelationship', store.recipientRelationship);
        if (store.textContent) sp.set('message', store.textContent);
        router.push(`/create/editor?${sp.toString()}`);
      } catch {
        alert('Failed to prepare image.');
      } finally {
        setIsApproving(false);
      }
    })();
  };

  const phase = store.phase;
  const isResult = !!store.generatedImageUrl && !store.isGenerating;

  const renderGeneratingScreen = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
      {generationError ? (
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 max-w-md w-full space-y-4">
          <div className="flex items-start gap-3">
            <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-red-900">Generation Failed</h3>
              <p className="text-sm text-red-700 mt-1">{generationError}</p>
            </div>
          </div>
          <button
            onClick={() => { setGenerationError(null); handleCreateNow(); }}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-black/5 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-black animate-pulse" />
            </div>
            <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-t-black border-transparent animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">GPT Image 2 is generating your card...</h3>
            <p className="text-gray-400 text-sm">Creating your high-fidelity, print-ready design (~15-30s)</p>
          </div>
          <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-black animate-progress-fast" />
          </div>
        </>
      )}
    </div>
  );

  const renderResultScreen = () => (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">How does it look?</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="bg-gray-100 rounded-[40px] shadow-2xl overflow-hidden relative group">
          <img
            src={store.generatedImageUrl!}
            alt="Generated Card"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Generation Complete</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Your Card is Ready</h2>
            <p className="text-gray-500 leading-relaxed">
              Your {store.occasion} card for {store.recipientRelationship} has been generated ({store.imageUsageMode} mode).
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApproving ? 'Opening Editor...' : '1. Approve'} <Star className="w-5 h-5 fill-white" />
            </button>
            <button
              onClick={() => setShowEditRequest(true)}
              className="w-full py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
            >
              2. Approve With Edit Request (Free) <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAlternateModal(true)}
              className="w-full py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
            >
              3. Keep Trying (New Prompt) <Sparkles className="w-4 h-4" />
            </button>
            {(credits ?? 0) <= 0 && (
              <a
                href="/cards"
                className="w-full py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all flex items-center justify-center gap-2 no-underline"
              >
                4. Choose a Community Card <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {showEditRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Request a Fix (Free)</h3>
              <p className="text-sm text-gray-500">Describe what you'd like changed. We'll handle it at no extra cost.</p>
            </div>
            <textarea
              rows={4}
              placeholder="e.g., Can you make the background brighter?"
              value={editRequestText}
              onChange={(e) => setEditRequestText(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 resize-none text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowEditRequest(false); setEditRequestText(''); }}
                className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-500 hover:border-black hover:text-black transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveWithEdit}
                disabled={!editRequestText.trim() || isSubmittingEdit}
                className="flex-1 py-3 bg-black text-white rounded-2xl font-bold disabled:opacity-40 transition-all text-sm"
              >
                {isSubmittingEdit ? 'Submitting...' : 'Submit & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlternateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Try a different approach</h3>
              <p className="text-sm text-gray-500">Pick an alternative direction for your next generation.</p>
            </div>
            <button
              onClick={() => {
                setShowAlternateModal(false);
                handleCreateNow();
              }}
              className="w-full py-3 bg-gray-100 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-200 transition-all"
            >
              Just regenerate with the same inputs
            </button>
            <button
              onClick={() => {
                setShowAlternateModal(false);
                store.setPhase(0);
                store.setGeneratedImage(null, null);
              }}
              className="w-full py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm text-gray-500 hover:border-black hover:text-black transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPhase = () => {
    switch (phase) {
      case 0:
        return (
          <PhaseOccasion
            occasion={store.occasion}
            onOccasionSelect={(o) => store.setField('occasion', o)}
            onNext={() => store.setPhase(1)}
          />
        );
      case 1:
        return (
          <PhasePhotoIntent
            referenceImages={store.referenceImages}
            identityPreservation={store.identityPreservation}
            imageUsageMode={store.imageUsageMode}
            multiSubjectIntent={store.multiSubjectIntent as any}
            orientation={store.orientation as any}
            colorPalette={store.colorPalette}
            isCustomMode={store.isCustomMode}
            faceCount={store.photoAnalysis?.faceCount || 0}
            recipientRelationship={store.recipientRelationship}
            recipientName={store.recipientName}
            onSetImages={(files) => store.setField('referenceImages', files)}
            onSetField={(k, v) => store.setField(k as any, v)}
            onPhotoAnalyzed={(a) => store.setField('photoAnalysis', a)}
            onBack={() => store.setPhase(0)}
            onNext={() => {
              if (store.imageUsageMode === 'preserve') store.setPhase(2);
              else if (store.imageUsageMode === 'transform') store.setPhase(3);
              else store.setPhase(4);
            }}
          />
        );
      case 2:
        return (
          <PhasePreserve
            occasion={store.occasion}
            recipientName={store.recipientName}
            moodPrimary={store.moodPrimary}
            moodSecondary={store.moodSecondary}
            designElements={store.designElements}
            designElementStyle={store.designElementStyle}
            decorativeElements={store.decorativeElements}
            textAdditions={store.textAdditions}
            onSetField={(k, v) => store.setField(k as any, v)}
            onBack={() => store.setPhase(1)}
            onNext={() => store.setPhase(5)}
          />
        );
      case 3:
        return (
          <PhaseTransform
            occasion={store.occasion}
            recipientName={store.recipientName}
            moodPrimary={store.moodPrimary}
            moodSecondary={store.moodSecondary}
            scenario={store.scenario}
            style={store.style}
            environment={store.environment}
            decorativeElements={store.decorativeElements}
            textAdditions={store.textAdditions}
            onSetField={(k, v) => store.setField(k as any, v)}
            onBack={() => store.setPhase(1)}
            onNext={() => store.setPhase(5)}
          />
        );
      case 4:
        return (
          <PhaseEnhance
            occasion={store.occasion}
            recipientName={store.recipientName}
            moodPrimary={store.moodPrimary}
            moodSecondary={store.moodSecondary}
            style={store.style}
            enhancementType={store.enhancementType}
            enhancementStrength={store.enhancementStrength as any}
            decorativeElements={store.decorativeElements}
            textAdditions={store.textAdditions}
            onSetField={(k, v) => store.setField(k as any, v)}
            onBack={() => store.setPhase(1)}
            onNext={() => store.setPhase(5)}
          />
        );
      case 5:
        return (
          <PhaseCardText
            recipientName={store.recipientName}
            recipientRelationship={store.recipientRelationship}
            occasion={store.occasion}
            moodPrimary={store.moodPrimary}
            moodSecondary={store.moodSecondary}
            scenario={store.scenario}
            style={store.style}
            decorativeElements={store.decorativeElements}
            textContent={store.textContent}
            onSetField={(k, v) => store.setField(k as any, v)}
            onBack={() => {
              if (store.imageUsageMode === 'preserve') store.setPhase(2);
              else if (store.imageUsageMode === 'transform') store.setPhase(3);
              else store.setPhase(4);
            }}
            onNext={() => store.setPhase(6)}
          />
        );
      case 6:
        return (
          <PhaseReview
            imageUsageMode={store.imageUsageMode}
            occasion={store.occasion}
            recipientName={store.recipientName}
            recipientRelationship={store.recipientRelationship}
            moodPrimary={store.moodPrimary}
            moodSecondary={store.moodSecondary}
            orientation={store.orientation}
            aspectRatio={store.aspectRatio}
            textContent={store.textContent}
            style={store.style}
            designElementStyle={store.designElementStyle}
            designElements={store.designElements}
            scenario={store.scenario}
            environment={store.environment}
            enhancementType={store.enhancementType}
            enhancementStrength={store.enhancementStrength as any}
            decorativeElements={store.decorativeElements}
            textAdditions={store.textAdditions}
            referenceImages={store.referenceImages}
            identityPreservation={store.identityPreservation}
            isCheckingCredits={isCheckingCredits}
            onBack={() => store.setPhase(5)}
            onCreateNow={handleCreateNow}
          />
        );
      case 7:
        return (
          <PhaseInsideMessage
            recipientName={store.recipientName}
            insideMessage={store.insideMessage}
            signOff={store.signOff || ''}
            onSetField={(k, v) => store.setField(k as any, v)}
            onBack={() => store.setPhase(6)}
            onContinue={() => {
              const sp = new URLSearchParams();
              if (store.generatedImageUrl) sp.set('imageUrl', store.generatedImageUrl);
              if (store.generatedImageId) sp.set('imageId', store.generatedImageId);
              if (store.occasion) sp.set('occasion', store.occasion);
              if (store.recipientRelationship) sp.set('recipientRelationship', store.recipientRelationship);
              if (store.textContent) sp.set('message', store.textContent);
              if (store.senderName) sp.set('senderName', store.senderName);
              if (store.insideMessage) sp.set('insideMessage', store.insideMessage);
              if (store.signOff) sp.set('signOff', store.signOff);
              if (store.cardFinish) sp.set('cardFinish', store.cardFinish);
              if (store.moodPrimary) sp.set('moodPrimary', store.moodPrimary);
              if (store.moodSecondary) sp.set('moodSecondary', store.moodSecondary);
              if (store.style) sp.set('style', store.style);
              if (store.imageUsageMode) sp.set('imageUsageMode', store.imageUsageMode);
              sp.set('designPrompt', `Build My Card — ${store.imageUsageMode} mode`);
              sp.set('aspectRatio', store.aspectRatio);
              router.push(`/create/music?${sp.toString()}`);
            }}
          />
        );
      default:
        return null;
    }
  };

  const phaseLabels = ['Occasion', 'Photo', 'Create', 'Create', 'Create', 'Card Text', 'Review', 'Inside'];

  return (
    <div className="min-h-screen bg-white">
      {store.isGenerating ? (
        <div className="max-w-4xl mx-auto px-6 py-16">
          {renderGeneratingScreen()}
        </div>
      ) : isResult ? (
        <div className="max-w-4xl mx-auto px-6 py-16">
          {renderResultScreen()}
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((p) => {
                  const isCurrent = phase === p;
                  const isDone = phase > p;
                  return (
                    <div key={p} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          isCurrent ? 'bg-black text-white ring-4 ring-black/10' : isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : p + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Step {phase + 1} of 8
                </span>
                <h4 className="text-xs font-bold text-black">
                  {phaseLabels[phase] || ''}
                </h4>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-6 py-16">
            {renderPhase()}
          </div>
        </>
      )}

      <PricingPopup
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        sessionImages={store.sessionImages}
        onApprovePrevious={handleApproveSessionImage}
        onExit={() => router.push('/options')}
      />

      <style jsx global>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
