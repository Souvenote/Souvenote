'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { cardPromptApi } from '@/lib/api';

const QUICK_PRESETS = [
  'Happy Birthday',
  'I love you',
  'Happy Anniversary',
  'Thank you',
  'Congratulations',
  'Merry Christmas',
  "Happy Mother's Day",
  "Happy Father's Day",
  'Happy Easter',
  'Just Because',
];

interface Props {
  recipientName: string;
  recipientRelationship: string;
  occasion: string;
  moodPrimary: string;
  moodSecondary: string | null;
  scenario: string;
  style: string;
  decorativeElements: string[];
  textContent: string;
  onSetField: (field: string, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

type TextPath = 'generate' | 'custom' | 'preset';

export default function PhaseCardText({
  recipientName,
  recipientRelationship,
  occasion,
  moodPrimary,
  moodSecondary,
  scenario,
  style,
  decorativeElements,
  textContent,
  onSetField,
  onBack,
  onNext,
}: Props) {
  const [path, setPath] = useState<TextPath>('generate');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [customInput, setCustomInput] = useState(textContent);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await cardPromptApi.generateTextOptions({
        recipient_name: recipientName || '',
        recipient_relationship: recipientRelationship || '',
        occasion: occasion || '',
        mood_primary: moodPrimary || '',
        mood_secondary: moodSecondary || null,
        memory_or_feeling: scenario || undefined,
        style: style || undefined,
        decorative_elements: decorativeElements.length > 0 ? decorativeElements : undefined,
        locale: 'en-US',
      });
      setOptions(result.options);
    } catch {
      setOptions(['Happy ' + (occasion || 'Birthday') + ', ' + (recipientName || 'you') + '!']);
    } finally {
      setGenerating(false);
    }
  };

  const selectOption = (option: string) => {
    setSelectedOption(option);
    onSetField('textContent', option);
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedOption(preset);
    onSetField('textContent', preset);
  };

  const handleCustomChange = (value: string) => {
    setCustomInput(value);
    if (value.length <= 80) {
      onSetField('textContent', value);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Front-of-Card Text</h2>
        <p className="text-gray-500">What should the front of the card say? Choose your path below.</p>
      </div>

      {/* Path Selection */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setPath('generate')}
          className={`p-6 rounded-2xl border-2 text-center transition-all ${
            path === 'generate' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <Sparkles className={`w-6 h-6 mx-auto mb-2 ${path === 'generate' ? 'text-black' : 'text-gray-300'}`} />
          <div className="text-sm font-bold">Generate for me</div>
          <div className="text-[10px] text-gray-400 mt-1">Recommended</div>
        </button>
        <button
          onClick={() => setPath('custom')}
          className={`p-6 rounded-2xl border-2 text-center transition-all ${
            path === 'custom' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="text-2xl mb-2">✏️</div>
          <div className="text-sm font-bold">Custom text</div>
          <div className="text-[10px] text-gray-400 mt-1">Write your own</div>
        </button>
        <button
          onClick={() => setPath('preset')}
          className={`p-6 rounded-2xl border-2 text-center transition-all ${
            path === 'preset' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-sm font-bold">Quick preset</div>
          <div className="text-[10px] text-gray-400 mt-1">One tap</div>
        </button>
      </div>

      {/* Generate Path */}
      {path === 'generate' && (
        <div className="space-y-6">
          {options.length === 0 && !generating && (
            <button
              onClick={handleGenerate}
              className="w-full py-6 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all"
            >
              <Sparkles className="w-5 h-5" /> Generate 4 Options for Me
            </button>
          )}
          {generating && (
            <div className="bg-gray-50 p-12 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium text-gray-500">Generating text options...</span>
            </div>
          )}
          {options.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => selectOption(opt)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      selectedOption === opt ? 'border-black bg-gray-50 shadow-md' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium leading-relaxed">{opt}</span>
                      <span className="text-[10px] text-gray-400 ml-3 shrink-0">{opt.length}/80</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-4 border-2 border-gray-200 rounded-2xl font-bold text-sm text-gray-500 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Generate again
              </button>
            </>
          )}
        </div>
      )}

      {/* Custom Path */}
      {path === 'custom' && (
        <div className="space-y-3">
          <textarea
            rows={3}
            maxLength={80}
            placeholder="Type your front-of-card text..."
            value={customInput}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 resize-none text-lg"
          />
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">{customInput.length}/80 chars max</span>
            {customInput.length > 80 && (
              <span className="text-xs text-red-500">Text will be truncated</span>
            )}
          </div>
        </div>
      )}

      {/* Preset Path */}
      {path === 'preset' && (
        <div className="grid grid-cols-2 gap-3">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                selectedOption === preset ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      <div className="pt-8 border-t border-gray-100 flex justify-between">
        <button onClick={onBack} className="px-8 py-4 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!textContent && !selectedOption && !customInput}
          className="px-10 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl disabled:opacity-30"
        >
          Review &amp; Create <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
