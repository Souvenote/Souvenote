'use client';

import { useEffect, useState } from 'react';

export default function WelcomePopup() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem('cards_welcome_seen');
        if (!seen) setVisible(true);
    }, []);

    const dismiss = () => {
        localStorage.setItem('cards_welcome_seen', 'true');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
                <h3 className="font-bold text-lg">Welcome to Cards!</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Personalize your card for free by uploading a photo and caption. We&apos;ll handle the rest.
                </p>
                <button
                    onClick={dismiss}
                    className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
