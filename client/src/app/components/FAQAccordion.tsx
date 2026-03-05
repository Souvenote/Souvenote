'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
    {
        q: 'How much does a card cost?',
        a: 'Digital cards start at $2.99 CAD. Physical cards with shipping start at $9.99 CAD. Your first creation — one image and one song — is included free when you sign up.',
    },
    {
        q: 'Can I edit my card after sending?',
        a: 'Once a card is sent to print, edits are not possible. You can preview everything thoroughly before confirming your order, so take your time.',
    },
    {
        q: "What if the AI image isn't right?",
        a: "No problem. Your first creation includes one free image. If you want to revise, a small credit fee applies — we place a temporary hold and only charge for what you use. Unused credits are returned automatically.",
    },
    {
        q: 'How long does printing and delivery take?',
        a: 'Cards are printed and dispatched within 1–2 business days. Estimated delivery time is shown at checkout based on your location.',
    },
    {
        q: 'Can I send a digital card instead?',
        a: 'Yes! Digital cards (9:16 format) are delivered via email or SMS at $2.99 CAD, with your personalized song included as a link inside.',
    },
];

export default function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map(({ q, a }, i) => (
                <div key={q}>
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium hover:text-gray-600 transition-colors"
                    >
                        <span>{q}</span>
                        <svg
                            className={`w-4 h-4 flex-shrink-0 ml-4 transition-transform duration-200 ${
                                openIndex === i ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {openIndex === i && (
                        <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
