'use client';

import React from 'react';
import Link from 'next/link';

export default function PostSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-[500px] bg-white rounded-[18px] shadow-lg overflow-hidden p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center text-green-600">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">Welcome to Souvenote!</h1>
        <p className="text-gray-600 mb-8">
          Your account has been successfully verified.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-4">Your Starter Gifts</h2>
          <div className="flex justify-around gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-2">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[#111111]">1</span>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Free Image</span>
            </div>
            <div className="w-px h-12 bg-gray-200 self-center"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-2">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[#111111]">1</span>
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Free Song</span>
            </div>
          </div>
        </div>

        <Link 
          href="/options" 
          className="block w-full bg-[#111111] text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
        >
          Start Creating
        </Link>
      </div>
    </div>
  );
}
