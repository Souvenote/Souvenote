'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Category = 'Birthday' | 'Anniversary' | 'Wedding' | 'Thank You' | 'Holiday';

interface Card {
  id: number;
  title: string;
  category: Category;
}

const cards: Card[] = [
  { id: 1, title: 'Balloon Bash', category: 'Birthday' },
  { id: 2, title: 'Confetti Celebration', category: 'Birthday' },
  { id: 3, title: 'Years Together', category: 'Anniversary' },
  { id: 4, title: 'Forever Yours', category: 'Anniversary' },
  { id: 5, title: 'Happily Ever After', category: 'Wedding' },
  { id: 6, title: 'Two Become One', category: 'Wedding' },
  { id: 7, title: 'Grateful Heart', category: 'Thank You' },
  { id: 8, title: 'Season of Joy', category: 'Holiday' },
];

const categories: Category[] = ['Birthday', 'Anniversary', 'Wedding', 'Thank You', 'Holiday'];

export default function CardsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const filteredCards = useMemo(() => {
    if (!activeFilter) return cards;
    return cards.filter((c) => c.category === activeFilter);
  }, [activeFilter]);

  if (loading || !user) {
    return null;
  }

  return (
    <main className="grow flex flex-col bg-white text-[#111111] font-sans">
      <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex space-x-3 overflow-x-auto hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(activeFilter === category ? null : category)}
              className={`px-4 py-1.5 text-sm font-medium border rounded whitespace-nowrap cursor-pointer transition-colors ${
                activeFilter === category
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'border-gray-300 text-gray-700 hover:border-gray-800 hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <button aria-label="Search" className="ml-4 pl-4 text-gray-500 hover:text-black transition-colors cursor-pointer">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-y-16 gap-x-12 max-w-[1400px] mx-auto w-full">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400 text-sm">
            No cards found for this category.
          </div>
        ) : (
          filteredCards.map((card) => (
            <div key={card.id} className="flex flex-col">
              <h3 className="text-base font-semibold mb-4">{card.title}</h3>
              <div className="flex space-x-6 items-end mb-6">
                <div className="flex-1 max-w-[300px]">
                  <div className="text-sm font-semibold mb-2">Physical</div>
                  <div className="w-full aspect-[5/7] bg-[#f4f5f7] border border-gray-200 flex items-center justify-center text-gray-500 font-medium">
                    5 × 7
                  </div>
                </div>
                <div className="w-[40%] max-w-[200px]">
                  <div className="text-sm font-semibold mb-2">Digital</div>
                  <div className="w-full aspect-[9/16] bg-[#f4f5f7] border border-gray-200 flex items-center justify-center text-gray-500 font-medium">
                    9 × 16
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="px-5 py-2.5 bg-[#111111] text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                  Select as is
                </button>
                <button className="px-5 py-2.5 bg-white border border-gray-300 text-[#111111] text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                  Personalize
                </button>
                <button className="px-5 py-2.5 bg-white border border-gray-300 text-[#111111] text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                  Build My Own
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
