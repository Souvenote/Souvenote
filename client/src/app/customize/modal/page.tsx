'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Wand2, RefreshCcw } from 'lucide-react';
import AiChatBot from '@/app/components/AiChatBot';

type Step = 'upload' | 'details' | 'confirm';

interface FormData {
  photo: File | string | null;
  name: string;
  caption: string;
  message: string;
  fontStyle: string;
}

const FONT_STYLES = ['Classic Serif', 'Elegant Script', 'Modern Sans', 'Handwritten', 'Playful'];

export default function CustomizeModalPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [formData, setFormData] = useState<FormData>({
    photo: null,
    name: '',
    caption: '',
    message: '',
    fontStyle: 'Classic Serif',
  });

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // ChatBot Display State
  const [showCaptionAi, setShowCaptionAi] = useState(false);
  const [showMessageAi, setShowMessageAi] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 'upload') setCurrentStep('details');
    else if (currentStep === 'details') setCurrentStep('confirm');
  };

  const handleBack = () => {
    if (currentStep === 'details') setCurrentStep('upload');
    else if (currentStep === 'confirm') setCurrentStep('details');
  };

  const generateRecraftImage = () => {
    if (!aiPrompt.trim()) return;
    router.push(`/generate?prompt=${encodeURIComponent(aiPrompt)}`);
  };

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-6 fixed inset-0 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[620px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e8e8e8] px-8 py-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-[#333]">Customize Your Card</h2>
          <button 
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#f0f0f0] rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-8 border-b border-[#e8e8e8]">
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'upload' ? 'bg-[#444] text-white' : currentStep !== 'upload' ? 'bg-[#4caf50] text-white' : 'bg-[#e8e8e8] text-[#999]'}`}>
                {currentStep !== 'upload' ? '✓' : '1'}
              </div>
              <span className="text-xs font-semibold mt-2 text-[#666]">Upload</span>
            </div>
            <div className={`flex-grow h-1 ${currentStep !== 'upload' ? 'bg-[#4caf50]' : 'bg-[#e8e8e8]'}`} />

            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'details' ? 'bg-[#444] text-white' : currentStep === 'confirm' ? 'bg-[#4caf50] text-white' : 'bg-[#e8e8e8] text-[#999]'}`}>
                {currentStep === 'confirm' ? '✓' : '2'}
              </div>
              <span className="text-xs font-semibold mt-2 text-[#666]">Details</span>
            </div>
            <div className={`flex-grow h-1 ${currentStep === 'confirm' ? 'bg-[#4caf50]' : 'bg-[#e8e8e8]'}`} />

            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'confirm' ? 'bg-[#444] text-white' : 'bg-[#e8e8e8] text-[#999]'}`}>
                3
              </div>
              <span className="text-xs font-semibold mt-2 text-[#666]">Confirm</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* STEP 1: UPLOAD / GENERATE */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              
              {/* Generate with AI (Recraft) */}
              <div className="border-2 border-pink-200 bg-pink-50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-pink-900 font-bold">Generate with AI</h3>
                    <p className="text-pink-700 text-xs">Powered by Recraft AI</p>
                  </div>
                </div>

                {typeof formData.photo === 'string' && formData.photo.startsWith('http') ? (
                  <div className="mb-4 relative rounded-xl overflow-hidden aspect-[4/3] bg-black/5 flex items-center justify-center">
                    <img src={formData.photo} alt="Generated" className="object-cover max-h-full" />
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, photo: null }))}
                      className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <input 
                      type="text" 
                      placeholder="e.g. A cute red panda eating cake, digital illustration" 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    <button 
                      onClick={generateRecraftImage}
                      disabled={isGeneratingImage || !aiPrompt.trim()}
                      className="w-full py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                    </button>
                    {imageError && <p className="text-red-500 text-xs text-center">{imageError}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Upload Photo */}
              <div className="border-2 border-dashed border-[#ccc] rounded-2xl p-8 text-center hover:border-[#999] transition-colors bg-[#fafafa]">
                {formData.photo && typeof formData.photo !== 'string' ? (
                  <div className="text-green-600 font-medium">
                    ✓ {formData.photo.name}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center mb-3">
                      <svg className="w-10 h-10 text-[#bbb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[#666] font-semibold mb-1">Upload Your Photo</p>
                    <p className="text-sm text-[#999] mb-4">Drag and drop or click to browse</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-input" />
                <label htmlFor="photo-input" className="inline-block mt-2">
                  <span className="px-6 py-2 bg-[#444] text-white text-sm font-semibold rounded-lg hover:bg-[#333] transition-colors cursor-pointer">
                    {formData.photo && typeof formData.photo !== 'string' ? 'Change File' : 'Choose File'}
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleNext()}
                  className="flex-1 py-3 px-4 bg-[#444] text-white font-semibold rounded-lg hover:bg-[#333] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#333] mb-2">Card Recipient Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Sarah"
                  className="w-full px-4 py-3 border border-[#d0d0d0] rounded-lg text-[#333] focus:outline-none focus:ring-2 focus:ring-[#444]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#333]">Caption</label>
                  <button 
                    onClick={() => setShowCaptionAi(!showCaptionAi)}
                    className="text-xs font-semibold text-pink-600 flex items-center gap-1 hover:text-pink-700"
                  >
                    <Wand2 className="w-3 h-3" />
                    AI Assist
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => handleInputChange('caption', e.target.value)}
                  placeholder="e.g., Happy 30th Birthday!"
                  className="w-full px-4 py-3 border border-[#d0d0d0] rounded-lg text-[#333] mb-3 focus:outline-none focus:ring-2 focus:ring-[#444]"
                />
                {showCaptionAi && (
                  <AiChatBot 
                    type="caption" 
                    onSelect={(text) => handleInputChange('caption', text)} 
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#333]">Personal Message</label>
                  <button 
                    onClick={() => setShowMessageAi(!showMessageAi)}
                    className="text-xs font-semibold text-pink-600 flex items-center gap-1 hover:text-pink-700"
                  >
                    <Wand2 className="w-3 h-3" />
                    AI Assist
                  </button>
                </div>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Write your heartfelt message here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[#d0d0d0] rounded-lg text-[#333] mb-3 focus:outline-none focus:ring-2 focus:ring-[#444] resize-none"
                />
                {showMessageAi && (
                  <AiChatBot 
                    type="message" 
                    onSelect={(text) => handleInputChange('message', text)} 
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#333] mb-2">Font Style</label>
                <select
                  value={formData.fontStyle}
                  onChange={(e) => handleInputChange('fontStyle', e.target.value)}
                  className="w-full px-4 py-3 border border-[#d0d0d0] rounded-lg text-[#333] focus:outline-none focus:ring-2 focus:ring-[#444] bg-white"
                >
                  {FONT_STYLES.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-[#ccc] text-[#555] font-semibold rounded-lg hover:bg-[#f0f0f0]"
                >
                  Go Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 bg-[#444] text-white font-semibold rounded-lg hover:bg-[#333]"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {currentStep === 'confirm' && (
            <div className="space-y-6">
              <div className="border border-[#d0d0d0] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-[#e8e8e8]">
                      <td className="px-4 py-3 font-semibold text-[#333] bg-[#fafafa]">Card Template</td>
                      <td className="px-4 py-3 text-[#666]">Modern Minimalist</td>
                    </tr>
                    <tr className="border-b border-[#e8e8e8]">
                      <td className="px-4 py-3 font-semibold text-[#333] bg-[#fafafa]">Photo</td>
                      <td className="px-4 py-3 text-[#666]">
                        {!formData.photo 
                          ? 'No photo selected' 
                          : typeof formData.photo === 'string' 
                            ? 'Generated by Recraft AI ✓' 
                            : formData.photo.name}
                      </td>
                    </tr>
                    <tr className="border-b border-[#e8e8e8]">
                      <td className="px-4 py-3 font-semibold text-[#333] bg-[#fafafa]">Name</td>
                      <td className="px-4 py-3 text-[#666]">{formData.name || 'Not provided'}</td>
                    </tr>
                    <tr className="border-b border-[#e8e8e8]">
                      <td className="px-4 py-3 font-semibold text-[#333] bg-[#fafafa]">Caption</td>
                      <td className="px-4 py-3 text-[#666]">{formData.caption || 'Not provided'}</td>
                    </tr>
                    <tr className="border-b border-[#e8e8e8]">
                      <td className="px-4 py-3 font-semibold text-[#333] bg-[#fafafa]">Message</td>
                      <td className="px-4 py-3 text-[#666] max-w-xs break-words">{formData.message || 'Not provided'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-[#333] bg-[#fafafa]">Font Style</td>
                      <td className="px-4 py-3 text-[#666]">{formData.fontStyle}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-[#ccc] text-[#555] font-semibold rounded-lg hover:bg-[#f0f0f0]"
                >
                  Go Back
                </button>
                <button className="flex-1 py-3 px-4 bg-[#4caf50] text-white font-semibold rounded-lg hover:bg-[#45a049]" onClick={() => router.push('/cards')}>
                  Confirm & Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
