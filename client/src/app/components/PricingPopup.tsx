'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Music, Layout } from 'lucide-react';
import { purchasesApi, type GeneratedImageRecord } from '@/lib/api';

const CARD_PACKS = [
    {
        id: 'single-card',
        packType: 'card' as const,
        name: 'Single Card',
        price: 7.99,
        perCard: 7.99,
        cards: 1,
        images: 8,
        songs: 3,
    },
    {
        id: 'four-card-pack',
        packType: 'card' as const,
        name: '4 Card Pack',
        price: 24.99,
        perCard: 6.25,
        cards: 4,
        images: 32,
        songs: 12,
        highlight: true,
        badge: 'Most Popular',
    },
    {
        id: 'five-card-pack',
        packType: 'card' as const,
        name: '5 Card Pack',
        price: 29.99,
        perCard: 6.00,
        cards: 5,
        images: 40,
        songs: 15,
        badge: 'Best Value',
    },
];

interface PricingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    sessionImages?: GeneratedImageRecord[];
    onApprovePrevious?: (image: GeneratedImageRecord) => void;
    onExit?: () => void;
}

export default function PricingPopup({ isOpen, onClose, sessionImages = [], onApprovePrevious, onExit }: PricingPopupProps) {
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [purchaseResult, setPurchaseResult] = useState<string | null>(null);

    const handlePurchase = async (packId: string, packType: 'card' | 'credit') => {
      setPurchasing(packId);
      setPurchaseResult(null);
      try {
        const result = await purchasesApi.createSession({ packType, packId });
        setPurchaseResult(`Credits added! ${result.grantedCredits.image} image, ${result.grantedCredits.song} song credits.`);
        setTimeout(() => {
          onClose();
          setPurchaseResult(null);
        }, 2000);
      } catch (err: any) {
        setPurchaseResult(err?.data?.message || 'Purchase failed. Please try again.');
      } finally {
        setPurchasing(null);
      }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            {/* Content */}
            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 p-8 md:p-12">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 text-gray-400" />
                </button>

                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900">Oops! No Credits Left</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        To continue building your masterpiece, please select a card pack or credit top-up.
                    </p>
                    {purchaseResult && (
                      <p className={`text-sm font-bold ${purchaseResult.includes('Credits added') ? 'text-green-600' : 'text-red-500'}`}>
                        {purchaseResult}
                      </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CARD_PACKS.map((pack, idx) => (
                        <div 
                            key={idx}
                            className={`bg-white rounded-[32px] p-8 flex flex-col justify-between border-2 transition-all hover:scale-[1.02] ${
                                pack.highlight ? 'border-yellow-400 shadow-xl' : 'border-gray-100 shadow-sm'
                            } relative overflow-hidden`}
                            style={{ minHeight: '380px' }}
                        >
                            {pack.badge && (
                                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                                    {pack.badge}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">{pack.name}</h3>
                                <div className="space-y-1 mb-8">
                                    <div className="text-3xl font-black text-gray-900">${pack.price}</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                        CAD ${pack.perCard}/card
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <ImageIcon className="w-3 h-3" /> {pack.images} AI IMAGES
                                    </li>
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Music className="w-3 h-3" /> {pack.songs} AI SONGS
                                    </li>
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                        <Layout className="w-3 h-3" /> {pack.cards} PRINTED CARD
                                    </li>
                                </ul>
                            </div>

                            <button
                              onClick={() => handlePurchase(pack.id, pack.packType)}
                              disabled={purchasing !== null}
                              className={`mt-8 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 ${
                                pack.highlight ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-50 text-gray-400 hover:bg-gray-200'
                              }`}>
                                {purchasing === pack.id ? 'Purchasing...' : 'Select Pack'}
                            </button>
                        </div>
                    ))}
                </div>

                {sessionImages.length > 0 && onApprovePrevious && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Your previous designs</h3>
                    <p className="text-sm text-gray-500 mb-6">Approve an earlier generation instead of buying more credits.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sessionImages.map((img, idx) => (
                        <div key={img.id || idx} className="space-y-3">
                          <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                            {img.imageUrl && (
                              <img src={img.imageUrl} alt={`Design ${idx + 1}`} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <button
                            onClick={() => onApprovePrevious(img)}
                            disabled={purchasing !== null}
                            className="w-full py-2 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                          >
                            Approve This
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-gray-200 text-center space-y-3">
                  <p className="text-sm font-bold text-gray-500">
                    Or invite a friend — both of you earn free credits.
                  </p>
                  <a
                    href="/referral"
                    className="inline-block px-6 py-2.5 rounded-2xl bg-gray-50 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-black transition-all"
                  >
                    Share Your Referral Link
                  </a>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest">Credit tracking in beta — rewards applied retroactively</p>
                </div>

                <div className="mt-12 flex justify-center gap-6">
                    {onExit && (
                      <button
                        onClick={onExit}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600 underline underline-offset-4"
                      >
                        Exit and return to options
                      </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600 underline underline-offset-4"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
