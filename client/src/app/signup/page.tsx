'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, confirmSignUp } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import SocialLoginButtons from '@/app/components/SocialLoginButtons';

type Step = 'form' | 'confirm';

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('form');

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/cards');
    }
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [confirmationCode, setConfirmationCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.fullName);
      setStep('confirm');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp(formData.email, confirmationCode);
      router.push('/login?verified=true');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
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

      <main className="grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">

          {step === 'form' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-semibold mb-2">Sign up</h1>
                <p className="text-gray-500 text-sm">Create your account and start designing</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="fullName">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">Confirm password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">or</span>
                </div>
              </div>

              <SocialLoginButtons />

              <div className="text-center mt-6 text-sm text-gray-500">
                Already have an account? <Link href="/login" className="text-[#111111] font-medium hover:underline">Log in</Link>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-semibold mb-2">Check your email</h1>
                <p className="text-gray-500 text-sm">
                  We sent a verification code to <span className="font-medium text-[#111111]">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="code">Verification code</label>
                  <input
                    type="text"
                    id="code"
                    placeholder="Enter 6-digit code"
                    value={confirmationCode}
                    onChange={(e) => {
                      setConfirmationCode(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-lg placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-center tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify account'}
                </button>
              </form>

              <div className="text-center mt-6 text-sm text-gray-500">
                Didn&apos;t receive a code?{' '}
                <button
                  onClick={() => setStep('form')}
                  className="text-[#111111] font-medium hover:underline"
                >
                  Try again
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
