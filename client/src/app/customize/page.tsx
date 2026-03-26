'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const OCCASIONS = ['All', 'Birthday', 'Anniversary', 'Wedding', 'Thank You', 'Get Well', 'Holiday', 'Congratulations'];

const CUSTOMIZABLE_TEMPLATES = [
  { id: 1, name: 'Modern Minimalist', occasion: 'Birthday', image: '🎂' },
  { id: 2, name: 'Floral Elegance', occasion: 'Anniversary', image: '💐' },
  { id: 3, name: 'Festive Cheer', occasion: 'Holiday', image: '🎄' },
  { id: 4, name: 'Love & Roses', occasion: 'Wedding', image: '🌹' },
  { id: 5, name: 'Get Well Soon', occasion: 'Get Well', image: '💛' },
  { id: 6, name: 'Congrats Burst', occasion: 'Congratulations', image: '🎉' },
];

const READY_TO_SEND = [
  { id: 1, name: 'Sparkling Wishes', occasion: 'Birthday', badge: 'Popular', image: '✨' },
  { id: 2, name: 'Romantic Bliss', occasion: 'Anniversary', badge: null, image: '💕' },
  { id: 3, name: 'Sunflower Thanks', occasion: 'Thank You', badge: null, image: '🌻' },
  { id: 4, name: 'Joyful Confetti', occasion: 'Congratulations', badge: 'Popular', image: '🎊' },
  { id: 5, name: 'Healing Thoughts', occasion: 'Get Well', badge: 'New', image: '🌿' },
  { id: 6, name: 'Elegant Blush', occasion: 'Wedding', badge: null, image: '🌸' },
];

export default function CustomizePage() {
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('ready') === 'true') {
      const element = document.getElementById('ready-to-send');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  const filteredCustomizable = CUSTOMIZABLE_TEMPLATES.filter((card) => {
    const matchOccasion = selectedOccasion === 'All' || card.occasion === selectedOccasion;
    const matchSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchOccasion && matchSearch;
  });

  const filteredReady = READY_TO_SEND.filter((card) => {
    const matchOccasion = selectedOccasion === 'All' || card.occasion === selectedOccasion;
    const matchSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchOccasion && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="bg-white border-b border-[#e8e8e8] px-12 py-16 text-center">
        <h1 className="text-5xl font-bold text-[#333] mb-3">Customize a Card Template</h1>
        <p className="text-lg text-[#888] max-w-2xl mx-auto">
          Choose from our curated collection of templates and make them truly yours.
        </p>
      </section>

      {/* Filter Bar */}
      <div className="bg-white border-b border-[#e8e8e8] px-12 py-6">
        <div className="flex items-center justify-between gap-8">
          {/* Occasion Filters */}
          <div className="flex gap-2 flex-wrap">
            {OCCASIONS.map((occasion) => (
              <button
                key={occasion}
                onClick={() => setSelectedOccasion(occasion)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedOccasion === occasion
                    ? 'bg-[#555] text-white border border-[#555]'
                    : 'bg-white text-[#666] border border-[#ccc] hover:bg-[#f0f0f0] hover:border-[#bbb]'
                }`}
              >
                {occasion}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center border border-[#ccc] rounded-xl bg-white overflow-hidden min-w-[280px]">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 text-sm text-[#333] outline-none placeholder-[#aaa]"
            />
            <button className="bg-[#eee] hover:bg-[#ddd] px-4 py-3 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" stroke="#888" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-12 py-12">
        {/* Customizable Templates Section */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#333] mb-2 flex items-center justify-center gap-3">
              Customizable Templates
              <span className="inline-block px-3 py-1 bg-[#e8e8e8] text-[#888] text-xs font-bold uppercase tracking-widest rounded">
                Personalize
              </span>
            </h2>
            <p className="text-sm text-[#888]">Upload your photo and customize the design</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {filteredCustomizable.length > 0 ? (
              filteredCustomizable.map((card) => (
                <div
                  key={card.id}
                  className="border border-[#d8d8d8] rounded-2xl overflow-hidden bg-[#fafafa] transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="w-full aspect-[5/7] bg-gradient-to-br from-[#e8e8e8] to-[#d0d0d0] flex items-center justify-center relative">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#c5c5c5] rounded-full text-4xl">
                      {card.image}
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 text-[#555] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                      Customize
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="text-base font-bold text-[#333] mb-1">{card.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">{card.occasion}</p>

                    {/* CTAs */}
                    <div className="flex gap-2">
                      <Link
                        href="/customize/modal"
                        className="flex-1 py-2 px-3 bg-[#444] text-white text-xs font-semibold rounded-lg hover:bg-[#333] transition-colors text-center"
                      >
                        Customize
                      </Link>
                      <button className="flex-1 py-2 px-3 bg-white text-[#555] text-xs font-semibold border border-[#c0c0c0] rounded-lg hover:bg-[#eee] transition-colors">
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-[#888]">
                No templates found matching your filters.
              </div>
            )}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-none border-t border-[#e8e8e8] my-12" />

        {/* Ready to Send Section */}
        <section id="ready-to-send" className="mb-16 scroll-mt-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#333] mb-2 flex items-center justify-center gap-3">
              Ready to Send
              <span className="inline-block px-3 py-1 bg-[#e8e8e8] text-[#888] text-xs font-bold uppercase tracking-widest rounded">
                Instant
              </span>
            </h2>
            <p className="text-sm text-[#888]">Pre-designed and ready to go with a personal message</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {filteredReady.length > 0 ? (
              filteredReady.map((card) => (
                <div
                  key={card.id}
                  className="border border-[#d8d8d8] rounded-2xl overflow-hidden bg-[#fafafa] transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="w-full aspect-[5/7] bg-gradient-to-br from-[#e8e8e8] to-[#d0d0d0] flex items-center justify-center relative">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#c5c5c5] rounded-full text-4xl">
                      {card.image}
                    </div>
                    <div className="absolute top-3 left-3 bg-[#666]/85 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                      Ready to Send
                    </div>
                    {card.badge && (
                      <div className="absolute top-3 right-3 bg-black/55 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                        {card.badge}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="text-base font-bold text-[#333] mb-1">{card.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">{card.occasion}</p>

                    {/* CTA */}
                    <button className="w-full py-2 px-3 bg-[#444] text-white text-xs font-semibold rounded-lg hover:bg-[#333] transition-colors">
                      Send This Card
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-[#888]">
                No ready-to-send cards found matching your filters.
              </div>
            )}
          </div>
        </section>

        {/* Load More Button */}
        <div className="text-center py-8">
          <button className="px-8 py-3 bg-[#444] text-white text-sm font-semibold rounded-lg hover:bg-[#333] transition-colors">
            Load More Cards
          </button>
        </div>
      </main>
    </div>
  );
}
