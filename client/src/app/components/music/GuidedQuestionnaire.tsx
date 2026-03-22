'use client';

import { useState } from 'react';
import { useMusicStore } from '@/stores/music-store';
import { musicApi } from '@/lib/api';

const OCCASIONS = ['Birthday', 'Wedding', 'Anniversary', 'Holiday', 'Graduation', 'Thank You', 'Get Well', 'Love', 'Friendship', 'Other'];
const MOODS = ['Happy', 'Romantic', 'Nostalgic', 'Energetic', 'Calm', 'Bittersweet', 'Celebratory', 'Grateful'];
const GENRES = ['Pop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Country', 'Acoustic', 'Rock'];
const TEMPOS = ['Slow', 'Medium', 'Upbeat', 'Fast'];
const VOCALS = ['Female', 'Male', 'Instrumental Only'];

export default function GuidedQuestionnaire() {
  const { startGeneration, setStep } = useMusicStore();

  const [occasion, setOccasion] = useState('');
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [tempo, setTempo] = useState('Medium');
  const [vocal, setVocal] = useState('Female');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);

  const canSubmit = occasion && mood && genre;

  const handleSubmit = async () => {
    // Build prompt from selections
    const promptParts = [genre.toLowerCase(), tempo.toLowerCase(), mood.toLowerCase()];
    if (vocal !== 'Instrumental Only') {
      promptParts.push(`${vocal.toLowerCase()} vocal`);
    }
    promptParts.push(`${occasion.toLowerCase()} celebration`);
    const prompt = promptParts.join(', ');

    // Generate lyrics if vocal
    let lyrics: string | undefined;
    if (vocal !== 'Instrumental Only') {
      setIsGeneratingLyrics(true);
      try {
        const lyricsPrompt = `A ${mood.toLowerCase()} ${occasion.toLowerCase()} song${
          recipientName ? ` for ${recipientName}` : ''
        }${personalMessage ? `. Message: ${personalMessage}` : ''}`;
        const result = await musicApi.generateLyrics(lyricsPrompt);
        lyrics = result.lyrics;
      } catch {
        // Continue without lyrics if generation fails
      }
      setIsGeneratingLyrics(false);
    }

    startGeneration({
      prompt,
      lyrics,
      style: `${genre} - ${mood}`,
      generationMethod: 'guided',
    });
  };

  const SelectGrid = ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              value === opt
                ? 'bg-[#111111] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

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

        <h2 className="text-2xl font-bold mb-1">Guided Song Creation</h2>
        <p className="text-gray-500 mb-6 text-sm">Tell us about your song and we&apos;ll create it for you.</p>

        <div className="space-y-6">
          <SelectGrid label="Occasion *" options={OCCASIONS} value={occasion} onChange={setOccasion} />
          <SelectGrid label="Mood *" options={MOODS} value={mood} onChange={setMood} />
          <SelectGrid label="Genre *" options={GENRES} value={genre} onChange={setGenre} />
          <SelectGrid label="Tempo" options={TEMPOS} value={tempo} onChange={setTempo} />
          <SelectGrid label="Vocal" options={VOCALS} value={vocal} onChange={setVocal} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient&apos;s Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sarah"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#111111] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Any specific message or theme for the lyrics..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isGeneratingLyrics}
            className={`w-full py-3.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              canSubmit && !isGeneratingLyrics
                ? 'bg-[#111111] text-white hover:bg-[#333]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isGeneratingLyrics ? 'Preparing lyrics...' : 'Generate Song'}
          </button>
        </div>
      </div>
    </div>
  );
}
