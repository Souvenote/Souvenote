'use client';

import Link from 'next/link';

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#111111]">
      <div className="flex justify-end px-6 py-4">
        <Link href="/cards" className="text-gray-500 hover:text-[#111111] transition-colors text-sm">
          ← Browse cards
        </Link>
      </div>


      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-3">Card Creator</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            The full card creation workspace is coming soon. In the meantime, browse our pre-made cards and personalize one to get started.
          </p>
          <Link
            href="/cards"
            className="inline-block bg-[#111111] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Browse cards
          </Link>
        </div>
      </main>

    </div>
  );
}
