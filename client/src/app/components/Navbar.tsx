'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Hide the Navbar on these specific pages
  if (pathname === '/signup' || pathname === '/login') {
    return null; 
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 text-sm bg-white text-[#111111] font-sans">
      <div className="font-bold text-lg tracking-tight">
        <Link href="/">Souvenote</Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <Link href="/create" className="hover:text-gray-500 transition-colors">Create</Link>
        <button className="flex items-center hover:text-gray-500 transition-colors">
          Cards 
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </nav>

      <div className="flex items-center space-x-6 text-sm">
        <span className="hidden sm:inline">Credits 10</span>
        <span className="hidden sm:inline text-gray-400">CAD</span>
        <span className="hidden sm:inline text-gray-400">ENG</span>

        {/* Profile icon */}
        <button aria-label="Profile" className="hidden sm:inline-flex hover:text-gray-500 transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </button>

        <button aria-label="Cart" className="hover:text-gray-500 transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0L5.4 19h13.2M7 13l-1.6 6m10.6 0a2 2 0 100-4 2 2 0 000 4zM7 21a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
        </button>
        
        <button aria-label="Menu" className="hover:text-gray-500 transition-colors">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}