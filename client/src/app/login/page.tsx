'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import SocialLoginButtons from '@/app/components/SocialLoginButtons';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const isReset = searchParams.get('reset') === 'true';
  const verified = searchParams.get('verified') === 'true';

  useEffect(() => {
    if (!authLoading && user && isReset) {
      signOut().then(() => refreshUser());
    } else if (!authLoading && user && !isReset) {
      router.replace('/');
    }
  }, [user, authLoading, isReset, router, refreshUser]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      await refreshUser();
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
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
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold mb-2">Log in</h1>
            <p className="text-gray-500 text-sm">Access your cards and continue creating</p>
          </div>

          {verified && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 text-center">
              Email verified! You can now log in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                required
              />
            </div>

            <div className="text-sm font-medium">
              <Link href="/forgot-password" className="text-gray-500 hover:text-[#111111] transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log in'}
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
            Don&apos;t have an account? <Link href="/signup" className="text-[#111111] font-medium hover:underline">Sign up</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
