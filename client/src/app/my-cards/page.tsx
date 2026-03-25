'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import WaveformPlayer from '@/app/components/music/WaveformPlayer';
import { useAuth } from '@/context/AuthContext';
import {
  ApiError,
  cardTemplatesApi,
  cardsApi,
  musicApi,
  type CardTemplateRecord,
} from '@/lib/api';

interface LibrarySong {
  id: string;
  title?: string;
  duration?: number;
  prompt: string;
  engineeredPrompt?: string;
  lyrics?: string;
  style?: string;
  status: string;
  generationMethod: string;
  createdAt: string;
  expiresAt: string;
}

interface CardPersonalizationData {
  templateTitle?: string;
  occasion?: string;
  personalMessage?: string;
  recipientName?: string;
  caption?: string;
  birthday?: string;
  fontStyle?: string;
  sourceFlow?: string;
  readyToSend?: boolean;
}

interface LibraryCard {
  id: string;
  cardTemplateId?: string;
  templateId?: string;
  designPrompt?: string;
  format: string;
  songId?: string;
   deliveryStatus?: string;
   shareToken?: string;
  status: string;
  personalizationData?: CardPersonalizationData;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  generating: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  personalized: 'bg-blue-50 text-blue-700 border-blue-200',
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Ready to play',
  generating: 'Generating',
  failed: 'Failed',
  complete: 'Complete',
  personalized: 'Personalized',
  draft: 'Draft',
};

const METHOD_LABELS: Record<string, string> = {
  card_based: 'Card based',
  guided: 'Guided',
  manual_prompt: 'Manual prompt',
  premade: 'Ready song',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDuration(duration?: number) {
  if (!duration || duration < 1) {
    return 'Unknown';
  }

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatStatus(status: string) {
  return STATUS_LABELS[status] || status;
}

function formatMethod(method: string) {
  return METHOD_LABELS[method] || method;
}

function getCardTitle(card: LibraryCard) {
  return (
    card.personalizationData?.templateTitle ||
    card.personalizationData?.occasion ||
    (card.designPrompt ? 'Custom AI Card' : 'Saved Card')
  );
}

function getCardDescription(card: LibraryCard) {
  const details = [
    card.personalizationData?.recipientName,
    card.personalizationData?.caption,
    card.personalizationData?.occasion,
  ].filter(Boolean);

  if (details.length > 0) {
    return details.join(' • ');
  }

  return card.personalizationData?.readyToSend
    ? 'Ready-to-send card'
    : card.designPrompt
      ? 'Built from a custom design prompt'
      : 'Saved card';
}

function getCardSourceLabel(card: LibraryCard) {
  switch (card.personalizationData?.sourceFlow) {
    case 'ready':
      return 'Ready to send';
    case 'template':
      return 'Template';
    default:
      return card.designPrompt ? 'Custom build' : 'Saved card';
  }
}

function getCardFallbackEmoji(card: LibraryCard, template?: CardTemplateRecord) {
  if (template?.previewEmoji) {
    return template.previewEmoji;
  }

  if (card.personalizationData?.readyToSend) {
    return '💌';
  }

  if (card.designPrompt) {
    return '🎨';
  }

  return '✨';
}

export default function MyCardsPage() {
  const { user, loading } = useAuth();
  const [songs, setSongs] = useState<LibrarySong[]>([]);
  const [cards, setCards] = useState<LibraryCard[]>([]);
  const [cardTemplates, setCardTemplates] = useState<CardTemplateRecord[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isLoadingCardTemplates, setIsLoadingCardTemplates] = useState(false);
  const [songError, setSongError] = useState<string | null>(null);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [openPlayers, setOpenPlayers] = useState<Record<string, boolean>>({});
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [savingSongId, setSavingSongId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);

  const loadSongs = useCallback(async () => {
    setIsLoadingSongs(true);
    setSongError(null);

    try {
      const nextSongs = await musicApi.getMySongs();
      setSongs(nextSongs);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setSongError('Please log in again to load your saved songs.');
      } else {
        setSongError(err instanceof Error ? err.message : 'Could not load your saved songs.');
      }
    } finally {
      setIsLoadingSongs(false);
    }
  }, []);

  const loadCards = useCallback(async () => {
    setIsLoadingCards(true);
    setCardsError(null);

    try {
      const nextCards = await cardsApi.getAll();
      setCards(nextCards);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setCardsError('Please log in again to load your saved cards.');
      } else {
        setCardsError(err instanceof Error ? err.message : 'Could not load your saved cards.');
      }
    } finally {
      setIsLoadingCards(false);
    }
  }, []);

  const loadCardTemplates = useCallback(async () => {
    setIsLoadingCardTemplates(true);

    try {
      const nextTemplates = await cardTemplatesApi.getAll();
      setCardTemplates(nextTemplates);
    } catch {
      setCardTemplates([]);
    } finally {
      setIsLoadingCardTemplates(false);
    }
  }, []);

  const refreshLibrary = useCallback(async () => {
    await Promise.all([loadSongs(), loadCards(), loadCardTemplates()]);
  }, [loadCardTemplates, loadCards, loadSongs]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setSongs([]);
      setCards([]);
      setCardTemplates([]);
      setSongError(null);
      setCardsError(null);
      setOpenPlayers({});
      return;
    }

    void refreshLibrary();
  }, [loading, refreshLibrary, user]);

  const playableSongs = useMemo(
    () => songs.filter((song) => song.status === 'completed').length,
    [songs],
  );

  const expiringSoonSongs = useMemo(
    () =>
      songs.filter((song) => {
        const daysLeft = Math.ceil(
          (new Date(song.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        return daysLeft >= 0 && daysLeft <= 7;
      }).length,
    [songs],
  );

  const cardsWithSongs = useMemo(
    () => cards.filter((card) => Boolean(card.songId)).length,
    [cards],
  );

  const cardTemplatesById = useMemo(
    () => new Map(cardTemplates.map((template) => [template.id, template])),
    [cardTemplates],
  );

  const cardTemplatesByTitle = useMemo(
    () =>
      new Map(
        cardTemplates.map((template) => [template.title.toLowerCase(), template]),
      ),
    [cardTemplates],
  );

  const togglePlayer = (songId: string) => {
    setOpenPlayers((current) => ({
      ...current,
      [songId]: !current[songId],
    }));
  };

  const startRenaming = (song: LibrarySong) => {
    setEditingSongId(song.id);
    setRenameDraft(song.title?.trim() || '');
    setRenameError(null);
  };

  const cancelRenaming = () => {
    setEditingSongId(null);
    setRenameDraft('');
    setRenameError(null);
    setSavingSongId(null);
  };

  const saveRename = async (songId: string) => {
    const nextTitle = renameDraft.trim();

    if (!nextTitle) {
      setRenameError('Please enter a song title.');
      return;
    }

    setSavingSongId(songId);
    setRenameError(null);

    try {
      const updatedSong = await musicApi.renameSong(songId, nextTitle);
      setSongs((current) =>
        current.map((song) =>
          song.id === songId
            ? {
                ...song,
                title: updatedSong.title,
              }
            : song,
        ),
      );
      cancelRenaming();
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Could not rename this song.');
      setSavingSongId(null);
    }
  };

  const deleteCard = async (cardId: string) => {
    const confirmed = window.confirm('Delete this card from My Cards & Songs?');

    if (!confirmed) {
      return;
    }

    setDeletingCardId(cardId);
    setCardsError(null);

    try {
      await cardsApi.delete(cardId);
      setCards((current) => current.filter((card) => card.id !== cardId));
    } catch (err) {
      setCardsError(err instanceof Error ? err.message : 'Could not delete this card.');
    } finally {
      setDeletingCardId(null);
    }
  };

  const deleteSong = async (songId: string) => {
    const confirmed = window.confirm('Delete this saved song from My Cards & Songs?');

    if (!confirmed) {
      return;
    }

    setDeletingSongId(songId);
    setSongError(null);

    try {
      await musicApi.deleteSong(songId);
      setSongs((current) => current.filter((song) => song.id !== songId));
      setCards((current) =>
        current.map((card) =>
          card.songId === songId
            ? {
                ...card,
                songId: undefined,
              }
            : card,
        ),
      );
      setOpenPlayers((current) => {
        const nextPlayers = { ...current };
        delete nextPlayers[songId];
        return nextPlayers;
      });

      if (editingSongId === songId) {
        cancelRenaming();
      }
    } catch (err) {
      setSongError(err instanceof Error ? err.message : 'Could not delete this song.');
    } finally {
      setDeletingSongId(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#faf7f2] px-6 py-10 text-[#111111]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-[#e9e1d5] bg-white shadow-sm">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.7fr_1fr] md:px-8 md:py-10">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-[#e9e1d5] bg-[#f7f1e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6651]">
                My Cards & Songs
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold md:text-4xl">Your saved library</h1>
                <p className="max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                  Ready-to-send cards, template cards, and generated songs all land here so you can keep track of what you&apos;ve already made.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="inline-flex items-center rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
                >
                  Create a new card
                </Link>
                {user && (
                  <button
                    onClick={() => void refreshLibrary()}
                    disabled={isLoadingSongs || isLoadingCards || isLoadingCardTemplates}
                    className="inline-flex items-center rounded-xl border border-[#ddd3c6] px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f8f3ec] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingSongs || isLoadingCards || isLoadingCardTemplates
                      ? 'Refreshing...'
                      : 'Refresh library'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-2xl border border-[#ece4d8] bg-[#fcfaf7] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Cards saved</p>
                <p className="mt-3 text-3xl font-bold">{cards.length}</p>
              </div>
              <div className="rounded-2xl border border-[#ece4d8] bg-[#fcfaf7] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Songs saved</p>
                <p className="mt-3 text-3xl font-bold">{songs.length}</p>
              </div>
              <div className="rounded-2xl border border-[#ece4d8] bg-[#fcfaf7] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Cards with songs</p>
                <p className="mt-3 text-3xl font-bold">{cardsWithSongs}</p>
              </div>
            </div>
          </div>
        </section>

        {!loading && !user ? (
          <section className="rounded-[2rem] border border-dashed border-[#d9cfbf] bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Log in to see your saved cards and songs</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Your library is tied to your account, so you need to sign in before we can show your saved creations.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-xl border border-[#ddd3c6] px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f8f3ec]"
              >
                Create account
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-[2rem] border border-[#e9e1d5] bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Cards</p>
                  <h2 className="mt-2 text-2xl font-bold">Saved cards</h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-gray-500">
                  Cards you finalize from ready-to-send or template flows show up here, with their message details and attached song state.
                </p>
              </div>

              {cardsError && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {cardsError}
                </div>
              )}

              {loading || isLoadingCards ? (
                <div className="mt-6 grid gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-36 animate-pulse rounded-3xl border border-[#efe7db] bg-[#fcfaf7]"
                    />
                  ))}
                </div>
              ) : cards.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-[#d9cfbf] bg-[#fcfaf7] px-6 py-12 text-center">
                  <h3 className="text-xl font-semibold">No saved cards yet</h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
                    Once you finish a ready-to-send or template card, it will show up here automatically.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {cards.map((card) => {
                    const templateById = card.cardTemplateId
                      ? cardTemplatesById.get(card.cardTemplateId)
                      : undefined;
                    const templateByTitle = card.personalizationData?.templateTitle
                      ? cardTemplatesByTitle.get(
                          card.personalizationData.templateTitle.toLowerCase(),
                        )
                      : undefined;
                    const template = templateById || templateByTitle;
                    const previewImageUrl =
                      template?.thumbnailUrl || template?.imageUrl || null;
                    const previewEmoji = getCardFallbackEmoji(card, template);

                    return (
                      <article
                        key={card.id}
                        className="relative rounded-3xl border border-[#efe7db] bg-[#fcfaf7] p-5 md:p-6"
                      >
                        <button
                          onClick={() => void deleteCard(card.id)}
                          disabled={deletingCardId === card.id}
                          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Delete card"
                          title="Delete card"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-9 0V5.75A1.75 1.75 0 0110.75 4h2.5A1.75 1.75 0 0115 5.75V7m-7.5 0l.63 10.08A2 2 0 0010.12 19h3.76a2 2 0 001.99-1.92L16.5 7m-5.25 3.25v5.5m3-5.5v5.5" />
                          </svg>
                        </button>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                          <div className="mx-auto w-full max-w-[140px] shrink-0 sm:mx-0">
                            <div className="relative aspect-[5/7] overflow-hidden rounded-3xl border border-[#e9e1d5] bg-white shadow-sm">
                              {previewImageUrl ? (
                                <img
                                  src={previewImageUrl}
                                  alt={getCardTitle(card)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fff8ef] via-[#fcfaf7] to-[#f4ecdf] text-6xl">
                                  {previewEmoji}
                                </div>
                              )}

                              <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7760] shadow-sm backdrop-blur-sm">
                                {getCardSourceLabel(card)}
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-bold">{getCardTitle(card)}</h3>
                                  <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                      STATUS_STYLES[card.status] ||
                                      'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    {formatStatus(card.status)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{getCardDescription(card)}</p>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
                              <p>
                                <span className="font-semibold text-[#111111]">Format:</span>{' '}
                                {card.format}
                              </p>
                              <p>
                                <span className="font-semibold text-[#111111]">Created:</span>{' '}
                                {formatDate(card.createdAt)}
                              </p>
                              <p>
                                <span className="font-semibold text-[#111111]">Song attached:</span>{' '}
                                {card.songId ? 'Yes' : 'No'}
                              </p>
                              {card.personalizationData?.fontStyle && (
                                <p>
                                  <span className="font-semibold text-[#111111]">Font:</span>{' '}
                                  {card.personalizationData.fontStyle}
                                </p>
                              )}
                              {card.deliveryStatus && (
                                <p>
                                  <span className="font-semibold text-[#111111]">Delivery:</span>{' '}
                                  {card.deliveryStatus.replace(/_/g, ' ')}
                                </p>
                              )}
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                              <Link
                                href={`/delivery/${card.id}`}
                                className="inline-flex rounded-xl border border-[#ddd3c6] bg-white px-4 py-2.5 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f5efe6]"
                              >
                                Manage delivery
                              </Link>
                              {card.shareToken && (
                                <Link
                                  href={`/share/${card.shareToken}`}
                                  className="inline-flex rounded-xl border border-[#ddd3c6] bg-white px-4 py-2.5 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f5efe6]"
                                >
                                  Open shared view
                                </Link>
                              )}
                            </div>

                            {card.personalizationData?.personalMessage && (
                              <div className="mt-5 rounded-2xl border border-[#e9e1d5] bg-white px-4 py-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                                  Personal message
                                </p>
                                <p className="mt-3 text-sm leading-6 text-gray-600">
                                  {card.personalizationData.personalMessage}
                                </p>
                              </div>
                            )}

                            {card.designPrompt && (
                              <details className="mt-5 rounded-2xl border border-[#e9e1d5] bg-white px-4 py-3">
                                <summary className="cursor-pointer text-sm font-semibold text-[#111111]">
                                  Design prompt
                                </summary>
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                                  {card.designPrompt}
                                </p>
                              </details>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-[#e9e1d5] bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Songs</p>
                  <h2 className="mt-2 text-2xl font-bold">Saved songs</h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-gray-500">
                  Completed songs can be opened and played here. Generating and failed songs are listed too, so the page reflects what is actually in your account.
                </p>
              </div>

              {songError && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {songError}
                </div>
              )}

              {loading || isLoadingSongs ? (
                <div className="mt-6 grid gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-44 animate-pulse rounded-3xl border border-[#efe7db] bg-[#fcfaf7]"
                    />
                  ))}
                </div>
              ) : songs.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-[#d9cfbf] bg-[#fcfaf7] px-6 py-12 text-center">
                  <h3 className="text-xl font-semibold">No saved songs yet</h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
                    Once you generate music, it will show up here automatically and stay available for up to 30 days.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-5">
                  {songs.map((song) => (
                    <article
                      key={song.id}
                      className="relative rounded-3xl border border-[#efe7db] bg-[#fcfaf7] p-5 md:p-6"
                    >
                      <button
                        onClick={() => void deleteSong(song.id)}
                        disabled={deletingSongId === song.id}
                        className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Delete song"
                        title="Delete song"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-9 0V5.75A1.75 1.75 0 0110.75 4h2.5A1.75 1.75 0 0115 5.75V7m-7.5 0l.63 10.08A2 2 0 0010.12 19h3.76a2 2 0 001.99-1.92L16.5 7m-5.25 3.25v5.5m3-5.5v5.5" />
                        </svg>
                      </button>

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            {editingSongId === song.id ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  value={renameDraft}
                                  onChange={(event) => setRenameDraft(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.preventDefault();
                                      void saveRename(song.id);
                                    }

                                    if (event.key === 'Escape') {
                                      cancelRenaming();
                                    }
                                  }}
                                  autoFocus
                                  maxLength={120}
                                  placeholder="Song title"
                                  className="min-w-[220px] rounded-xl border border-[#d8cfbf] bg-white px-3 py-2 text-base font-semibold text-[#111111] outline-none transition-colors focus:border-[#111111]"
                                />
                                <button
                                  onClick={() => void saveRename(song.id)}
                                  disabled={savingSongId === song.id}
                                  className="rounded-xl bg-[#111111] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {savingSongId === song.id ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={cancelRenaming}
                                  disabled={savingSongId === song.id}
                                  className="rounded-xl border border-[#d8cfbf] bg-white px-3 py-2 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f5efe6] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-bold">
                                  {song.title?.trim() || 'Untitled song'}
                                </h3>
                                <button
                                  onClick={() => startRenaming(song)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8cfbf] bg-white text-gray-500 transition-colors hover:bg-[#f5efe6] hover:text-[#111111]"
                                  aria-label="Rename song"
                                  title="Rename song"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.1 2.1 0 112.97 2.97L7.5 18.79l-4.5 1.125L4.125 15.4 16.862 3.487z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                STATUS_STYLES[song.status] || 'border-gray-200 bg-gray-50 text-gray-700'
                              }`}
                            >
                              {formatStatus(song.status)}
                            </span>
                          </div>

                          {editingSongId === song.id && renameError && (
                            <p className="text-sm text-rose-600">{renameError}</p>
                          )}

                          <div className="grid gap-2 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-4">
                            <p>
                              <span className="font-semibold text-[#111111]">Method:</span>{' '}
                              {formatMethod(song.generationMethod)}
                            </p>
                            <p>
                              <span className="font-semibold text-[#111111]">Duration:</span>{' '}
                              {formatDuration(song.duration)}
                            </p>
                            <p>
                              <span className="font-semibold text-[#111111]">Created:</span>{' '}
                              {formatDate(song.createdAt)}
                            </p>
                            <p>
                              <span className="font-semibold text-[#111111]">Expires:</span>{' '}
                              {formatDate(song.expiresAt)}
                            </p>
                          </div>
                        </div>

                        {song.status === 'completed' && (
                          <button
                            onClick={() => togglePlayer(song.id)}
                            className="inline-flex items-center justify-center rounded-xl border border-[#d8cfbf] bg-white px-4 py-2.5 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f5efe6]"
                          >
                            {openPlayers[song.id] ? 'Hide player' : 'Open player'}
                          </button>
                        )}
                      </div>

                      {song.style && (
                        <p className="mt-4 text-sm text-gray-600">
                          <span className="font-semibold text-[#111111]">Style:</span> {song.style}
                        </p>
                      )}

                      {song.status === 'completed' ? (
                        openPlayers[song.id] && (
                          <div className="mt-5">
                            <WaveformPlayer songId={song.id} title={song.title} />
                          </div>
                        )
                      ) : song.status === 'generating' ? (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          This song is still being generated. Refresh the library in a moment to check again.
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          This generation did not complete successfully.
                        </div>
                      )}

                      <div className="mt-5 grid gap-3">
                        <details className="rounded-2xl border border-[#e9e1d5] bg-white px-4 py-3">
                          <summary className="cursor-pointer text-sm font-semibold text-[#111111]">
                            Prompt details
                          </summary>
                          <div className="mt-3 space-y-3 text-sm leading-6 text-gray-600">
                            <div>
                              <p className="font-semibold text-[#111111]">Prompt</p>
                              <p className="mt-1 whitespace-pre-wrap break-words">{song.prompt}</p>
                            </div>
                            {song.engineeredPrompt && (
                              <div>
                                <p className="font-semibold text-[#111111]">Engineered prompt</p>
                                <p className="mt-1 whitespace-pre-wrap break-words">{song.engineeredPrompt}</p>
                              </div>
                            )}
                          </div>
                        </details>

                        {song.lyrics && (
                          <details className="rounded-2xl border border-[#e9e1d5] bg-white px-4 py-3">
                            <summary className="cursor-pointer text-sm font-semibold text-[#111111]">
                              Lyrics
                            </summary>
                            <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-gray-600">
                              {song.lyrics}
                            </pre>
                          </details>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#e9e1d5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Ready now</p>
            <p className="mt-3 text-3xl font-bold">{playableSongs}</p>
          </div>
          <div className="rounded-2xl border border-[#e9e1d5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Expiring soon</p>
            <p className="mt-3 text-3xl font-bold">{expiringSoonSongs}</p>
          </div>
          <div className="rounded-2xl border border-[#e9e1d5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Cards with songs</p>
            <p className="mt-3 text-3xl font-bold">{cardsWithSongs}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
