'use client';

import { useState } from 'react';
import { useMusicStore } from '@/stores/music-store';

const OCCASIONS = ['Birthday', 'Wedding', 'Anniversary', 'Holiday', 'Graduation', 'Thank You', 'Get Well', 'Love', 'Friendship', 'Other'];
const VIBES = [
  'Bright & Playful',
  'Warm & Celebratory',
  'Romantic & Tender',
  'Nostalgic & Bittersweet',
  'Calm & Reflective',
  'Energetic & Bold',
  'Grateful & Heartfelt',
  'Joyful & Uplifting',
];
const GENRES = ['Pop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Country', 'Acoustic', 'Rock'];
const TEMPOS = ['Slow', 'Medium', 'Upbeat', 'Fast'];
const VOCALS = ['Female', 'Male', 'Instrumental Only'];
const LYRICAL_THEMES = [
  'Cherished memories together',
  'How much they mean to you',
  'Looking forward to the future',
  'Celebrating this milestone',
  'Gratitude and appreciation',
];
const INSTRUMENTATION_OPTIONS = ['Acoustic', 'Electronic', 'Orchestral', 'Mixed'];

export default function GuidedQuestionnaire() {
  const { startGeneration, setCreationChoiceView, setStep, isStartingGeneration } = useMusicStore();

  const [occasion, setOccasion] = useState('');
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [tempo, setTempo] = useState('Medium');
  const [vocal, setVocal] = useState('Female');
  const [instrumentation, setInstrumentation] = useState('Mixed');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [lyricalTheme, setLyricalTheme] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const canSubmit = occasion && mood && genre;

  const handleBack = () => {
    setCreationChoiceView('create_own');
    setStep('creation_choice');
  };

  const handleSubmit = async () => {
    setCreationChoiceView('create_own');
    startGeneration({
      mode: 'guided',
      occasion,
      mood,
      genre,
      tempo,
      vocal,
      instrumentation,
      recipientName: recipientName.trim() || undefined,
      personalMessage: personalMessage.trim() || undefined,
      lyricalTheme: lyricalTheme || undefined,
      additionalContext: additionalContext.trim() || undefined,
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
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h2 className="text-2xl font-bold mb-1">Guided Song Creation</h2>
        <p className="text-gray-500 mb-6 text-sm">Answer a few questions and we&apos;ll build the strongest prompt for your song.</p>

        <div className="space-y-6">
          <SelectGrid label="Occasion *" options={OCCASIONS} value={occasion} onChange={setOccasion} />
          <SelectGrid label="Vibe *" options={VIBES} value={mood} onChange={setMood} />
          <SelectGrid label="Genre *" options={GENRES} value={genre} onChange={setGenre} />
          <SelectGrid label="Tempo" options={TEMPOS} value={tempo} onChange={setTempo} />
          <SelectGrid label="Vocal" options={VOCALS} value={vocal} onChange={setVocal} />
          <SelectGrid label="Sound" options={INSTRUMENTATION_OPTIONS} value={instrumentation} onChange={setInstrumentation} />
          <SelectGrid label="Song Theme" options={LYRICAL_THEMES} value={lyricalTheme} onChange={setLyricalTheme} />

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
              placeholder="A message to weave into the lyrics, e.g. 'You make every day brighter'"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anything else? <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Describe a feeling, a memory, or anything that should shape the song..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isStartingGeneration}
            className={`w-full py-3.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              canSubmit && !isStartingGeneration
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
