'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import WelcomePopup from '../components/WelcomePopup';
import FormatModal, { type CardAction, type CardFormat } from '../components/FormatModal';
import PersonalizationFlow from '../components/PersonalizationFlow';

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
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<CardFormat | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const pendingActionRef = useRef<CardAction | null>(null);

  const handleAction = (action: CardAction, card?: Card) => {
    if (action === 'build') {
      router.push('/create');
      return;
    }

    setSelectedCard(card ?? null);
    pendingActionRef.current = action;
    setFormatModalOpen(true);
  };

  const handleFormatSelect = (format: CardFormat) => {
    setSelectedFormat(format);
    setFormatModalOpen(false);

    if (pendingActionRef.current === 'personalize') {
      setPersonalizationOpen(true);
    } else {
      const searchParams = new URLSearchParams({
        designPrompt: [
          `${format} greeting card`,
          selectedCard ? `${selectedCard.title} template` : 'ready-made template',
          selectedCard ? `${selectedCard.category.toLowerCase()} occasion` : null,
          'clean editorial card design',
        ]
          .filter(Boolean)
          .join(', '),
        format,
      });

      if (selectedCard) {
        searchParams.set('templateTitle', selectedCard.title);
        searchParams.set('occasion', selectedCard.category);
      }

      router.push(`/create/music?${searchParams.toString()}`);
    }
  };

  const filteredCards = useMemo(() => {
    let result = cards;
    if (activeFilter) result = result.filter((c) => c.category === activeFilter);
    if (search.trim()) result = result.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [activeFilter, search]);

  return (
    <main className="grow flex flex-col bg-white text-[#111111] font-sans">
      <WelcomePopup />

      <FormatModal
        open={formatModalOpen}
        onClose={() => setFormatModalOpen(false)}
        onSelect={handleFormatSelect}
      />

      <PersonalizationFlow
        open={personalizationOpen}
        format={selectedFormat}
        cardTitle={selectedCard?.title}
        cardCategory={selectedCard?.category}
        onClose={() => setPersonalizationOpen(false)}
        onComplete={() => setPersonalizationOpen(false)}
      />

      {/* Filter bar */}
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

        <div className="ml-4 pl-4 flex items-center gap-2">
          {searchOpen && (
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards…"
              className="text-sm border border-gray-200 rounded px-3 py-1 outline-none focus:border-gray-400 w-40 transition-all"
            />
          )}
          <button
            aria-label="Search"
            onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setSearch(''); }}
            className="text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card grid */}
      <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-y-16 gap-x-12 max-w-[1400px] mx-auto w-full">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400 text-sm">
            No cards found.
          </div>
        ) : (
          filteredCards.map((card) => (
            <div key={card.id} className="flex flex-col">
              <h3 className="text-base font-semibold mb-4">{card.title}</h3>

              {/* Card previews */}
              <div className="flex space-x-6 items-end mb-6">
                {/* Physical — smaller */}
                <div className="w-28 shrink-0">
                  <div className="text-sm font-semibold mb-2">Physical</div>
                  <div className="w-full aspect-[5/7] bg-[#f4f5f7] border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">
                    5 × 7
                  </div>
                </div>
                {/* Digital — larger/dominant */}
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-2">Digital</div>
                  <div className="w-full aspect-[9/16] bg-[#f4f5f7] border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">
                    9 × 16
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleAction('select', card)}
                  className="px-5 py-2.5 bg-[#111111] text-white text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Select as is
                </button>
                <button
                  onClick={() => handleAction('personalize', card)}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-[#111111] text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Personalize
                </button>
                <button
                  onClick={() => handleAction('build')}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-[#111111] text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
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
