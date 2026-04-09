'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DecisionModal from './DecisionModal';
import PricingPopup from '@/app/components/PricingPopup';
import { Loader2 } from 'lucide-react';
import { imageApi, type GeneratedImageRecord } from '@/lib/api';

function GeneratePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const initialPrompt = searchParams.get('prompt') || '';

    const [status, setStatus] = useState<'idle' | 'loading' | 'completed' | 'error'>('idle');
    const [generatedImage, setGeneratedImage] = useState<GeneratedImageRecord | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [showPricingPopup, setShowPricingPopup] = useState(false);

    // For "keep trying" inline prompt
    const [newPrompt, setNewPrompt] = useState(initialPrompt);
    const [showNewPromptInput, setShowNewPromptInput] = useState(false);

    const hasGeneratedRef = useRef(false);

    useEffect(() => {
        if (!initialPrompt || hasGeneratedRef.current || authLoading) return;
        hasGeneratedRef.current = true;
        setNewPrompt(initialPrompt);
        generateImage(initialPrompt);
    }, [initialPrompt, authLoading]);

    const generateImage = async (promptToUse: string) => {
        if (!promptToUse.trim()) return;
        setStatus('loading');
        setShowDecisionModal(false);
        setShowNewPromptInput(false);
        setError(null);

        try {
            const result = await imageApi.generate({
                prompt: promptToUse,
                aspectRatio: '5:7',
                resolutionTier: '1k',
            });

            setGeneratedImage(result);
            if (result.imageUrl) {
                setGeneratedImages(prev => [result.imageUrl!, ...prev]);
            }
            setStatus('completed');

            setTimeout(() => setShowDecisionModal(true), 500);

        } catch (err: any) {
            if (err?.data?.error === 'insufficient_credits') {
                setShowPricingPopup(true);
                setStatus('idle');
                return;
            }
            setError(err instanceof Error ? err.message : 'Error generating image');
            setStatus('error');
        }
    };

    const hasCredits = (user?.imageCreditBalance || 0) > 0;

    const openEditor = (image: GeneratedImageRecord | null) => {
        const imageUrl = image?.imageUrl;
        if (!imageUrl) {
            setError('No generated image is available to edit.');
            setStatus('error');
            return;
        }

        const editorParams = new URLSearchParams({
            designPrompt: newPrompt.trim() || initialPrompt,
            imageUrl,
            aspectRatio: image?.aspectRatio || '5:7',
        });

        if (image?.id) {
            editorParams.set('imageId', image.id);
        }

        router.push(`/create/editor?${editorParams.toString()}`);
    };

    const handleApprove = () => {
        void (async () => {
            try {
                let approvedImage = generatedImage;

                if (generatedImage?.id) {
                    approvedImage = await imageApi.upscale(generatedImage.id);
                    setGeneratedImage(approvedImage);
                }

                if (approvedImage?.imageUrl) {
                    setGeneratedImages(prev => [approvedImage!.imageUrl!, ...prev.filter(url => url !== approvedImage!.imageUrl)]);
                }

                openEditor(approvedImage);
            } catch (err) {
                console.error('Failed to upscale approved image:', err);
                setError(err instanceof Error ? err.message : 'Failed to upscale image');
                setStatus('error');
            }
        })();
    };

    const handleApproveWithEdit = (req: string) => {
        console.log("Edit request saved:", req);
        openEditor(generatedImage);
    };

    const handleKeepTrying = () => {
        setShowDecisionModal(false);
        if (hasCredits) {
            setShowNewPromptInput(true);
        } else {
            setShowPricingPopup(true);
        }
    };

    const handleReadyToSend = () => router.push('/customize?ready=true');

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-12 px-4 relative">
            <h1 className="text-3xl font-black text-gray-900 mb-8">AI Generation Canvas</h1>

            <div className="w-full max-w-[400px] aspect-[10/14] bg-white rounded-3xl shadow-xl overflow-hidden relative flex flex-col items-center justify-center border-4 border-gray-100">
                {status === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10 text-center px-6 transition-all">
                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Generating your card...</h3>
                        <p className="text-sm text-gray-500 font-medium">this usually takes 15–30 seconds.</p>
                        <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full mt-6 overflow-hidden relative">
                             <div className="h-full bg-pink-500 animate-[pulse_2s_ease-in-out_infinite] absolute left-0 right-0"></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center p-6">
                        <p className="text-red-500 font-bold mb-4">{error}</p>
                        <button onClick={() => generateImage(newPrompt)} className="px-6 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition">Retry</button>
                    </div>
                )}

                {generatedImages.length > 0 && status !== 'error' && (
                    <img src={generatedImages[0]} alt="Generated" className="w-full h-full object-cover animate-in fade-in duration-700" />
                )}
            </div>

            {/* Keep Trying Input shown on canvas below */}
            {showNewPromptInput && (
                <div className="mt-8 w-full max-w-[400px] bg-white p-6 rounded-3xl shadow-xl border border-gray-100 relative animate-in slide-in-from-bottom-4">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-t border-l border-gray-100 rotate-45"></div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 text-center">Tell us what you'd like to see changed:</label>
                    <textarea
                        className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm focus:outline-none focus:border-pink-500 resize-none transition"
                        rows={3}
                        value={newPrompt}
                        onChange={(e) => setNewPrompt(e.target.value)}
                        placeholder="e.g. Try making it more colorful, or add balloons..."
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setShowDecisionModal(true)} className="px-6 py-3 text-sm text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition flex-1">Cancel</button>
                        <button onClick={() => generateImage(newPrompt)} disabled={!newPrompt.trim()} className="px-6 py-3 text-sm bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition flex-1 disabled:opacity-50">Generate Again</button>
                    </div>
                </div>
            )}

            {showDecisionModal && (
                <DecisionModal
                    onApprove={handleApprove}
                    onApproveWithEdit={handleApproveWithEdit}
                    onKeepTrying={handleKeepTrying}
                    onReadyToSend={handleReadyToSend}
                    hasCredits={hasCredits}
                />
            )}

            <PricingPopup
                isOpen={showPricingPopup}
                onClose={() => {
                   setShowPricingPopup(false);
                   setShowDecisionModal(true);
                }}
            />
        </div>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
            <GeneratePageContent />
        </Suspense>
    );
}
