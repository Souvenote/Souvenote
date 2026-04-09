'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import WaveformPlayer from '@/app/components/music/WaveformPlayer';
import { deliveryApi, type SharedCardPayload } from '@/lib/api';

export default function SharedCardPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [sharedCard, setSharedCard] = useState<SharedCardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('This share link is invalid.');
      setIsLoading(false);
      return;
    }

    let ignore = false;

    const loadSharedCard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await deliveryApi.getSharedCard(token);

        if (!ignore) {
          setSharedCard(payload);
        }
      } catch (nextError) {
        if (!ignore) {
          setError(nextError instanceof Error ? nextError.message : 'Could not open this shared card.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadSharedCard();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-[#faf7f2] px-6 py-10 text-[#111111]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Shared with you</p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">A Souvenote card and song</h1>
        </div>

        {error ? (
          <section className="rounded-[2rem] border border-rose-200 bg-white px-6 py-10 text-center text-rose-700 shadow-sm">
            {error}
          </section>
        ) : isLoading ? (
          <section className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
            <div className="h-[520px] animate-pulse rounded-[2rem] border border-[#e9e1d5] bg-white shadow-sm" />
            <div className="h-[520px] animate-pulse rounded-[2rem] border border-[#e9e1d5] bg-white shadow-sm" />
          </section>
        ) : sharedCard ? (
          <section className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[2rem] border border-[#e9e1d5] bg-white p-6 shadow-sm">
              <div
                className="overflow-hidden rounded-[2rem] border border-[#efe7db] bg-[#fcfaf7]"
                style={{
                  aspectRatio: (sharedCard.card.aspectRatio || '5:7').replace(':', ' / '),
                }}
              >
                {sharedCard.card.thumbnailUrl || sharedCard.card.imageUrl ? (
                  <img
                    src={sharedCard.card.thumbnailUrl || sharedCard.card.imageUrl}
                    alt={sharedCard.card.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fff8ef] via-[#fcfaf7] to-[#f4ecdf] text-7xl">
                    {sharedCard.card.previewEmoji || '💌'}
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <h2 className="text-2xl font-bold">{sharedCard.card.title}</h2>
                {sharedCard.card.occasion && (
                  <p className="text-sm text-gray-500">{sharedCard.card.occasion}</p>
                )}
                {sharedCard.card.personalMessage && (
                  <div className="rounded-2xl border border-[#e9e1d5] bg-[#fcfaf7] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                      Personal message
                    </p>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {sharedCard.card.personalMessage}
                    </p>
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[#e9e1d5] bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">For you</p>
              <h2 className="mt-2 text-3xl font-bold">
                {sharedCard.card.recipientName
                  ? `Hi ${sharedCard.card.recipientName}`
                  : 'A card made just for you'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                {sharedCard.card.deliveryMessage || sharedCard.card.caption || 'Someone shared a Souvenote card with you.'}
              </p>

              {sharedCard.song ? (
                <div className="mt-8 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Attached song</p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {sharedCard.song.title || 'Your song'}
                    </h3>
                    {sharedCard.song.style && (
                      <p className="mt-2 text-sm text-gray-500">{sharedCard.song.style}</p>
                    )}
                  </div>
                  <WaveformPlayer
                    songId={token}
                    title={sharedCard.song.title}
                    fetchAudio={deliveryApi.getSharedSongAudio}
                  />
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-[#d9cfbf] bg-[#fcfaf7] px-4 py-6 text-sm text-gray-500">
                  This card was shared without an attached song.
                </div>
              )}

              <div className="mt-8 rounded-2xl border border-[#e9e1d5] bg-[#fcfaf7] px-5 py-5">
                <p className="text-sm font-semibold text-[#111111]">Want to make one too?</p>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Create your own card, then add either a ready-to-send song or a custom AI-generated track.
                </p>
                <Link
                  href="/create"
                  className="mt-4 inline-flex rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
                >
                  Create your own card
                </Link>
              </div>
            </article>
          </section>
        ) : null}
      </div>
    </main>
  );
}
