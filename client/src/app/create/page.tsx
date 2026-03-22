'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Thank You',
  'Holiday',
  'Love',
  'Graduation',
];

const STYLES = [
  'Elegant',
  'Playful',
  'Minimal',
  'Romantic',
  'Bold',
  'Whimsical',
];

const COLORS = ['Warm tones', 'Soft pastels', 'Classic black and white', 'Floral colors', 'Gold accents', 'Bright celebration'];

export default function CreatePage() {
  const router = useRouter();
  const [occasion, setOccasion] = useState('Birthday');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [style, setStyle] = useState('Elegant');
  const [colorPalette, setColorPalette] = useState('Warm tones');
  const [format, setFormat] = useState<'physical' | 'digital'>('digital');
  const [extraNotes, setExtraNotes] = useState('');

  const designPrompt = useMemo(() => {
    return [
      `${format} greeting card`,
      `${occasion.toLowerCase()} occasion`,
      recipient ? `for ${recipient}` : null,
      `${style.toLowerCase()} visual style`,
      `${colorPalette.toLowerCase()} palette`,
      message ? `with a message that says "${message}"` : null,
      extraNotes ? extraNotes : null,
    ]
      .filter(Boolean)
      .join(', ');
  }, [colorPalette, extraNotes, format, message, occasion, recipient, style]);

  const handleContinue = () => {
    const searchParams = new URLSearchParams({
      designPrompt,
      occasion,
      format,
    });

    if (recipient) {
      searchParams.set('recipient', recipient);
    }

    router.push(`/create/music?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#111111] font-sans">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-gray-400">Card creator</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Build a card concept to test music generation</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
              The full image generation workspace is still in progress. For now, this page builds a structured card concept and sends it straight into the music flow.
            </p>
          </div>

          <Link href="/cards" className="shrink-0 text-sm text-gray-500 transition-colors hover:text-[#111111]">
            Browse templates
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Occasion</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                >
                  {OCCASIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['digital', 'physical'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFormat(item)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                        format === item
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-gray-200 bg-white text-[#111111] hover:border-gray-400'
                      }`}
                    >
                      {item === 'digital' ? 'Digital' : 'Physical'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Recipient</label>
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                >
                  {STYLES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Color palette</label>
                <select
                  value={colorPalette}
                  onChange={(e) => setColorPalette(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                >
                  {COLORS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Front message</label>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Extra notes</label>
              <textarea
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                rows={4}
                placeholder="Describe the mood, imagery, or details you want the card design to suggest to the music flow."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-black resize-none"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl bg-[#111111] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d2d2d]"
              >
                Continue to Music Generation
              </button>
              <p className="text-xs text-gray-400">This skips the unfinished checkout/image approval steps and lets you test the music workflow directly.</p>
            </div>
          </section>

          <aside className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-gray-400">Preview prompt</p>
            <h2 className="mt-3 text-xl font-semibold">What the music flow will receive</h2>

            <div className="mt-6 rounded-2xl bg-[#f6f6f3] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">Design prompt</p>
              <p className="mt-3 text-sm leading-6 text-gray-700">{designPrompt}</p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-500">
              <p>
                <span className="font-medium text-[#111111]">Occasion:</span> {occasion}
              </p>
              <p>
                <span className="font-medium text-[#111111]">Format:</span> {format}
              </p>
              <p>
                <span className="font-medium text-[#111111]">Recipient:</span> {recipient || 'Not set'}
              </p>
              <p>
                <span className="font-medium text-[#111111]">Style:</span> {style}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
              Use this page when you want to test the music generation flow without waiting for the unfinished card image workspace.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
