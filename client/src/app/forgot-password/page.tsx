'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Connect to backend password reset endpoint
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-[#111111]">
            <header className="flex items-center px-6 py-4 border-b border-gray-100 text-sm">
                <div className="font-bold text-lg tracking-tight">
                    <Link href="/">Souvenote</Link>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
                <div className="w-full max-w-[400px] bg-white p-8 border border-gray-100 rounded-xl shadow-sm">

                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-semibold">Check your email</h1>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We&apos;ve sent a password reset link to <span className="font-medium text-black">{email}</span>. Check your inbox and follow the instructions.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block mt-2 text-sm font-medium text-[#111111] underline underline-offset-4 hover:text-gray-500 transition-colors"
                            >
                                Return to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-semibold mb-2">Forgot password</h1>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Enter your email address and we&apos;ll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="email">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#111111] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Send reset link
                                </button>
                            </form>

                            <p className="text-center mt-6 text-sm text-gray-500">
                                <Link href="/login" className="text-[#111111] font-medium hover:underline">
                                    Return to login
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
