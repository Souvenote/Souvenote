'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, Star, Heart, Send } from 'lucide-react';
import PersonalizationModal, { type Card } from '../components/PersonalizationModal';
import FormatModal, { type CardFormat } from '../components/FormatModal';
import ReadyCardMessageModal from '../components/ReadyCardMessageModal';
import { cardTemplatesApi, type CardTemplateRecord } from '@/lib/api';

type TemplateAction = 'select' | 'personalize' | 'ready_send';

interface PersonalizationData {
  photo: File | null;
  rightsConfirmed: boolean;
  birthday: string;
  name: string;
  caption: string;
  message: string;
  fontStyle: string;
}

interface MarketplaceCard extends Card {
  basePrice: number;
  badgeLabel?: string;
}

function mapTemplateToCard(template: CardTemplateRecord): MarketplaceCard {
  const config = template.config || {};

  return {
    id: template.id,
    title: template.title,
    category: template.category,
    isPersonalizable: template.isPersonalizable,
    isPopular: template.isPopular,
    image: template.previewEmoji || '💌',
    basePrice: template.basePrice,
    badgeLabel: typeof config.badge === 'string' ? config.badge : undefined,
    config: {
      requiresBirthday: config.requiresBirthday,
      customFields: config.customFields,
    },
  };
}

function buildMusicSearchParams(
  format: CardFormat,
  card: MarketplaceCard,
  options: {
    sourceFlow: 'template' | 'ready';
    personalMessage?: string;
    recipientName?: string;
    caption?: string;
    birthday?: string;
    fontStyle?: string;
  },
) {
  const designPromptParts = [
    `${format} greeting card`,
    card.category ? `for ${card.category.toLowerCase()}` : null,
    `using the ${card.title} template`,
    options.birthday ? `celebrating ${options.birthday}` : null,
    options.recipientName ? `for ${options.recipientName}` : null,
    options.caption ? `with the caption "${options.caption}"` : null,
    options.personalMessage ? `and a message that says "${options.personalMessage}"` : null,
    options.fontStyle ? `styled with ${options.fontStyle}` : 'clean editorial card design',
  ].filter(Boolean);

  const params = new URLSearchParams({
    designPrompt: designPromptParts.join(', '),
    format,
    templateTitle: card.title,
    occasion: card.category,
    cardTemplateId: String(card.id),
    sourceFlow: options.sourceFlow,
  });

  if (options.personalMessage?.trim()) {
    params.set('personalMessage', options.personalMessage.trim());
  }

  if (options.recipientName?.trim()) {
    params.set('recipient', options.recipientName.trim());
  }

  if (options.caption?.trim()) {
    params.set('caption', options.caption.trim());
  }

  if (options.birthday) {
    params.set('birthday', options.birthday);
  }

  if (options.fontStyle) {
    params.set('fontStyle', options.fontStyle);
  }

  return params;
}

function CardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const readyOnly = searchParams.get('ready') === 'true';
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<MarketplaceCard | null>(null);
  const [readyMessageCard, setReadyMessageCard] = useState<MarketplaceCard | null>(null);
  const [pendingCard, setPendingCard] = useState<MarketplaceCard | null>(null);
  const [pendingAction, setPendingAction] = useState<TemplateAction | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<CardFormat | null>(null);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [templates, setTemplates] = useState<MarketplaceCard[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(readyOnly ? 8 : 10);

  useEffect(() => {
    let ignore = false;

    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplatesError(null);

      try {
        const records = await cardTemplatesApi.getAll();
        if (!ignore) {
          setTemplates(records.map(mapTemplateToCard));
        }
      } catch (error) {
        if (!ignore) {
          setTemplatesError(
            error instanceof Error ? error.message : 'Could not load the card marketplace.',
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingTemplates(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      ignore = true;
    };
  }, []);

  const allCards = templates;
  const readyCards = useMemo(
    () => allCards.filter((card) => !card.isPersonalizable),
    [allCards],
  );

  const categories = useMemo(() => {
    const sourceCards = readyOnly ? readyCards : allCards;
    return ['All', ...Array.from(new Set(sourceCards.map((card) => card.category)))];
  }, [allCards, readyCards, readyOnly]);

  useEffect(() => {
    if (!categories.includes(activeFilter)) {
      setActiveFilter('All');
    }
  }, [activeFilter, categories]);

  useEffect(() => {
    setVisibleCount(readyOnly ? 8 : 10);
  }, [activeFilter, readyOnly, search]);

  const beginTemplateAction = (action: TemplateAction, card: MarketplaceCard) => {
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

  const resetTemplateSelection = () => {
    setSelectedCard(null);
    setReadyMessageCard(null);
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
      const params = buildMusicSearchParams(format, pendingCard, {
        sourceFlow: 'template',
      });

      resetTemplateSelection();
      router.push(`/create/music?${params.toString()}`);
      return;
    }

    if (pendingAction === 'ready_send') {
      setReadyMessageCard(pendingCard);
      setPendingAction(null);
      setPendingCard(null);
      return;
    }

    setSelectedCard(pendingCard);
  };

  const handlePersonalize = (card: MarketplaceCard) => {
    beginTemplateAction('personalize', card);
  };

  const handleSelectAsIs = (card: MarketplaceCard) => {
    beginTemplateAction('select', card);
  };

  const handleSendReady = (card: MarketplaceCard) => {
    beginTemplateAction('ready_send', card);
  };

  const handleClosePersonalization = () => {
    resetTemplateSelection();
  };

  const handlePersonalizationComplete = (data: PersonalizationData) => {
    if (!selectedCard || !selectedFormat) {
      handleClosePersonalization();
      return;
    }

    const params = buildMusicSearchParams(selectedFormat, selectedCard, {
      sourceFlow: 'template',
      personalMessage: data.message,
      recipientName: data.name,
      caption: data.caption,
      birthday: data.birthday,
      fontStyle: data.fontStyle,
    });

    resetTemplateSelection();
    router.push(`/create/music?${params.toString()}`);
  };

  const handleReadyMessageComplete = (message: string) => {
    if (!readyMessageCard || !selectedFormat) {
      resetTemplateSelection();
      return;
    }

    const params = buildMusicSearchParams(selectedFormat, readyMessageCard, {
      sourceFlow: 'ready',
      personalMessage: message,
    });

    resetTemplateSelection();
    router.push(`/create/music?${params.toString()}`);
  };

  const filteredCards = useMemo(() => {
    let result = readyOnly ? readyCards : allCards;

    if (activeFilter !== 'All') {
      result = result.filter((card) => card.category === activeFilter);
    }

    if (search.trim()) {
      const normalizedSearch = search.toLowerCase();
      result = result.filter((card) =>
        `${card.title} ${card.category}`.toLowerCase().includes(normalizedSearch),
      );
    }

    return result;
  }, [activeFilter, allCards, readyCards, readyOnly, search]);

  const visibleCards = filteredCards.slice(0, visibleCount);
  const featuredCards = useMemo(
    () => allCards.filter((card) => card.isPopular && card.isPersonalizable),
    [allCards],
  );

  return (
    <main className="min-h-screen bg-[#fafafa] pb-20 font-sans">
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

      {readyMessageCard && (
        <ReadyCardMessageModal
          cardTitle={readyMessageCard.title}
          cardCategory={readyMessageCard.category}
          onClose={resetTemplateSelection}
          onComplete={handleReadyMessageComplete}
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

          {isLoadingTemplates ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="aspect-[5/7] animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
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
                        Use as is
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
          )}
        </section>
      )}

      <div className="sticky top-[73px] z-20 overflow-x-auto border-y border-gray-100 bg-[#fafafa]/80 px-6 py-4 backdrop-blur-md no-scrollbar">
        <div className="mx-auto flex max-w-7xl gap-2">
          {categories.map((category) => (
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
            {readyOnly ? 'Send Ready Cards' : 'Template marketplace'}
          </h2>
          <p className="mt-1 text-gray-500">
            {readyOnly
              ? 'Beautiful pre-designed cards — just add your message and send.'
              : 'Choose a design, personalize it, or route it straight into the music flow.'}
          </p>
        </div>

        {templatesError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
            {templatesError}
          </div>
        ) : isLoadingTemplates ? (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: readyOnly ? 8 : 10 }).map((_, index) => (
              <div
                key={index}
                className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-4 aspect-[5/7] animate-pulse rounded-2xl bg-gray-100" />
                <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="mb-4 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900">No cards found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleCards.map((card) => (
                <div
                  key={card.id}
                  className="group rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="relative mb-4 flex aspect-[5/7] items-center justify-center overflow-hidden rounded-2xl bg-gray-50 text-5xl">
                    {card.image}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                      {card.isPersonalizable ? (
                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                          Custom
                        </span>
                      ) : (
                        <span className="rounded-lg border border-green-100 bg-green-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-green-600">
                          Ready to Send
                        </span>
                      )}
                      {card.isPopular && (
                        <span className="rounded-lg border border-yellow-100 bg-yellow-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-yellow-700">
                          Popular
                        </span>
                      )}
                      {card.badgeLabel && (
                        <span className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-violet-700">
                          {card.badgeLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mb-1 font-bold text-gray-900">{card.title}</h3>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {card.category}
                  </p>

                  <div className="flex gap-2">
                    {card.isPersonalizable ? (
                      <>
                        <button
                          onClick={() => handleSelectAsIs(card)}
                          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-50"
                        >
                          Use as is
                        </button>
                        <button
                          onClick={() => handlePersonalize(card)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
                        >
                          <Heart className="h-3 w-3" />
                          Personalize
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleSendReady(card)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800"
                      >
                        <Send className="h-3 w-3" />
                        Send This Card
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredCards.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisibleCount((current) => current + (readyOnly ? 8 : 10))}
                  className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Load More Cards
                </button>
              </div>
            )}
          </>
        )}
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
