'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
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
  const [error, setError] = useState<React.ReactNode>('');

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

    setIsLoading(true);
    setError('');

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      router.push(`/confirm-signup?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.name === 'UsernameExistsException') {
        setError(
          <span>
            Username already exists. <Link href="/login" className="underline font-bold">Login instead?</Link>
          </span>
        );
      } else {
        setError(err.message || 'Failed to sign up. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-[820px] bg-white rounded-[18px] shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <div className="w-12 h-12 bg-[#111111] rounded-lg mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl">
              SN
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-2">Sign up</h1>
            <p className="text-[#888] text-base md:text-lg">
              <span className="block">Try it free.</span>
              <span className="block text-sm md:text-base">Generate one image and one song on us.</span>
            </p>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Form */}
            <div className="flex-1 order-2 md:order-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-2">
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
                    className="w-full px-4 py-3 border border-[#ddd] rounded-[10px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-2">
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
                    className="w-full px-4 py-3 border border-[#ddd] rounded-[10px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-2">
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
                    className="w-full px-4 py-3 border border-[#ddd] rounded-[10px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider mb-2">
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
                    className="w-full px-4 py-3 border border-[#ddd] rounded-[10px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                  />
                </div>

                {/* Error Message Display */}
                {error && (
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 py-3 bg-[#111111] text-white font-semibold rounded-[10px] hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </button>

                {/* Terms */}
                <p className="text-[10px] md:text-xs text-[#888] text-center mt-4 leading-relaxed">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-[#111111] font-semibold hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#111111] font-semibold hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>

            {/* Center Divider */}
            <div className="flex flex-row md:flex-col items-center justify-center gap-3 order-3 md:order-2">
              <div className="h-px md:w-px w-full md:h-16 bg-[#eee]"></div>
              <span className="text-[#bbb] text-xs font-bold uppercase px-2">or</span>
              <div className="h-px md:w-px w-full md:h-16 bg-[#eee]"></div>
            </div>

            {/* Right Column - Social Signup */}
            <div className="flex-1 order-1 md:order-3 flex flex-col justify-center">
              <SocialLoginButtons />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-[#eee]">
            <p className="text-[#888] text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#111111] hover:text-[#333] font-bold transition">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}