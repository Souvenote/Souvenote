'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const hiddenRoutes = ['/signup', '/login', '/forgot-password'];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white text-[#111111] font-sans text-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Souvenote
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-gray-500 transition-colors">
              Home
            </Link>
            <Link href="/cards" className="hover:text-gray-500 transition-colors">
              Cards
            </Link>
          </nav>
        )}
      </div>

      {user && (
        <div className="flex items-center gap-5">
          <span className="hidden sm:inline font-medium">
            Credits <span className="text-gray-500">0</span>
          </span>

          <span className="hidden sm:inline text-gray-400">CAD</span>
          <span className="hidden sm:inline text-gray-400">ENG</span>

          <button aria-label="Menu" className="hover:text-gray-500 transition-colors cursor-pointer">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button aria-label="Profile" onClick={logout} className="hover:text-gray-500 transition-colors cursor-pointer">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>

          <button aria-label="Cart" className="hover:text-gray-500 transition-colors cursor-pointer">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0L5.4 19h13.2M7 13l-1.6 6m10.6 0a2 2 0 100-4 2 2 0 000 4zM7 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}
