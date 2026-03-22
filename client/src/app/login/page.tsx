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
  const { refreshUser } = useAuth();
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
        setInfo('Your account still needs email confirmation. Finish signup first, then log in.');
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
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#111111]">
      
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 text-sm">
        <div className="font-bold text-lg tracking-tight">
          <Link href="/">Souvenote</Link>
        </div>
      </header>

      {/* MAIN CONTENT - LOG IN FORM */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-[400px] bg-white p-8 border border-gray-100 rounded-xl shadow-sm">
          
          {/* Title and Subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold mb-2">Log in</h1>
            <p className="text-gray-500 text-sm">Access your cards and continue creating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address Input */}
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

            {/* Password Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-sm font-medium">
              <Link href="/forgot-password" className="text-gray-500 hover:text-[#111111] transition-colors">
                Forgot password?
              </Link>
            </div>

            {info && (
              <p className="text-emerald-600 text-xs font-medium leading-relaxed">{info}</p>
            )}

            {error && (
              <p className="text-red-500 text-xs font-medium">{error}</p>
            )}

            {/* Log In Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : 'Log in'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6 text-sm text-gray-500">
            Don't have an account? <Link href="/signup" className="text-[#111111] font-medium hover:underline">Sign up</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
