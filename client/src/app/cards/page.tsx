'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, Star, Heart, ShoppingCart } from 'lucide-react';
import PersonalizationModal, { type Card } from '../components/PersonalizationModal';
import FormatModal, { type CardFormat } from '../components/FormatModal';

type TemplateAction = 'select' | 'personalize';

interface PersonalizationData {
  photo: File | null;
  rightsConfirmed: boolean;
  birthday: string;
  name: string;
  caption: string;
  message: string;
  fontStyle: string;
}

const CATEGORIES = [
  'All',
  'Birthday',
  'Anniversary',
  'Wedding',
  'Thank You',
  'Holiday',
  'Get Well',
  'Congratulations',
  'New Baby',
  'Just Because',
  'General',
];

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

function buildMusicSearchParams(
  format: CardFormat,
  card: Card,
  personalization?: PersonalizationData,
) {
  const designPromptParts = [
    `${format} greeting card`,
    card.category ? `for ${card.category.toLowerCase()}` : null,
    `using the ${card.title} template`,
    personalization?.photo ? 'personalized from an uploaded photo' : null,
    personalization?.birthday ? `celebrating a birthday on ${personalization.birthday}` : null,
    personalization?.name ? `for ${personalization.name}` : null,
    personalization?.caption ? `with the caption "${personalization.caption}"` : null,
    personalization?.message ? `and a message that says "${personalization.message}"` : null,
    personalization?.fontStyle
      ? `styled with ${personalization.fontStyle}`
      : 'clean editorial card design',
  ].filter(Boolean);

  const params = new URLSearchParams({
    designPrompt: designPromptParts.join(', '),
    format,
  });

  params.set('templateTitle', card.title);
  params.set('occasion', card.category);

  if (personalization?.name) {
    params.set('recipient', personalization.name);
  }

  return params;
}

function CardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const readyOnly = searchParams.get('ready') === 'true';
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [pendingAction, setPendingAction] = useState<TemplateAction | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<CardFormat | null>(null);
  const [formatModalOpen, setFormatModalOpen] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const beginTemplateAction = (action: TemplateAction, card: Card) => {
    setPendingAction(action);
    setPendingCard(card);
    setFormatModalOpen(true);
  };

  const closeFormatSelection = () => {
    setFormatModalOpen(false);
    setPendingAction(null);
    setPendingCard(null);
    setSelectedFormat(null);
  };

  const handleFormatSelect = (format: CardFormat) => {
    if (!pendingCard || !pendingAction) {
      closeFormatSelection();
      return;
    }

    setSelectedFormat(format);
    setFormatModalOpen(false);

    if (pendingAction === 'select') {
      const params = buildMusicSearchParams(format, pendingCard);
      setPendingAction(null);
      setPendingCard(null);
      router.push(`/create/music?${params.toString()}`);
      return;
    }

    setSelectedCard(pendingCard);
  };

  const handlePersonalize = (card: Card) => {
    beginTemplateAction('personalize', card);
  };

  const handleSelectAsIs = (card: Card) => {
    beginTemplateAction('select', card);
  };

  const handleSendReady = (card: Card) => {
    showToast(`Added "${card.title}" to cart! Checkout coming soon.`);
  };

  const handleClosePersonalization = () => {
    setSelectedCard(null);
    setPendingAction(null);
    setPendingCard(null);
    setSelectedFormat(null);
  };

  const handlePersonalizationComplete = (data: PersonalizationData) => {
    if (!selectedCard || !selectedFormat) {
      handleClosePersonalization();
      return;
    }

    const params = buildMusicSearchParams(selectedFormat, selectedCard, data);
    handleClosePersonalization();
    router.push(`/create/music?${params.toString()}`);
  };

  const filteredCards = useMemo(() => {
    let result = readyOnly
      ? MARKETPLACE_CARDS.filter((card) => !card.isPersonalizable)
      : MARKETPLACE_CARDS;

    if (activeFilter !== 'All') {
      result = result.filter((card) => card.category === activeFilter);
    }

    if (search.trim()) {
      result = result.filter((card) =>
        card.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return result;
  }, [activeFilter, readyOnly, search]);

  const featuredCards = useMemo(
    () => MARKETPLACE_CARDS.filter((card) => card.isPopular && card.isPersonalizable),
    [],
  );

  return (
    <main className="min-h-screen bg-[#fafafa] pb-20 font-sans">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-black px-6 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

      <FormatModal
        open={formatModalOpen}
        onClose={closeFormatSelection}
        onSelect={handleFormatSelect}
      />

      {selectedCard && (
        <PersonalizationModal
          card={selectedCard}
          onClose={handleClosePersonalization}
          onComplete={handlePersonalizationComplete}
        />
      )}

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
        <Link
          href="/create"
          className="flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" />
          Build My Card from scratch
        </Link>

        <div className="relative hidden w-full max-w-xs md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div className="flex items-center gap-4" />
      </div>

      {!readyOnly && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Personalizable Cards</h1>
              <p className="mt-1 text-gray-500">Our most popular templates for total customization.</p>
            </div>
            <span className="hidden rounded-lg bg-yellow-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-700 sm:inline-block">
              Most Popular
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {featuredCards.map((card) => (
              <div key={card.id} className="group space-y-3">
                <div
                  onClick={() => handlePersonalize(card)}
                  className="relative aspect-[5/7] cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-4xl">
                    {card.image}
                  </div>
                  <div className="absolute left-2 top-2 rounded-lg border border-gray-100 bg-white/90 px-2 py-1 backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  </div>
                  <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div>
                  <h3 className="line-clamp-1 text-sm font-bold text-gray-900">{card.title}</h3>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleSelectAsIs(card)}
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Select as is
                    </button>
                    <button
                      onClick={() => handlePersonalize(card)}
                      className="flex-1 rounded-lg bg-black py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
                    >
                      Personalize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="sticky top-[73px] z-20 overflow-x-auto border-y border-gray-100 bg-[#fafafa]/80 px-6 py-4 backdrop-blur-md no-scrollbar">
        <div className="mx-auto flex max-w-7xl gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`whitespace-nowrap rounded-xl border px-5 py-2 text-sm font-bold transition-all ${
                activeFilter === category
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {readyOnly ? 'Ready to send cards' : 'Template marketplace'}
          </h2>
          <p className="mt-1 text-gray-500">
            {readyOnly
              ? 'Browse cards that can be sent with minimal customization.'
              : 'Choose a design, personalize it, or route it straight into the music flow.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCards.map((card) => (
            <div key={card.id} className="group rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-xl">
              <div className="relative mb-4 flex aspect-[5/7] items-center justify-center overflow-hidden rounded-2xl bg-gray-50 text-5xl">
                {card.image}
                <div className="absolute left-3 top-3 flex gap-1">
                  {card.isPersonalizable ? (
                    <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                      Custom
                    </span>
                  ) : (
                    <span className="rounded-lg border border-green-100 bg-green-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-green-600">
                      Ready
                    </span>
                  )}
                </div>
              </div>

              <h3 className="mb-1 font-bold text-gray-900">{card.title}</h3>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.category}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectAsIs(card)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Use as is
                </button>

                {card.isPersonalizable ? (
                  <button
                    onClick={() => handlePersonalize(card)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
                  >
                    <Heart className="h-3 w-3" />
                    Personalize
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendReady(card)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Send
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={null}>
      <CardsPageContent />
    </Suspense>
  );
}
