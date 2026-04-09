'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CardCanvas from '@/app/components/CardCanvas';
import { imageApi } from '@/lib/api';

function EditorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const imageUrl = searchParams.get('imageUrl') || '';
  const imageId = searchParams.get('imageId') || '';
  const aspectRatio = searchParams.get('aspectRatio') || '5:7';
  const initialText = searchParams.get('message') || '';
  const designPrompt = searchParams.get('designPrompt') || '';
  const occasion = searchParams.get('occasion') || '';
  const recipientRelationship = searchParams.get('recipientRelationship') || '';

  const [isSaving, setIsSaving] = useState(false);

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No image to edit</h2>
          <p className="text-gray-500">Please generate a card image first.</p>
          <button
            onClick={() => router.push('/create')}
            className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            Go to Card Builder
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (compositeDataUrl: string, canvasJson: Record<string, any>) => {
    setIsSaving(true);

    try {
      // Save composite to backend if we have an imageId
      if (imageId) {
        await imageApi.saveComposite(imageId, compositeDataUrl, canvasJson);
      }

      // Continue to music flow with all context
      const musicParams = new URLSearchParams();
      if (designPrompt) musicParams.set('designPrompt', designPrompt);
      if (occasion) musicParams.set('occasion', occasion);
      if (recipientRelationship) musicParams.set('recipientRelationship', recipientRelationship);
      if (initialText) musicParams.set('message', initialText);
      if (imageId) musicParams.set('imageId', imageId);

      router.push(`/create/music?${musicParams.toString()}`);
    } catch (err) {
      console.error('Failed to save composite:', err);
      // Still navigate — the composite save is non-blocking
      const musicParams = new URLSearchParams();
      if (designPrompt) musicParams.set('designPrompt', designPrompt);
      if (occasion) musicParams.set('occasion', occasion);
      if (recipientRelationship) musicParams.set('recipientRelationship', recipientRelationship);
      if (initialText) musicParams.set('message', initialText);
      if (imageId) musicParams.set('imageId', imageId);
      router.push(`/create/music?${musicParams.toString()}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Skip editor and go directly to music flow
    const musicParams = new URLSearchParams();
    if (designPrompt) musicParams.set('designPrompt', designPrompt);
    if (occasion) musicParams.set('occasion', occasion);
    if (recipientRelationship) musicParams.set('recipientRelationship', recipientRelationship);
    if (initialText) musicParams.set('message', initialText);
    if (imageId) musicParams.set('imageId', imageId);

    router.push(`/create/music?${musicParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Card Editor</h1>
            <p className="text-xs text-gray-400">Add text overlays to your card design</p>
          </div>
          {isSaving && (
            <span className="text-xs font-bold text-gray-400 animate-pulse">Saving...</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <CardCanvas
          imageUrl={imageUrl}
          aspectRatio={aspectRatio}
          initialText={initialText}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <EditorPageContent />
    </Suspense>
  );
}
