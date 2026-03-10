'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PricingModal from '../components/PricingModal';

// Simulate credit balance — swap this with real auth/credits context when backend is ready
const USER_CREDITS = { images: 0, songs: 0 };

const hasCredits = USER_CREDITS.images > 0 || USER_CREDITS.songs > 0;

const OPTIONS = [
    {
        label: 'Personalize a Card Template',
        description: 'Choose a design and customize it your way.',
        href: '/cards',
        thumbnails: ['Horoscope', 'On This Day', 'Birthday', 'Anniversary'],
    },
    {
        label: 'Build My Card',
        description: 'Answer a few questions and AI will generate your design.',
        href: '/create',
        thumbnails: null,
    },
];

export default function OptionsPage() {
    const router = useRouter();
    const [showPricing, setShowPricing] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    function handleOptionClick(href: string) {
        if (hasCredits) {
            router.push(href);
        } else {
            setPendingHref(href);
            setShowPricing(true);
        }
    }

    function handleModalClose() {
        setShowPricing(false);
        if (pendingHref) {
            router.push(pendingHref);
            setPendingHref(null);
        }
    }

    return (
        <>
            {showPricing && <PricingModal onClose={handleModalClose} />}

            <main className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center px-6 py-16 bg-white">
                <div className="w-full max-w-3xl space-y-10">

                    {/* Heading */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">What would you like to do?</h1>
                        <p className="text-gray-500 text-sm">Pick an option to get started.</p>
                    </div>

                    {/* Two large portrait option buttons */}
                    <div className="grid grid-cols-2 gap-6">
                        {OPTIONS.map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => handleOptionClick(opt.href)}
                                className="group flex flex-col rounded-2xl border-2 border-gray-200 hover:border-black transition-all text-left overflow-hidden"
                                style={{ aspectRatio: '5/7' }}
                            >
                                {/* Visual area */}
                                <div className="flex-1 bg-gray-50 flex items-center justify-center p-4">
                                    {opt.thumbnails ? (
                                        /* Mini card thumbnails grid */
                                        <div className="grid grid-cols-2 gap-2 w-full max-w-[180px]">
                                            {opt.thumbnails.map((name) => (
                                                <div
                                                    key={name}
                                                    className="aspect-[5/7] bg-white border border-gray-200 rounded-lg flex items-end p-1.5 shadow-sm"
                                                >
                                                    <span className="text-[8px] text-gray-400 font-medium leading-tight">
                                                        {name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Build My Card visual */
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-400">AI-powered</span>
                                        </div>
                                    )}
                                </div>

                                {/* Label + description */}
                                <div className="px-5 py-4 bg-white border-t border-gray-100 space-y-1">
                                    <p className="font-semibold text-sm group-hover:text-black transition-colors">
                                        {opt.label}
                                    </p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* My Cards & Songs link */}
                    <div className="text-center">
                        <Link
                            href="/my-cards"
                            className="text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-4"
                        >
                            My Cards &amp; Songs
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">View your saved designs and songs</p>
                    </div>
                </div>
            </main>
        </>
    );
}
