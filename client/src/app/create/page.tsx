'use client';

import Link from 'next/link';
import BuildMyCard from '../components/BuildMyCard';

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#111111]">
      <div className="flex justify-end px-6 py-4">
        <Link href="/cards" className="text-gray-500 hover:text-[#111111] transition-colors text-sm">
          ← Browse cards
        </Link>
      </div>

      <main className="flex-grow">
        <BuildMyCard />
      </main>
    </div>
  );
}
