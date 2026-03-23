'use client';

import React from 'react';
import { X, Check, Image as ImageIcon, Music, Layout, Star } from 'lucide-react';

const CARD_PACKS = [
    {
        name: 'Single Card',
        price: 8.99,
        perCard: 8.99,
        cards: 1,
        images: 8,
        songs: 3,
    },
    {
        name: '4 Card Pack',
        price: 29.99,
        perCard: 7.50,
        cards: 4,
        images: 32,
        songs: 12,
        highlight: true,
        badge: 'Most Popular',
    },
    {
        name: '5 Card Pack',
        price: 34.99,
        perCard: 7.00,
        cards: 5,
        images: 40,
        songs: 15,
        badge: 'Best Value',
    },
];

interface PricingPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingPopup({ isOpen, onClose }: PricingPopupProps) {
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

                            <button className={`mt-8 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                pack.highlight ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-50 text-gray-400 hover:bg-gray-200'
                            }`}>
                                Select Pack
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
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
