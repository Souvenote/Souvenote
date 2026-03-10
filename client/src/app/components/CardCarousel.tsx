'use client';

import { useState } from 'react';
import Link from 'next/link';

const CARDS = [
    { id: 1, occasion: 'Birthday', songTitle: 'Happy Birthday Song' },
    { id: 2, occasion: 'Anniversary', songTitle: 'Our Special Day' },
    { id: 3, occasion: 'Thank You', songTitle: 'Gratitude Melody' },
    { id: 4, occasion: 'Holiday', songTitle: 'Holiday Cheer' },
    { id: 5, occasion: 'Just Because', songTitle: 'Thinking of You' },
];

const VISIBLE = 3;

export default function CardCarousel() {
    const [index, setIndex] = useState(0);
    const [playingId, setPlayingId] = useState<number | null>(null);
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

                        {/* Occasion label */}
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                            {card.occasion}
                        </span>

                        {/* Song preview */}
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                            <button
                                onClick={() => setPlayingId(playingId === card.id ? null : card.id)}
                                aria-label={playingId === card.id ? 'Pause' : 'Play song preview'}
                                className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-800 transition-colors"
                            >
                                {playingId === card.id ? (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{card.songTitle}</p>
                                {/* Waveform placeholder */}
                                <div className="flex items-end gap-px h-3 mt-0.5">
                                    {[4, 8, 6, 11, 3, 9, 5, 12, 7, 4, 10, 6, 3, 8, 11, 5, 7, 4, 9, 6].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-px bg-gray-300 rounded-full"
                                            style={{ height: `${h}px` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href="/create"
                            className="text-xs font-medium text-[#111] underline underline-offset-4 hover:text-gray-500 transition-colors px-1"
                        >
                            Make one like this →
                        </Link>
                    </div>
                ))}
            </div>

            {/* Left arrow */}
            <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                aria-label="Previous cards"
                className="absolute left-0 top-[40%] -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
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
                className="absolute right-0 top-[40%] -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
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
