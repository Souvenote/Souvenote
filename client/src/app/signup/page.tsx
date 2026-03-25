'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signUp,
  isAuthConfigured,
  getAuthConfigErrorMessage,
  getAuthErrorMessage,
} from '@/lib/auth';
import SocialLoginButtons from '../components/SocialLoginButtons';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!isAuthConfigured()) {
      setError(getAuthConfigErrorMessage());
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signUp(formData.email, formData.password, formData.fullName);

      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        router.push(`/confirm-signup?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      router.push('/login');
    } catch (signupError) {
      setError(getAuthErrorMessage(signupError));
    } finally {
      setIsLoading(false);
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
            <h1 className="mb-2 text-3xl font-bold text-[#1a1a1a] md:text-4xl">Sign up</h1>
            <p className="text-base text-[#888] md:text-lg">
              <span className="block">Try it free.</span>
              <span className="block text-sm md:text-base">Generate one image and one song on us.</span>
            </p>
          </div>

          <div className="flex flex-col gap-8 md:flex-row">
            <div className="order-2 flex-1 md:order-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[10px] border border-[#ddd] px-4 py-3 text-[#1a1a1a] placeholder-[#bbb] transition focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                </div>

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
                  <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[10px] border border-[#ddd] px-4 py-3 text-[#1a1a1a] placeholder-[#bbb] transition focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[10px] border border-[#ddd] px-4 py-3 text-[#1a1a1a] placeholder-[#bbb] transition focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                </div>

                {error && <p className="text-xs font-medium text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full rounded-[10px] bg-[#111111] py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </button>

                <p className="mt-4 text-center text-[10px] leading-relaxed text-[#888] md:text-xs">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="font-semibold text-[#111111] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-[#111111] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
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
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#111111] transition hover:text-[#333]">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
