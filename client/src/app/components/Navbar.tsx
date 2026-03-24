'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { musicApi } from '@/lib/api';

const NAV_LINKS = [
  {
    label: 'Build My Card',
    subtext: 'Answer a few questions and AI will generate your design.',
    href: '/create',
  },
  {
    label: 'Personalize a Template',
    subtext: 'Choose a design and customize it your way.',
    href: '/cards',
  },
  {
    label: 'Ready to Send Cards',
    subtext: 'Add a personal message and send it - no customization required.',
    href: '/cards?ready=true',
  },
  {
    label: 'My Cards & Songs',
    subtext: 'Designs and songs are automatically saved for 30 days.',
    href: '/my-cards',
  },
];

const HAMBURGER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'My Images/Songs', href: '/my-cards' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Profile (Currency/Language)', href: '/profile' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [imageCredits, setImageCredits] = useState(0);
  const [songCredits, setSongCredits] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCredits() {
      if (loading) {
        return;
      }

      if (!user) {
        if (isMounted) {
          setImageCredits(0);
          setSongCredits(0);
        }
        return;
      }

      try {
        const credits = await musicApi.getCredits();

        if (isMounted) {
          setImageCredits(credits.image);
          setSongCredits(credits.song);
        }
      } catch {
        if (isMounted) {
          setImageCredits(0);
          setSongCredits(0);
        }
      }
    }

    void loadCredits();

    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setProfileOpen(false);
      setMenuOpen(false);
      setImageCredits(0);
      setSongCredits(0);
      router.push('/');
      router.refresh();
    }
  };

  if (
    pathname === '/signup' ||
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/confirm-signup'
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-4 text-sm text-[#111111] backdrop-blur-md font-sans">
      <div className="font-bold text-lg tracking-tight flex-shrink-0">
        <Link href="/">Souvenote</Link>
      </div>

      <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map((link) => (
          <div
            key={link.label}
            className="relative group"
            onMouseEnter={() => setHoveredLink(link.label)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <Link
              href={link.href}
              className="whitespace-nowrap hover:text-gray-500 transition-colors font-medium"
            >
              {link.label}
            </Link>
            {hoveredLink === link.label && (
              <div className="absolute top-full left-1/2 z-50 mt-3 w-56 -translate-x-1/2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs leading-relaxed text-gray-500 shadow-lg pointer-events-none">
                {link.subtext}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1" title="Image Credits">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
            <span>{loading ? '...' : imageCredits}</span>
          </span>
          <span className="flex items-center gap-1" title="Song Credits">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
            <span>{loading ? '...' : songCredits}</span>
          </span>
        </div>

        <div className="relative hidden sm:block">
          {user ? (
            <>
              <button
                aria-label="Profile"
                onClick={() => setProfileOpen((open) => !open)}
                className="hover:text-gray-500 transition-colors"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-3 w-44 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                    <Link
                      href="/account"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Account settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium hover:text-gray-500 transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <button aria-label="Cart" className="hover:text-gray-500 transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0L5.4 19h13.2M7 13l-1.6 6m10.6 0a2 2 0 100-4 2 2 0 000 4zM7 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>

        <div className="relative">
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="hover:text-gray-500 transition-colors"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-3 w-52 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                {HAMBURGER_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
