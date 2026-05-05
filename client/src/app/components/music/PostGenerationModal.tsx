'use client';

import { useState } from 'react';
import { useMusicStore } from '@/stores/music-store';
import WaveformPlayer from './WaveformPlayer';

interface PostGenerationModalProps {
  onUseSong: () => void;
}

export default function PostGenerationModal({ onUseSong }: PostGenerationModalProps) {
  const { generatedSong, setCreationChoiceView, setStep, error } = useMusicStore();
  const [showLyrics, setShowLyrics] = useState(false);

  if (!generatedSong) return null;

  const handleUseSong = async () => onUseSong();

  const handleTryAgain = () => {
    if (generatedSong.generationMethod === 'premade') {
      setCreationChoiceView('entry');
      setStep('premade_browse');
      return;
    }

    setCreationChoiceView(
      generatedSong.generationMethod === 'card_based' ? 'entry' : 'create_own',
    );
    setStep('creation_choice');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-1">Your Song is Ready</h2>
          {generatedSong.title && (
            <p className="text-gray-500">&ldquo;{generatedSong.title}&rdquo;</p>
          )}
        </div>

        {/* Audio player */}
        {generatedSong.status === 'completed' && (
          <div className="mb-6">
            <WaveformPlayer
              songId={generatedSong.id}
              title={generatedSong.title}
            />
          </div>
        )}

        {/* Song details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
          {generatedSong.style && (
            <p className="text-gray-600">
              <span className="font-medium">Style:</span> {generatedSong.style}
            </p>
          )}
          {generatedSong.duration && (
            <p className="text-gray-600">
              <span className="font-medium">Duration:</span>{' '}
              {Math.floor(generatedSong.duration / 60)}:{(generatedSong.duration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>

        {/* Collapsible lyrics */}
        {generatedSong.lyrics && (
          <div className="mb-4">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600 cursor-pointer"
            >
              <span>{showLyrics ? 'Hide lyrics' : 'View lyrics'}</span>
              <svg
                className={`w-4 h-4 transition-transform ${showLyrics ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLyrics && (
              <div className="mt-3 px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {generatedSong.lyrics}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handleUseSong}
            className="w-full py-3.5 rounded-xl bg-[#111111] text-white font-semibold hover:bg-[#333] transition-colors cursor-pointer"
          >
            Use This Song
          </button>
          <button
            onClick={handleTryAgain}
            className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>

        {/* Storage note */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Songs you attach are stored in &ldquo;My Cards &amp; Songs&rdquo; for 30 days.
        </p>
      </div>
    </div>
  );
}
