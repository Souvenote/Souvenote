'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPassword, confirmResetPassword } from '@/lib/auth';

type Step = 'request' | 'confirm';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setStep('confirm');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await confirmResetPassword(email, code, newPassword);
      window.location.href = '/login?reset=true';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#111111]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 text-sm">
        <div className="font-bold text-lg tracking-tight">
          <Link href="/">Souvenote</Link>
        </div>
      </header>

      <main className="grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-[400px] bg-white p-8 border border-gray-100 rounded-xl shadow-sm">

          {step === 'request' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-semibold mb-2">Forgot password</h1>
                <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send you a reset code</p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </form>

              <div className="text-center mt-6 text-sm text-gray-500">
                <Link href="/login" className="text-[#111111] font-medium hover:underline">Back to log in</Link>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-semibold mb-2">Reset password</h1>
                <p className="text-gray-500 text-sm">
                  Enter the code sent to <span className="font-medium text-[#111111]">{email}</span>
                </p>
              </div>

              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="code">Verification code</label>
                  <input
                    type="text"
                    id="code"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); if (error) setError(''); }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-lg placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-center tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="newPassword">New password</label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">Confirm new password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>

              <div className="text-center mt-6 text-sm text-gray-500">
                <button
                  onClick={() => setStep('request')}
                  className="text-[#111111] font-medium hover:underline"
                >
                  Try a different email
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
