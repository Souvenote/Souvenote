'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import WelcomePopup from '../components/WelcomePopup';
import FormatModal, { type CardAction, type CardFormat } from '../components/FormatModal';
import PersonalizationFlow from '../components/PersonalizationFlow';

const FILTERS = ['Birthday', 'Anniversary', 'Wedding', 'Thank You', 'Holiday'];

const CARDS = [
    { id: 1, occasion: 'Birthday' },
    { id: 2, occasion: 'Anniversary' },
    { id: 3, occasion: 'Wedding' },
    { id: 4, occasion: 'Thank You' },
    { id: 5, occasion: 'Holiday' },
    { id: 6, occasion: 'Just Because' },
];

function ImagePlaceholder({ className }: { className?: string }) {
    return (
        <svg className={className ?? 'w-8 h-8 text-gray-300'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    );
}

export default function CardsPage() {
    const router = useRouter();

    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [formatModalOpen, setFormatModalOpen] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<CardFormat | null>(null);
    const [personalizationOpen, setPersonalizationOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const pendingActionRef = useRef<CardAction | null>(null);

    const filteredCards = CARDS.filter((c) => {
        const matchesFilter = !activeFilter || c.occasion === activeFilter;
        const matchesSearch = !search || c.occasion.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleAction = (action: CardAction) => {
        if (action === 'build') {
            router.push('/create');
            return;
        }
        pendingActionRef.current = action;
        setFormatModalOpen(true);
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleFormatSelect = (format: CardFormat) => {
        setSelectedFormat(format);
        setFormatModalOpen(false);
        if (pendingActionRef.current === 'personalize') {
            setPersonalizationOpen(true);
        } else {
            // Select as Is — show confirmation toast (cart coming soon)
            const label = format === 'physical' ? 'Physical card (CDN $9.99)' : 'Digital card (CDN $2.99)';
            showToast(`${label} added! Checkout coming soon.`);
        }
    };

    return (
        <>
            {/* Toast notification */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-5 py-3 rounded-full shadow-lg z-50 transition-all">
                    {toast}
                </div>
            )}

            <WelcomePopup />

            <FormatModal
                open={formatModalOpen}
                onClose={() => setFormatModalOpen(false)}
                onSelect={handleFormatSelect}
            />

            <PersonalizationFlow
                open={personalizationOpen}
                format={selectedFormat}
                onClose={() => setPersonalizationOpen(false)}
                onComplete={() => {
                    setPersonalizationOpen(false);
                    // TODO: navigate to music generation
                    router.push('/create');
                }}
            />

            <main className="max-w-6xl mx-auto px-6 py-10 text-[#111111]">

                {/* ── Search + Filters ───────────────────────────── */}
                <div className="space-y-4 mb-10">
                    <div className="relative max-w-sm">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search cards..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    activeFilter === f
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Pricing note ──────────────────────────────── */}
                <div className="mb-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
                    <span><span className="font-medium text-black">Select as Is</span> — base price only</span>
                    <span><span className="font-medium text-black">Personalize</span> — free · photo + caption remix in 48hrs</span>
                    <span><span className="font-medium text-black">Build My Own</span> — uses AI credits</span>
                </div>

                {/* ── Cards Grid ────────────────────────────────── */}
                {filteredCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {filteredCards.map((card) => (
                            <div key={card.id} className="space-y-4">
                                {/* Occasion label */}
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                    {card.occasion}
                                </p>

                                {/* Physical + Digital previews */}
                                <div className="flex gap-4 items-end">
                                    {/* Physical 5×7 — smaller, sits beside digital */}
                                    <div className="w-28 space-y-1.5 shrink-0">
                                        <span className="text-xs text-gray-400 font-medium">Physical</span>
                                        <div className="aspect-[5/7] bg-gray-100 rounded-xl flex items-center justify-center">
                                            <ImagePlaceholder className="w-7 h-7 text-gray-300" />
                                        </div>
                                        <span className="text-xs text-gray-400">5 × 7</span>
                                    </div>

                                    {/* Digital 9×16 — taller, more prominent */}
                                    <div className="flex-1 space-y-1.5">
                                        <span className="text-xs text-gray-400 font-medium">Digital</span>
                                        <div className="aspect-[9/16] bg-gray-100 rounded-xl flex items-center justify-center">
                                            <ImagePlaceholder className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <span className="text-xs text-gray-400">9 × 16</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction('select')}
                                        className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-medium hover:bg-gray-900 transition-colors"
                                    >
                                        Select as is
                                    </button>
                                    <button
                                        onClick={() => handleAction('personalize')}
                                        className="flex-1 border border-gray-300 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Personalize
                                    </button>
                                    <button
                                        onClick={() => handleAction('build')}
                                        className="flex-1 border border-gray-300 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Build My Own
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-sm">No cards found for &quot;{search || activeFilter}&quot;</p>
                        <button
                            onClick={() => { setSearch(''); setActiveFilter(null); }}
                            className="mt-3 text-xs underline underline-offset-4 hover:text-gray-600 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </main>
        </>
    );
}
