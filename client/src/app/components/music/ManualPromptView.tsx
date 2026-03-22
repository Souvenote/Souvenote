'use client';

import { useState } from 'react';
import { useMusicStore } from '@/stores/music-store';

export default function ManualPromptView() {
  const { startGeneration, setStep } = useMusicStore();

  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [showLyrics, setShowLyrics] = useState(false);

  const canSubmit = prompt.trim().length > 5;

  const handleSubmit = () => {
    startGeneration({
      prompt: prompt.trim(),
      lyrics: lyrics.trim() || undefined,
      generationMethod: 'manual_prompt',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
        <button
          onClick={() => setStep('creation_choice')}
          className="text-gray-400 hover:text-gray-600 mb-4 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-1">Write Your Prompt</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Describe the song you want. Include genre, mood, tempo, and vocal style.
        </p>

        <div className="space-y-5">
          {/* Prompt hints */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Prompt tips</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Include a <strong>genre</strong>: pop, jazz, R&B, electronic, classical</li>
              <li>Add a <strong>mood</strong>: happy, romantic, nostalgic, energetic</li>
              <li>Specify <strong>tempo</strong>: slow, medium, upbeat, fast</li>
              <li>Choose <strong>vocal</strong>: male vocal, female vocal, or instrumental</li>
            </ul>
          </div>

          {/* Prompt input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Song Description *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. pop, upbeat, happy birthday celebration, female vocal, acoustic guitar"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{prompt.length} characters</p>
          </div>

          {/* Optional lyrics toggle */}
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className="text-sm text-[#111111] font-medium hover:underline cursor-pointer"
          >
            {showLyrics ? 'Hide lyrics input' : '+ Add custom lyrics (optional)'}
          </button>

          {showLyrics && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Lyrics
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={`[Verse]\nYour lyrics here...\n\n[Chorus]\nYour chorus here...`}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#111111] transition-colors resize-none font-mono text-sm"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              canSubmit
                ? 'bg-[#111111] text-white hover:bg-[#333]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Generate Song
          </button>
        </div>
      </div>
    </div>
  );
}
