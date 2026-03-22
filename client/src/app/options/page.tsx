'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Layout, Zap, History, Check, Star, CreditCard, Music, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Simulate credit balance
// const USER_CREDITS = { images: 0, songs: 0 };
// const hasCredits = USER_CREDITS.images > 0 || USER_CREDITS.songs > 0;

const CARD_PACKS = [
    {
        name: 'Single Card',
        price: 8.99,
        perCard: 8.99,
        savings: null,
        cards: 1,
        images: 8,
        songs: 3,
        highlight: false,
    },
    {
        name: '2 Card Pack',
        price: 16.99,
        perCard: 8.50,
        savings: '5.5%',
        cards: 2,
        images: 16,
        songs: 6,
        highlight: false,
    },
    {
        name: '3 Card Pack',
        price: 23.99,
        perCard: 8.00,
        savings: '11.0%',
        cards: 3,
        images: 24,
        songs: 9,
        highlight: false,
    },
    {
        name: '4 Card Pack',
        price: 29.99,
        perCard: 7.50,
        savings: '16.6%',
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
        savings: '22.2%',
        cards: 5,
        images: 40,
        songs: 15,
        highlight: false,
        badge: 'Best Value',
    },
];

const CREDIT_PACKS = [
    {
        name: 'Starter',
        price: 1.69,
        images: 8,
        songs: 3,
        savings: null,
    },
    {
        name: 'Creator',
        price: 2.98,
        images: 16,
        songs: 6,
        savings: '12%',
        highlight: true,
        badge: 'Most Popular',
    },
    {
        name: 'Studio',
        price: 3.87,
        images: 24,
        songs: 9,
        savings: '24%',
    },
];

const TEMPLATE_THUMBNAILS = [
    { name: 'Horoscope', icon: '♈' },
    { name: 'On This Day', icon: '📅' },
    { name: 'Comic Card', icon: '🦸' },
    { name: 'Movie Cover', icon: '🎬' },
    { name: 'Mental Health', icon: '🧠' },
    { name: 'Couples Cards', icon: '❤️' },
];

export default function OptionsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const pricingRef = useRef<HTMLDivElement>(null);

    const userCredits = {
        images: user?.imageCreditBalance ?? 0,
        songs: user?.songCreditBalance ?? 0
    };
    const hasCredits = userCredits.images > 0 || userCredits.songs > 0;

    const scrollToPricing = () => {
        pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOptionClick = (href: string) => {
        if (hasCredits) {
            router.push(href);
        } else {
            scrollToPricing();
        }
    };

    return (
        <main className="min-h-screen bg-white font-sans overflow-x-hidden">
            {/* Options Hero */}
            <section className="px-6 py-20 text-center space-y-4 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                    How do you want to create your card?
                </h1>
                <p className="text-gray-500 text-lg">
                    Because the card you give, should be as unique as they are.
                </p>

                {/* Credits Display */}
                {user && (
                    <div className="pt-6 flex justify-center gap-6">
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900">{userCredits.images} Image Credits</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
                            <Music className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-bold text-purple-900">{userCredits.songs} Song Credits</span>
                        </div>
                    </div>
                )}
            </section>

            {/* Quadrant Layout */}
            <section className="px-6 pb-24 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Personalize a Card Template */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-6">
                            Option 1: Personalize a Card Template
                        </label>
                        <button 
                            onClick={() => handleOptionClick('/cards')}
                            className="w-full h-64 bg-gray-50 border-2 border-transparent hover:border-black rounded-[32px] p-8 flex items-center justify-between transition-all group overflow-hidden relative shadow-sm hover:shadow-xl"
                        >
                            <div className="space-y-2 text-left z-10 max-w-[200px]">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:translate-x-1 transition-transform">Choose a & customize</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">Choice from our library and make it yours.</p>
                                <div className="pt-4">
                                    <span className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Browse Templates
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 w-48 relative">
                                {TEMPLATE_THUMBNAILS.slice(0, 6).map((t, idx) => (
                                    <div key={idx} className="aspect-[5/7] bg-white border border-gray-100 rounded-lg flex items-center justify-center text-xl shadow-sm transform group-hover:-rotate-2 group-hover:scale-105 transition-all" style={{ transitionDelay: `${idx * 30}ms` }}>
                                        {t.icon}
                                    </div>
                                ))}
                            </div>
                        </button>
                    </div>

                    {/* Option 2: Build My Card */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-6">
                            Option 2: Build My Card
                        </label>
                        <button 
                            onClick={() => handleOptionClick('/create')}
                            className="w-full h-64 bg-gray-50 border-2 border-transparent hover:border-black rounded-[32px] p-8 flex items-center justify-between transition-all group overflow-hidden relative shadow-sm hover:shadow-xl"
                        >
                            <div className="space-y-2 text-left z-10 max-w-[200px]">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:translate-x-1 transition-transform">Start from scratch</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">Answer a few questions and AI will generate.</p>
                                <div className="pt-4">
                                    <span className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Start Generating
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-48">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Option 3: Ready to Send */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-6">
                            Option 3: Ready to Send
                        </label>
                        <button 
                            onClick={() => handleOptionClick('/cards?ready=true')}
                            className="w-full h-64 bg-gray-50 border-2 border-transparent hover:border-black rounded-[32px] p-8 flex items-center justify-between transition-all group overflow-hidden relative shadow-sm hover:shadow-xl"
                        >
                            <div className="space-y-2 text-left z-10 max-w-[200px]">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:translate-x-1 transition-transform">Quick & Easy</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">No customization required. Just add a message.</p>
                                <div className="pt-4">
                                    <span className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Ready Cards
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-48 gap-3">
                                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                    <Zap className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-xs font-bold text-gray-900">Instant Access</p>
                                    <p className="text-[10px] text-gray-400">Pre-designed</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Option 4: My Cards & Songs */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-6">
                            Option 4: My Cards & Songs
                        </label>
                        <button 
                            onClick={() => router.push('/my-cards')}
                            className="w-full h-64 bg-gray-50 border-2 border-transparent hover:border-black rounded-[32px] p-8 flex items-center justify-between transition-all group overflow-hidden relative shadow-sm hover:shadow-xl"
                        >
                            <div className="space-y-2 text-left z-10 max-w-[200px]">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:translate-x-1 transition-transform">Resume Progress</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">View your started cards and songs.</p>
                                <div className="pt-4">
                                    <span className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open Dashboard
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-48">
                                <div className="w-40 h-28 bg-white rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-gray-100 transition-colors border border-gray-100 rotate-2">
                                    <History className="w-8 h-8 text-gray-200" />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </section>


            {/* Pricing Section */}
            <div ref={pricingRef} id="pricing" className="bg-gray-50 py-24 px-6 border-t border-gray-100 scroll-mt-20">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold text-gray-900">Card Packs</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Pay $8.99 only if you love your card. Otherwise, you're charged $1.69 for AI credits. Shipping $1.24 per card (not included).
                        </p>
                    </div>

                    {/* Card Packs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {CARD_PACKS.map((pack, idx) => (
                            <div 
                                key={idx}
                                className={`bg-white rounded-[24px] p-6 flex flex-col justify-between border-2 transition-all hover:scale-[1.02] ${
                                    pack.highlight ? 'border-yellow-400 shadow-xl' : 'border-gray-100 shadow-sm'
                                } relative overflow-hidden h-[400px]`}
                            >

                                {pack.badge && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        {pack.badge}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">{pack.name}</h3>
                                    <div className="space-y-1 mb-8">
                                        <div className="text-4xl font-black text-gray-900">${pack.price}</div>
                                        <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                                            CAD ${pack.perCard}/card
                                        </div>
                                        {pack.savings && (
                                            <div className="text-xs font-bold text-green-500 uppercase tracking-widest">
                                                SAVE {pack.savings}
                                            </div>
                                        )}
                                    </div>

                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-xs font-bold text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center">
                                                <ImageIcon className="w-3 h-3" />
                                            </div>
                                            {pack.images} AI IMAGES
                                        </li>
                                        <li className="flex items-center gap-3 text-xs font-bold text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Music className="w-3 h-3" />
                                            </div>
                                            {pack.songs} AI SONGS
                                        </li>
                                        <li className="flex items-center gap-3 text-xs font-bold text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Layout className="w-3 h-3" />
                                            </div>
                                            {pack.cards} PRINTED CARD
                                        </li>
                                    </ul>
                                </div>

                                <button className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                    pack.highlight ? 'bg-black text-white hover:bg-gray-800 shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-200'
                                }`}>
                                    Select Pack
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* AI Credit Packs */}
                    <div className="pt-20 border-t border-gray-200">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl font-bold text-gray-900">AI Credit Packs</h2>
                            <p className="text-gray-500">Design First, Decide Later. Your creations are saved for 30 days.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {CREDIT_PACKS.map((pack, idx) => (
                                <div 
                                    key={idx}
                                    className={`bg-white rounded-[32px] p-8 border-2 transition-all hover:shadow-lg ${
                                        pack.highlight ? 'border-black shadow-xl' : 'border-transparent shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">{pack.name}</h3>
                                        {pack.badge && (
                                            <span className="bg-black text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                                                {pack.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-8">
                                        <div className="text-3xl font-black text-gray-900">${pack.price}</div>
                                        {pack.savings && (
                                            <div className="text-xs font-bold text-green-500 uppercase tracking-widest mt-1">
                                                {pack.savings} SAVINGS
                                            </div>
                                        )}
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <Check className="w-4 h-4 text-green-500" /> {pack.images} AI IMAGES
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <Check className="w-4 h-4 text-green-500" /> {pack.songs} AI SONGS
                                        </li>
                                    </ul>
                                    <button className="w-full py-3 bg-gray-50 hover:bg-black hover:text-white transition-all rounded-xl text-xs font-bold uppercase tracking-widest">
                                        Select Credits
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
