'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, Star, Heart, Zap, Image, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import PersonalizationModal, { type Card } from '../components/PersonalizationModal';

const CATEGORIES = ['All', 'Birthday', 'Anniversary', 'Wedding', 'Thank You', 'Holiday', 'Get Well', 'Congratulations'];

const POPULAR_CARDS: Card[] = [
  { id: 'popular-1', title: 'On This Day', category: 'Birthday', isPersonalizable: true, isPopular: true, image: '📅' },
  { id: 'popular-2', title: 'Horoscope', category: 'Birthday', isPersonalizable: true, isPopular: true, image: '♈' },
  { id: 'popular-3', title: 'Comic Card', category: 'General', isPersonalizable: true, isPopular: true, image: '🦸' },
  { id: 'popular-4', title: 'Book Cover', category: 'Anniversary', isPersonalizable: true, isPopular: true, image: '📖' },
  { id: 'popular-5', title: 'Mental Health', category: 'Get Well', isPersonalizable: true, isPopular: true, image: '🧠' },
  { id: 'popular-6', title: 'Courtroom Case', category: 'Congratulations', isPersonalizable: true, isPopular: true, image: '⚖️' },
];

const MARKETPLACE_CARDS: Card[] = [
  ...POPULAR_CARDS,
  { id: 7, title: 'Balloon Bash', category: 'Birthday', isPersonalizable: true, image: '🎈' },
  { id: 8, title: 'Forever Yours', category: 'Anniversary', isPersonalizable: true, image: '💝' },
  { id: 9, title: 'Season of Joy', category: 'Holiday', isPersonalizable: false, image: '❄️' },
  { id: 10, title: 'Grateful Soul', category: 'Thank You', isPersonalizable: false, image: '🙏' },
  { id: 11, title: 'Little One', category: 'New Baby', isPersonalizable: true, image: '🍼' },
  { id: 12, title: 'Just Because', category: 'Just Because', isPersonalizable: true, image: '✨' },
];

export default function CardsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCards = useMemo(() => {
    let result = MARKETPLACE_CARDS;
    if (activeFilter !== 'All') result = result.filter((c) => c.category === activeFilter);
    if (search.trim()) result = result.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [activeFilter, search]);

  const featuredCards = useMemo(() => {
    return MARKETPLACE_CARDS.filter(c => c.isPopular);
  }, []);

  const handlePersonalize = (card: Card) => {
    setSelectedCard(card);
  };

  const handleSendReady = (card: Card) => {
    showToast(`Added "${card.title}" to cart! Checkout coming soon.`);
  };

  const handlePersonalizationComplete = (data: any) => {
    setSelectedCard(null);
    showToast('Card personalization saved! Moving to generation...');
    // In a real app, this would route to the generation page with the form data
    // router.push('/generation');
  };

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-6 py-3 rounded-2xl shadow-xl z-[60] animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

      {/* Persistent Banner */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link 
          href="/create" 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Build My Card from scratch
        </Link>
        
        <div className="relative max-w-xs w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div className="flex items-center gap-4">
           {/* Placeholder for cart count if needed */}
        </div>
      </div>

      {/* Featured Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Personalizable Cards</h1>
            <p className="text-gray-500 mt-1">Our most popular templates for total customization.</p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-lg">
            Most Popular
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {featuredCards.map(card => (
            <div key={card.id} className="group space-y-3">
              <div 
                onClick={() => handlePersonalize(card)}
                className="aspect-[5/7] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-4xl">
                  {card.image}
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-100">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{card.title}</h3>
                <button 
                  onClick={() => handlePersonalize(card)}
                  className="mt-2 w-full py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Personalize
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Occasion Filters */}
      <div className="sticky top-[73px] z-20 bg-[#fafafa]/80 backdrop-blur-md border-y border-gray-100 px-6 py-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 max-w-7xl mx-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                activeFilter === cat 
                ? 'bg-black text-white border-black shadow-md' 
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Grid */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {filteredCards.map(card => (
            <div key={card.id} className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="aspect-[5/7] rounded-2xl bg-gray-50 flex items-center justify-center text-5xl mb-4 relative overflow-hidden">
                {card.image}
                <div className="absolute top-3 left-3 flex gap-1">
                   {card.isPersonalizable ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider rounded-lg border border-blue-100">
                        Custom
                      </span>
                   ) : (
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-wider rounded-lg border border-green-100">
                        Ready
                      </span>
                   )}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">{card.category}</p>
              
              <div className="flex gap-2">
                {card.isPersonalizable ? (
                  <button 
                    onClick={() => handlePersonalize(card)}
                    className="flex-1 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-3 h-3" />
                    Personalize
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handlePersonalize(card)}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Customize
                    </button>
                    <button 
                      onClick={() => handleSendReady(card)}
                      className="flex-1 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Send
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Integration */}
      {selectedCard && (
        <PersonalizationModal 
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onComplete={handlePersonalizationComplete}
        />
      )}
    </main>
  );
}
