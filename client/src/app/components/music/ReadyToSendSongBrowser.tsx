'use client';

import { useEffect, useMemo, useState } from 'react';
import { premadeSongsApi, type PremadeSongRecord } from '@/lib/api';
import { useMusicStore } from '@/stores/music-store';
import WaveformPlayer from './WaveformPlayer';

export default function ReadyToSendSongBrowser() {
  const { error, isStartingGeneration, selectPremadeSong, setStep } = useMusicStore();
  const [songs, setSongs] = useState<PremadeSongRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');

  useEffect(() => {
    let ignore = false;

    const loadSongs = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const records = await premadeSongsApi.getAll();

        if (!ignore) {
          setSongs(records);
        }
      } catch (nextError) {
        if (!ignore) {
          setLoadError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not load ready songs right now.',
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadSongs();

    return () => {
      ignore = true;
    };
  }, []);

  const occasions = useMemo(
    () => ['All', ...Array.from(new Set(songs.map((song) => song.occasion)))],
    [songs],
  );

  const moods = useMemo(() => {
    const occasionFilteredSongs =
      selectedOccasion === 'All'
        ? songs
        : songs.filter((song) => song.occasion === selectedOccasion);

    return ['All', ...Array.from(new Set(occasionFilteredSongs.map((song) => song.mood)))];
  }, [selectedOccasion, songs]);

  useEffect(() => {
    if (!moods.includes(selectedMood)) {
      setSelectedMood('All');
    }
  }, [moods, selectedMood]);

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) => {
        if (selectedOccasion !== 'All' && song.occasion !== selectedOccasion) {
          return false;
        }

        if (selectedMood !== 'All' && song.mood !== selectedMood) {
          return false;
        }

        return true;
      }),
    [selectedMood, selectedOccasion, songs],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-[#111111]">Ready to Send Songs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse curated songs by occasion and mood. These picks do not use AI song credits.
            </p>
          </div>
          <button
            onClick={() => setStep('creation_choice')}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Occasion
              </p>
              <div className="flex flex-wrap gap-2">
                {occasions.map((occasion) => (
                  <button
                    key={occasion}
                    onClick={() => setSelectedOccasion(occasion)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedOccasion === occasion
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Mood
              </p>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedMood === mood
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loadError}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-gray-100 bg-[#fcfcfc] p-5 shadow-sm">
                  <div className="h-6 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="mt-3 h-4 animate-pulse rounded bg-gray-100" />
                  <div className="mt-5 h-24 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-[#fcfcfc] px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-[#111111]">
                {songs.length === 0 ? 'Ready song catalog is empty' : 'No ready songs in this view'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {songs.length === 0
                  ? 'The ready-to-send songs only appear after the catalog has been seeded on the server.'
                  : 'Try a different occasion or mood filter.'}
              </p>
              {songs.length === 0 && (
                <p className="mt-3 text-xs text-gray-400">
                  Run `npm run seed:premade-songs` in `server` to generate the first catalog.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredSongs.map((song) => (
                <article
                  key={song.id}
                  className="rounded-3xl border border-gray-100 bg-[#fcfcfc] p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#111111]">{song.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">{song.description}</p>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Free pick
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                      {song.occasion}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                      {song.mood}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1">
                      {song.genre}
                    </span>
                  </div>

                  <div className="mt-5">
                    <WaveformPlayer
                      songId={song.id}
                      title={song.title}
                      fetchAudio={premadeSongsApi.getAudio}
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-500">
                      {song.style && <p>{song.style}</p>}
                      {song.duration ? (
                        <p className="mt-1">
                          Duration: {Math.floor(song.duration / 60)}:
                          {(song.duration % 60).toString().padStart(2, '0')}
                        </p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => void selectPremadeSong(song.id)}
                      disabled={isStartingGeneration}
                      className="rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isStartingGeneration ? 'Selecting...' : 'Choose This Song'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
