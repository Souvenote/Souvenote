'use client';

import { useState } from 'react';
import Link from 'next/link';

const CARDS = [
    { id: 1, occasion: 'Birthday' },
    { id: 2, occasion: 'Anniversary' },
    { id: 3, occasion: 'Thank You' },
    { id: 4, occasion: 'Holiday' },
    { id: 5, occasion: 'Just Because' },
];

const VISIBLE = 3;

export default function CardCarousel() {
    const [index, setIndex] = useState(0);
    const max = CARDS.length - VISIBLE;

    return (
        <div className="relative px-10">
            <div className="flex gap-6">
                {CARDS.slice(index, index + VISIBLE).map((card) => (
                    <div key={card.id} className="flex-1 flex flex-col gap-3">
                        {/* Card image placeholder */}
                        <div className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                            </svg>
                        </div>
                        {/* Occasion label + CTA */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                {card.occasion}
                            </span>
                            <Link
                                href="/create"
                                className="text-xs font-medium text-[#111] underline underline-offset-4 hover:text-gray-500 transition-colors"
                            >
                                Make one like this
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Left arrow */}
            <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                aria-label="Previous cards"
                className="absolute left-0 top-[45%] -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {/* Right arrow */}
            <button
                onClick={() => setIndex((i) => Math.min(max, i + 1))}
                disabled={index === max}
                aria-label="Next cards"
                className="absolute right-0 top-[45%] -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: max + 1 }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            i === index ? 'bg-black' : 'bg-gray-300'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
