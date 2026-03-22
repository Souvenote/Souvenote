'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmSignUp } from '@/lib/auth';

function ConfirmSignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await confirmSignUp(email, code);
      setSuccess(true);
      setTimeout(() => {
        router.push('/post-signup');
      }, 3000);
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
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

      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-[400px] bg-white p-8 border border-gray-100 rounded-xl shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold mb-2">Verify email</h1>
            <p className="text-gray-500 text-sm">Enter the code sent to {email || 'your email'}</p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm font-medium">
                Email verified successfully! Redirecting to login...
              </div>
              <Link href="/login" className="text-[#111111] font-medium hover:underline text-sm block">
                Click here if not redirected
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="email">Email address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="code">Verification code</label>
                <input 
                  type="text" 
                  id="code" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code" 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium">{error}</p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2 disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          )}

          <div className="text-center mt-6 text-sm text-gray-500">
            Didn't receive a code? <button type="button" className="text-[#111111] font-medium hover:underline">Resend</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmSignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmSignUpContent />
    </Suspense>
  );
}
