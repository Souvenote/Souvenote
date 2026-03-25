'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signIn,
  isAuthConfigured,
  getAuthConfigErrorMessage,
  getAuthErrorMessage,
} from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import SocialLoginButtons from '../components/SocialLoginButtons';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (info) setInfo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      router.push('/options');
      return;
    }

    if (!isAuthConfigured()) {
      setError(getAuthConfigErrorMessage());
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.isSignedIn) {
        await refreshUser();
        router.push('/options');
        router.refresh();
        return;
      }

      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        router.push(`/confirm-signup?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      setInfo('Additional sign-in steps are required in Cognito before this account can continue.');
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-[820px] overflow-hidden rounded-[18px] bg-white shadow-lg">
        <div className="p-8 md:p-12">
          <div className="mb-10 text-center md:mb-12">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#111111] text-xl font-bold text-white">
              SN
            </div>
            <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a] md:text-4xl">Log in</h1>
            <p className="text-base text-[#888] md:text-lg">
              Access your cards and continue creating
            </p>
          </div>

          <div className="flex flex-col gap-8 md:flex-row">
            <div className="order-2 flex-1 md:order-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[10px] border border-[#ddd] px-4 py-3 text-[#1a1a1a] placeholder-[#bbb] transition focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#111111]">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs font-semibold text-[#888] hover:text-[#111111]">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[10px] border border-[#ddd] px-4 py-3 text-[#1a1a1a] placeholder-[#bbb] transition focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((open) => !open)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {info && <p className="text-xs font-medium text-emerald-600">{info}</p>}
                {error && <p className="text-xs font-medium text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-[10px] bg-[#111111] py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
            </div>

            <div className="order-3 flex flex-row items-center justify-center gap-3 md:order-2 md:flex-col">
              <div className="h-px w-full bg-[#eee] md:h-16 md:w-px"></div>
              <span className="px-2 text-xs font-bold uppercase text-[#bbb]">or</span>
              <div className="h-px w-full bg-[#eee] md:h-16 md:w-px"></div>
            </div>

            <div className="order-1 flex flex-1 flex-col justify-center md:order-3">
              <SocialLoginButtons />
            </div>
          </div>

          <div className="mt-12 border-t border-[#eee] pt-8 text-center">
            <p className="text-sm text-[#888]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-bold text-[#111111] transition hover:text-[#333]">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
