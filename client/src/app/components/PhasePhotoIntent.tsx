'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Plus,
  Sparkles,
  ShieldCheck,
  Image,
} from 'lucide-react';
import { analyzePhoto, aspectRatioFromOrientation } from '@/lib/photo-analyzer';
import type { ImageUsageMode, MultiSubjectIntent, Orientation } from '@/stores/build-my-card-store';

interface Props {
  referenceImages: File[];
  identityPreservation: boolean;
  imageUsageMode: ImageUsageMode | null;
  multiSubjectIntent: MultiSubjectIntent;
  orientation: Orientation;
  colorPalette: string;
  isCustomMode: boolean;
  faceCount: number;
  recipientRelationship: string;
  recipientName: string;
  onSetImages: (files: File[]) => void;
  onSetField: (field: string, value: any) => void;
  onPhotoAnalyzed: (analysis: { width: number; height: number; orientation: Orientation; faceCount: number }) => void;
  onBack: () => void;
  onNext: () => void;
}

const RELATIONSHIPS = [
  'Partner', 'Friend', 'Best friend', 'Mom', 'Dad',
  'Family member', 'Myself', 'Coworker', 'Teacher',
];

const COLOR_FEELS = ['Warm', 'Soft', 'Bright', 'Cool', 'Dark', 'Muted'];

export default function PhasePhotoIntent({
  referenceImages,
  identityPreservation,
  imageUsageMode,
  multiSubjectIntent,
  orientation,
  colorPalette,
  isCustomMode,
  faceCount,
  recipientRelationship,
  recipientName,
  onSetImages,
  onSetField,
  onPhotoAnalyzed,
  onBack,
  onNext,
}: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onSetImages([...referenceImages, ...newFiles].slice(0, 16));
    }
  };

  const removeImage = (index: number) => {
    const filtered = referenceImages.filter((_, i) => i !== index);
    onSetImages(filtered);
    if (filtered.length === 0) {
      onSetField('identityPreservation', false);
      onPhotoAnalyzed({ width: 0, height: 0, orientation: 'portrait', faceCount: 0 });
      setAnalysisComplete(false);
    }
  };

  // Analyze the first uploaded photo to derive orientation/aspect ratio
  useEffect(() => {
    if (referenceImages.length > 0 && !analysisComplete && !analyzing) {
      setAnalyzing(true);
      analyzePhoto(referenceImages[0]).then((analysis) => {
        onPhotoAnalyzed(analysis);
        onSetField('orientation', analysis.orientation);
        onSetField('aspectRatio', aspectRatioFromOrientation(analysis.orientation));
        onSetField('identityPreservation', true);
        setAnalysisComplete(true);
        setAnalyzing(false);
      }).catch(() => {
        setAnalyzing(false);
      });
    }
  }, [referenceImages, analysisComplete, analyzing, onSetField, onPhotoAnalyzed]);

  // When user has no photos, auto-route them to "transform" mode (fully illustrated card).
  // When they upload a photo, clear the auto-default so they actively pick the right mode.
  useEffect(() => {
    if (referenceImages.length === 0) {
      if (imageUsageMode !== 'transform') {
        onSetField('imageUsageMode', 'transform');
      }
    } else if (imageUsageMode === 'transform' && !analysisComplete) {
      // Reset so the user re-confirms intent for their newly uploaded photo
      onSetField('imageUsageMode', null);
    }
  }, [referenceImages.length, imageUsageMode, analysisComplete, onSetField]);

  const hasPhoto = referenceImages.length > 0;
  const showBranchQuestion = hasPhoto && analysisComplete;

  const handleBranchSelect = (mode: ImageUsageMode) => {
    onSetField('imageUsageMode', mode);
  };

  const canProceed =
    !!recipientRelationship &&
    (
      (hasPhoto && analysisComplete && !!imageUsageMode) ||
      (!hasPhoto && imageUsageMode === 'transform')
    );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Recipient &amp; Photo</h2>
        <p className="text-gray-500">Tell us who this is for and upload a photo.</p>
      </div>

      <div className="space-y-10">
        {/* Relationship */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Who is this card for?</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((rel) => (
              <button
                key={rel}
                onClick={() => onSetField('recipientRelationship', rel)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${
                  recipientRelationship === rel
                    ? 'bg-black text-white border-black shadow-lg scale-105 z-10'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Name */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Recipient Name</label>
          <input
            type="text"
            placeholder="e.g., Ceren"
            value={recipientName}
            maxLength={60}
            onChange={(e) => onSetField('recipientName', e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5"
          />
          <p className="text-[10px] text-gray-400">{recipientName.length}/60 chars</p>
        </div>

        {/* Photo Upload */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Upload a Photo (Optional)</label>
            <span className="text-[10px] text-gray-400 font-bold">{referenceImages.length}/16 images</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {referenceImages.map((img, idx) => (
              <div key={idx} className="aspect-square bg-gray-100 rounded-2xl relative overflow-hidden group shadow-sm">
                <img src={URL.createObjectURL(img)} alt="ref" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {referenceImages.length < 16 && (
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-black/20 hover:bg-gray-50 transition-all">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                <Plus className="w-6 h-6 text-gray-300" />
              </label>
            )}
          </div>

          {!hasPhoto && (
            <p className="text-xs text-gray-400 italic">
              No photo? No problem — we'll create a fully illustrated card for you.
            </p>
          )}

          {analyzing && (
            <div className="bg-blue-50 p-6 rounded-[25px] flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">Analyzing photo...</span>
            </div>
          )}

          {analysisComplete && hasPhoto && (
            <div className="bg-gray-50 p-8 rounded-[35px] space-y-4 border border-gray-100">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-bold">
                  Photo ready &middot; {orientation === 'landscape' ? 'Landscape (7:5)' : 'Portrait (5:7)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Branch Selection */}
        {showBranchQuestion && (
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
              How should we use your photo?
            </label>
            <div className="grid grid-cols-1 gap-4">
              {([
                {
                  mode: 'preserve' as ImageUsageMode,
                  icon: ShieldCheck,
                  title: 'Keep it exactly the same',
                  desc: 'Only add text, borders, and decorative overlays. The photo stays unchanged.',
                },
                {
                  mode: 'transform' as ImageUsageMode,
                  icon: Sparkles,
                  title: 'Reimagine the scene around you',
                  desc: 'Your face stays recognizable, but pose, clothes, and surroundings can change in a new artistic style.',
                },
                {
                  mode: 'enhance' as ImageUsageMode,
                  icon: Image,
                  title: 'Re-render the same image in a new style',
                  desc: 'Everything stays the same — only the artistic medium changes. Photo becomes illustration.',
                },
              ]).map(({ mode, icon: Icon, title, desc }) => (
                <button
                  key={mode}
                  onClick={() => handleBranchSelect(mode)}
                  className={`p-6 rounded-[28px] border-2 text-left transition-all ${
                    imageUsageMode === mode
                      ? 'border-black bg-gray-50 shadow-lg'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      imageUsageMode === mode ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold">{title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Mode Toggle */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => onSetField('isCustomMode', !isCustomMode)}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
              isCustomMode
                ? 'bg-black text-white'
                : 'border-2 border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
            }`}
          >
            {isCustomMode ? 'Custom Mode: ON' : 'Custom Mode: OFF'} — Fine-tune advanced settings
          </button>

          {isCustomMode && analysisComplete && (
            <div className="mt-6 space-y-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              {faceCount > 1 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Multi-Person Intent ({faceCount} faces detected)
                  </label>
                  <div className="flex gap-2">
                    {(['all', 'centered', 'custom'] as const).map((intent) => (
                      <button
                        key={intent}
                        onClick={() => onSetField('multiSubjectIntent', intent)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          multiSubjectIntent === intent
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {intent === 'all' ? 'All of them' : intent === 'centered' ? 'Largest person' : 'Custom'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Orientation</label>
                <div className="flex gap-2">
                  {(['portrait', 'landscape'] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => {
                        onSetField('orientation', o);
                        onSetField('aspectRatio', aspectRatioFromOrientation(o));
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                        orientation === o
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {o} ({o === 'landscape' ? '7:5' : '5:7'})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Color Feel</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_FEELS.map((cf) => (
                    <button
                      key={cf}
                      onClick={() => onSetField('colorPalette', cf)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        colorPalette === cf
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {cf}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-12 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-10 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-bold flex items-center gap-2 hover:border-black hover:text-black transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-12 py-5 bg-black text-white rounded-3xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-30 shadow-2xl active:scale-95"
        >
          Next Step <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
