'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Check, ChevronRight, Type, Calendar } from 'lucide-react';

export type Step = 'upload' | 'rights' | 'birthday' | 'details' | 'confirm';

export interface Card {
  id: string | number;
  title: string;
  category: string;
  isPersonalizable: boolean;
  isPopular?: boolean;
  image?: string;
  config?: {
    requiresBirthday?: boolean;
    customFields?: string[];
  };
}

interface FormData {
  photo: File | null;
  rightsConfirmed: boolean;
  birthday: string;
  name: string;
  caption: string;
  message: string;
  fontStyle: string;
}

interface PersonalizationModalProps {
  card: Card;
  onClose: () => void;
  onComplete: (data: FormData) => void;
}

const FONT_STYLES = ['Classic Serif', 'Elegant Script', 'Modern Sans', 'Handwritten', 'Playful'];

export default function PersonalizationModal({ card, onClose, onComplete }: PersonalizationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [formData, setFormData] = useState<FormData>({
    photo: null,
    rightsConfirmed: false,
    birthday: '',
    name: '',
    caption: '',
    message: '',
    fontStyle: 'Classic Serif',
  });

  // Steps sequence based on card config
  const steps: Step[] = ['upload', 'rights'];
  if (card.config?.requiresBirthday || card.category === 'Birthday') {
    steps.push('birthday');
  }
  steps.push('details', 'confirm');

  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
      handleNext();
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Personalize Your Card</h2>
            <p className="text-sm text-gray-500 mt-1">{card.title} • {card.category}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="px-8 py-4 bg-gray-50/50 flex justify-between items-center">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  idx < currentStepIndex ? 'bg-green-500 text-white' : 
                  idx === currentStepIndex ? 'bg-black text-white ring-4 ring-black/10' : 
                  'bg-gray-200 text-gray-400'
                }`}>
                  {idx < currentStepIndex ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-grow h-1 mx-2 rounded-full transition-all ${
                  idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8">
          {currentStep === 'upload' && (
            <div className="space-y-6 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload your photo</h3>
                <p className="text-gray-500 mb-8">Upload a photo and we'll reimagine it in this card's style.</p>
                
                <label className="block border-2 border-dashed border-gray-200 rounded-3xl p-12 hover:border-black transition-all cursor-pointer bg-gray-50/30 group">
                  <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                  <div className="bg-white w-16 h-16 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Click to upload photo</span>
                  <p className="text-xs text-gray-400 mt-2">JPG or PNG (Max 10MB)</p>
                </label>
                
                <button 
                  onClick={handleSkip}
                  className="mt-6 text-sm text-gray-400 font-medium hover:text-gray-900 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {currentStep === 'rights' && (
            <div className="max-w-md mx-auto space-y-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Image Rights</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                By clicking confirm, you attest that you have the legal right to use this image and it does not infringe on any third-party rights.
              </p>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => { updateField('rightsConfirmed', true); handleNext(); }}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-shadow shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {currentStep === 'birthday' && (
            <div className="max-w-md mx-auto space-y-6">
              <h3 className="text-xl font-bold text-gray-900 text-center">When is their Birthday?</h3>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="date" 
                  value={formData.birthday}
                  onChange={(e) => updateField('birthday', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <button 
                onClick={handleNext}
                disabled={!formData.birthday}
                className="w-full px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {currentStep === 'details' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mom"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Caption</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Happy Birthday!"
                    value={formData.caption}
                    onChange={(e) => updateField('caption', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Personal Message</label>
                </div>
                <textarea 
                  rows={4}
                  placeholder="Write your heartfelt message here..."
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Type className="w-3.5 h-3.5" />
                  Font Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FONT_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => updateField('fontStyle', style)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                        formData.fontStyle === style 
                        ? 'bg-black text-white border-black shadow-md' 
                        : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleBack}
                  className="px-8 py-4 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-grow px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 shadow-lg"
                >
                  Review Summary
                </button>
              </div>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-4">Personalization Summary</h3>
                <div className="grid gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Photo</span>
                    <span className="font-semibold">{formData.photo ? formData.photo.name : 'None (placeholder used)'}</span>
                  </div>
                  {formData.birthday && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Birthday</span>
                      <span className="font-semibold">{formData.birthday}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span className="font-semibold">{formData.name || 'Default'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Caption</span>
                    <span className="font-semibold">{formData.caption || 'Default'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Font</span>
                    <span className="font-semibold">{formData.fontStyle}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <span className="text-gray-400 block mb-2">Message</span>
                    <p className="text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 italic">
                      {formData.message || 'No personal message added.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleBack}
                  className="px-8 py-4 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onComplete(formData)}
                  className="flex-grow px-8 py-4 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl font-bold shadow-xl hover:scale-[1.02] transition-all"
                >
                  Create My Card
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
