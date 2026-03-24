'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { purchasesApi } from '@/lib/api';
import { CARD_PACKS, CREDIT_PACKS, type PurchasePack } from '@/lib/purchase-packs';
import { useMusicStore } from '@/stores/music-store';

interface PricingModalProps {
    onClose: () => void;
}

export default function PricingModal({ onClose }: PricingModalProps) {
    const router = useRouter();
    const { fetchCredits } = useMusicStore();
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [selectedCredit, setSelectedCredit] = useState<number | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);

    const selectedPack: PurchasePack | null =
        selectedCard !== null
            ? CARD_PACKS[selectedCard]
            : selectedCredit !== null
                ? CREDIT_PACKS[selectedCredit]
                : null;

    const handlePurchase = async () => {
        if (!selectedPack || isPurchasing) {
            return;
        }

        setIsPurchasing(true);
        setPurchaseError(null);

        try {
            await purchasesApi.createSession({
                packType: selectedPack.packType,
                packId: selectedPack.id,
            });
            await fetchCredits();
            onClose();
        } catch (error) {
            setPurchaseError(
                error instanceof Error ? error.message : 'Could not complete this purchase right now.',
            );
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold">Get started</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-8 py-8 space-y-10">

                    {/* ── Section 1: Card Packs ── */}
                    <div className="space-y-5">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-base">Card Packs</h3>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                                Try option 1 risk-free! Pay $7.99 only if you love your card. Otherwise, you&apos;re charged just $1.69 for AI credits.
                            </p>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {CARD_PACKS.map((pack, i) => (
                                <button
                                    key={pack.label}
                                    onClick={() => {
                                        setSelectedCard(i);
                                        setSelectedCredit(null);
                                        setPurchaseError(null);
                                    }}
                                    className={`relative flex flex-col rounded-xl border-2 transition-all text-left overflow-hidden ${
                                        selectedCard === i
                                            ? 'border-black shadow-md'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                    style={{ aspectRatio: '5/7' }}
                                >
                                    {/* Badge */}
                                    {pack.badge && (
                                        <div className="absolute top-2 left-0 right-0 flex justify-center">
                                            <span className="bg-black text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                                {pack.badge}
                                            </span>
                                        </div>
                                    )}

                                    {/* Card image placeholder */}
                                    <div className="flex-1 bg-gray-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                                        </svg>
                                    </div>

                                    {/* Info */}
                                    <div className="p-2.5 space-y-1.5 bg-white">
                                        <p className="text-[11px] font-semibold leading-tight">{pack.label}</p>
                                        <p className="text-[13px] font-bold">{pack.price}</p>
                                        {pack.savings && (
                                            <p className="text-[10px] text-green-600 font-medium">{pack.savings}</p>
                                        )}
                                        <div className="text-[10px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-100">
                                            <div className="flex justify-between">
                                                <span>Mailed cards</span>
                                                <span className="font-medium text-gray-700">{pack.mailedCards}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>AI images</span>
                                                <span className="font-medium text-gray-700">{pack.images}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>AI songs</span>
                                                <span className="font-medium text-gray-700">{pack.songs}</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Section 2: AI Credit Packs ── */}
                    <div className="space-y-5">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-base">AI Credit Packs</h3>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                                Design First, Decide Later — Start designing now. Your creations will be saved in My Cards for 30 days so you can add them to your cart anytime.
                            </p>
                        </div>

                        <div className="flex gap-3 max-w-lg">
                            {CREDIT_PACKS.map((pack, i) => (
                                <button
                                    key={pack.label}
                                    onClick={() => {
                                        setSelectedCredit(i);
                                        setSelectedCard(null);
                                        setPurchaseError(null);
                                    }}
                                    className={`relative flex flex-col rounded-xl border-2 transition-all text-left overflow-hidden flex-1 ${
                                        selectedCredit === i
                                            ? 'border-black shadow-md'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                    style={{ aspectRatio: '5/7' }}
                                >
                                    {pack.badge && (
                                        <div className="absolute top-2 left-0 right-0 flex justify-center">
                                            <span className="bg-black text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                                {pack.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex-1 bg-gray-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                                        </svg>
                                    </div>

                                    <div className="p-2.5 space-y-1.5 bg-white">
                                        <p className="text-[11px] font-semibold leading-tight">{pack.label}</p>
                                        <p className="text-[13px] font-bold">{pack.price}</p>
                                        {pack.savings && (
                                            <p className="text-[10px] text-green-600 font-medium">{pack.savings}</p>
                                        )}
                                        <div className="text-[10px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-100">
                                            <div className="flex justify-between">
                                                <span>AI images</span>
                                                <span className="font-medium text-gray-700">{pack.images}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>AI songs</span>
                                                <span className="font-medium text-gray-700">{pack.songs}</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Bottom CTA ── */}
                    <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">
                                Choose a &ldquo;Ready to Send&rdquo; card from our marketplace
                            </p>
                            <p className="text-xs text-gray-500">
                                Add your own message, no AI customization. Starting at $6.49.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                router.push('/cards?ready=true');
                            }}
                            className="flex-shrink-0 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Sure, Let&apos;s go
                        </button>
                    </div>

                    {/* Continue button */}
                    {purchaseError && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {purchaseError}
                        </div>
                    )}

                    {(selectedCard !== null || selectedCredit !== null) && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => void handlePurchase()}
                                disabled={isPurchasing}
                                className="bg-black text-white text-sm font-medium px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isPurchasing ? 'Processing...' : 'Purchase Pack'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
