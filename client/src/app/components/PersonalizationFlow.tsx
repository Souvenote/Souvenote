'use client';

import { useState } from 'react';
import type { CardFormat } from './FormatModal';

const FONT_STYLES = [
    'Classic Serif',
    'Elegant Script',
    'Modern Sans',
    'Handwritten',
    'Playful',
];

interface Props {
    open: boolean;
    format: CardFormat | null;
    onClose: () => void;
    onComplete: () => void;
}

export default function PersonalizationFlow({ open, format, onClose, onComplete }: Props) {
    const [step, setStep] = useState(1);
    const [photo, setPhoto] = useState<File | null>(null);
    const [attested, setAttested] = useState(false);
    const [name, setName] = useState('');
    const [caption, setCaption] = useState('');
    const [message, setMessage] = useState('');
    const [fontStyle, setFontStyle] = useState('Classic Serif');

    if (!open) return null;

    const reset = () => {
        setStep(1);
        setPhoto(null);
        setAttested(false);
        setName('');
        setCaption('');
        setMessage('');
        setFontStyle('Classic Serif');
        onClose();
    };

    const STEP_LABELS = ['Photo', 'Rights', 'Text', 'Confirm'];

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                                    s <= step ? 'bg-black' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-400">
                        Step {step} of 4 — {STEP_LABELS[step - 1]}
                        {format && (
                            <span className="ml-2 font-medium text-gray-600">
                                · {format === 'physical' ? 'Physical CDN $9.99' : 'Digital CDN $2.99'}
                            </span>
                        )}
                    </p>
                </div>

                {/* ── Step 1: Photo Upload ── */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="text-center space-y-1.5">
                            <h3 className="font-bold text-lg">Upload your photo</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Upload your photo to remix in this card style.
                                We&apos;ll do the rest and send it off in 48 hours.
                            </p>
                        </div>

                        <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                            />
                            {photo ? (
                                <div className="space-y-1">
                                    <svg className="w-8 h-8 text-black mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-medium">{photo.name}</p>
                                    <p className="text-xs text-gray-400">Click to change</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <svg className="w-8 h-8 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    <p className="text-sm text-gray-400">JPG, PNG · max 10MB</p>
                                </div>
                            )}
                        </label>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!photo}
                            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Upload Photo
                        </button>
                    </div>
                )}

                {/* ── Step 2: Attestation ── */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="text-center space-y-1.5">
                            <h3 className="font-bold text-lg">Confirm Image Rights</h3>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={attested}
                                onChange={(e) => setAttested(e.target.checked)}
                                className="mt-0.5 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 leading-relaxed">
                                I confirm I have the legal right to upload and use this image and that it does not infringe on any third-party rights.
                            </span>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setStep(3)}
                                className="border border-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Skip — Customize Text
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!attested}
                                className="bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Name & Caption ── */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="text-center space-y-1.5">
                            <h3 className="font-bold text-lg">Customize Text</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Enter the name or caption for this card. We&apos;ll do the rest and send it off in 48 hours.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sarah"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Caption</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Happy Birthday!"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Add Personal Message</label>
                                <textarea
                                    placeholder="Write a message for inside the card..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Font Style</label>
                                <select
                                    value={fontStyle}
                                    onChange={(e) => setFontStyle(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
                                >
                                    {FONT_STYLES.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(4)}
                            disabled={!name && !caption}
                            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* ── Step 4: Confirmation ── */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg">Ready to proceed?</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Your personalized card will be created and sent off within 48 hours.
                                You&apos;ll now proceed to Music Generation.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setStep(3)}
                                className="border border-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => { onComplete(); reset(); }}
                                className="bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                            >
                                Confirm & Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Cancel link (steps 1–3 only) */}
                {step < 4 && (
                    <button
                        onClick={reset}
                        className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
