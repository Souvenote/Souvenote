'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    console.log('Frontend Validation Passed. Ready for AWS backend:', formData);
     // TODO Task: Connect to AWS Cognito/Backend, we need to get some knowledge about AWS Cognito for Auth. 
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#111111]">

        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 text-sm">
        <div className="font-bold text-lg tracking-tight">
          <Link href="/">Souvenote</Link>
        </div>
      </header>
      
      {/* MAIN CONTENT - SIGN UP FORM */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold mb-2">Sign up</h1>
            <p className="text-gray-500 text-sm">Create your account and start designing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
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

            {/* Email Address */}
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

            {/* Password */}
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

            {/* Confirm Password */}
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

            {/* Error Message Display */}
            {error && (
              <p className="text-red-500 text-xs font-medium">{error}</p>
            )}

            {/* Sign Up Button */}
            <button 
              type="submit" 
              className="w-full bg-[#111111] text-white py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-2"
            >
              Sign up
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-[#111111] font-medium hover:underline">Log in</Link>
          </div>
        </div>
      </main>

    </div>
  );
}