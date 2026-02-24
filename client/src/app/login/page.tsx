'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login credentials ready for backend:', formData);
    // TODO: Connect to AWS Cognito for actual authentication
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

            {/* Forgot Password Link */}
            <div className="text-sm font-medium">
              <Link href="/forgot-password" className="text-gray-500 hover:text-[#111111] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Log In Button */}
            <button 
              type="submit" 
              className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2"
            >
              Log in
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