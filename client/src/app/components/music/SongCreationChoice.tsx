'use client';

import { useMusicStore } from '@/stores/music-store';

export default function SongCreationChoice() {
  const { setStep, cardDesignPrompt } = useMusicStore();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Create Your Song</h2>
        <p className="text-gray-500 text-center mb-8">
          How would you like to create your song?
        </p>

        <div className="space-y-4">
          {/* Option 1: Based on card design */}
          <button
            onClick={() => setStep('guided')}
            disabled={!cardDesignPrompt}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
              cardDesignPrompt
                ? 'border-gray-200 hover:border-[#111111] hover:shadow-md'
                : 'border-gray-100 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Based on your card design</h3>
                <p className="text-gray-500 text-sm mt-1">
                  We&apos;ll create a song that matches the mood and style of your card
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Guided questionnaire */}
          <button
            onClick={() => setStep('guided')}
            className="w-full p-5 rounded-xl border-2 border-gray-200 text-left hover:border-[#111111] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Guided creation</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Answer a few questions and we&apos;ll craft the perfect song
                </p>
              </div>
            </div>
          </button>

          {/* Option 3: Manual prompt */}
          <button
            onClick={() => setStep('manual')}
            className="w-full p-5 rounded-xl border-2 border-gray-200 text-left hover:border-[#111111] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Write your own prompt</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Describe exactly what you want with a custom prompt
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
