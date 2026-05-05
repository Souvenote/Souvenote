'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, ExternalLink, Loader2 } from 'lucide-react';

function InfiniteKanvasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl') || '';
  const aspectRatio = searchParams.get('aspectRatio') || '3:4';
  const returnTo = searchParams.get('returnTo') || 'editor';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  const enabled = process.env.NEXT_PUBLIC_ENABLE_INFINITE_KANVAS === 'true';

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== 'https://fal.ai' && event.origin !== 'https://www.fal.ai') {
        return;
      }

      const { type, payload } = event.data || {};

      if (type === 'kanvas:loaded') {
        setLoaded(true);
      }

      if (type === 'kanvas:save' && payload?.url) {
        setSavedUrl(payload.url);
      }
    },
    [],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const handleContinue = () => {
    const finalUrl = savedUrl || imageUrl;

    if (returnTo === 'editor') {
      const params = new URLSearchParams({
        designPrompt: 'Edited via infinite-kanvas',
        imageUrl: finalUrl,
        aspectRatio,
      });
      router.push(`/create/editor?${params.toString()}`);
    } else {
      router.push('/create');
    }
  };

  const handleSkip = () => {
    handleContinue();
  };

  if (!enabled || !imageUrl) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
            <ExternalLink className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold">Preview unavailable</h2>
          <p className="text-gray-500">
            {!enabled
              ? 'infinite-kanvas is not enabled. Set NEXT_PUBLIC_ENABLE_INFINITE_KANVAS=true to activate.'
              : 'No image URL provided.'}
          </p>
          <button
            onClick={handleSkip}
            className="px-8 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
          >
            Continue to Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Quick Edit Preview</h1>
        </div>
        <div className="flex items-center gap-3">
          {savedUrl && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
              <Check className="w-4 h-4" /> Edit saved
            </span>
          )}
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
          >
            Continue
          </button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto h-full">
          {!loaded && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                <p className="text-sm text-gray-400 font-medium">Loading infinite-kanvas...</p>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={`https://fal.ai/models/fal-ai/infinite-kanvas?source=${encodeURIComponent(imageUrl)}`}
            className={`w-full rounded-2xl border border-gray-200 shadow-lg transition-opacity duration-500 ${
              loaded ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
            style={{ height: 'calc(100vh - 140px)' }}
            allow="clipboard-write"
            title="infinite-kanvas preview"
          />
        </div>
      </div>
    </div>
  );
}

export default function InfiniteKanvasPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      }
    >
      <InfiniteKanvasContent />
    </Suspense>
  );
}
