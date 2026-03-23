'use client';

import { useState } from 'react';
import { musicApi } from '@/lib/api';
import { useMusicStore } from '@/stores/music-store';

export default function ManualPromptView() {
  const { startGeneration, setStep, isStartingGeneration } = useMusicStore();

  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [showLyrics, setShowLyrics] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementNotes, setEnhancementNotes] = useState<string[]>([]);
  const [enhancementError, setEnhancementError] = useState<string | null>(null);

  const canSubmit = prompt.trim().length > 5;

  const handleEnhancePrompt = async () => {
    if (!canSubmit || isEnhancing) return;

    setIsEnhancing(true);
    setEnhancementError(null);

    try {
      const result = await musicApi.enhancePrompt(prompt.trim());
      setPrompt(result.enhancedPrompt);
      setEnhancementNotes(result.changes);
    } catch (error) {
      setEnhancementError(
        error instanceof Error ? error.message : 'Failed to enhance your prompt',
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = () => {
    startGeneration({
      mode: 'custom',
      prompt: prompt.trim(),
      lyrics: lyrics.trim() || undefined,
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

        <h2 className="text-2xl font-bold mb-1">Manual Prompting</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Write freely, then use the magic wand to sharpen the prompt before generation.
        </p>

        <div className="space-y-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Prompt tips</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Start with the genre and mood you want.</li>
              <li>Add a tempo or energy level if it matters.</li>
              <li>Mention standout instruments or textures.</li>
              <li>Describe the feeling you want the chorus to land with.</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Song Description *
              </label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={!canSubmit || isEnhancing}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  canSubmit && !isEnhancing
                    ? 'border-gray-200 text-gray-700 hover:border-[#111111] hover:text-[#111111]'
                    : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <span aria-hidden="true">AI</span>
                {isEnhancing ? 'Enhancing...' : 'Magic Wand'}
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Warm acoustic birthday song with a bright chorus, gentle guitar, light percussion, and an intimate female vocal"
              rows={5}
              disabled={isEnhancing}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{prompt.length} characters</p>
          </div>

          {enhancementNotes.length > 0 && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-2">Prompt improved</p>
              <ul className="space-y-1">
                {enhancementNotes.map((note) => (
                  <li key={note}>- {note}</li>
                ))}
              </ul>
            </div>
          )}

          {enhancementError && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
              {enhancementError}
            </div>
          )}

          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className="text-sm text-[#111111] font-medium hover:underline cursor-pointer"
          >
            {showLyrics ? 'Hide lyrics input' : '+ Add custom lyrics (optional)'}
          </button>

          {!showLyrics && (
            <p className="-mt-2 text-xs text-gray-400">
              Leave this empty and we will generate lyrics from your prompt.
            </p>
          )}

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
            disabled={!canSubmit || isEnhancing || isStartingGeneration}
            className={`w-full py-3.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              canSubmit && !isEnhancing && !isStartingGeneration
                ? 'bg-[#111111] text-white hover:bg-[#333]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isStartingGeneration ? 'Starting...' : 'Generate Song'}
          </button>
        </div>
      </div>
    </div>
  );
}
