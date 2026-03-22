'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      router.push('/options');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      await refreshUser();
      router.push('/options');
    } catch (err: any) {
      if (err.name === 'UserAlreadyAuthenticatedException') {
        router.push('/options');
      } else {
        console.error('Login error:', err);
        setError(err.message || 'Failed to log in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-2">Log in</h1>
            <p className="text-[#888] text-base md:text-lg">
              Access your cards and continue creating
            </p>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Form */}
            <div className="flex-1 order-2 md:order-1">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-xs font-semibold text-[#111111] uppercase tracking-wider">
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
                      className="w-full px-4 py-3 border border-[#ddd] rounded-[10px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Error Message Display */}
                {error && (
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-[#111111] text-white font-semibold rounded-[10px] hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
            </div>

            {/* Center Divider */}
            <div className="flex flex-row md:flex-col items-center justify-center gap-3 order-3 md:order-2">
              <div className="h-px md:w-px w-full md:h-16 bg-[#eee]"></div>
              <span className="text-[#bbb] text-xs font-bold uppercase px-2">or</span>
              <div className="h-px md:w-px w-full md:h-16 bg-[#eee]"></div>
            </div>

            {/* Right Column - Social Login */}
            <div className="flex-1 order-1 md:order-3 flex flex-col justify-center">
              <SocialLoginButtons />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-[#eee]">
            <p className="text-[#888] text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#111111] hover:text-[#333] font-bold transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}