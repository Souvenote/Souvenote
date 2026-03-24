'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ReadyCardMessageModalProps {
  cardTitle: string;
  cardCategory: string;
  onClose: () => void;
  onComplete: (message: string) => void;
}

export default function ReadyCardMessageModal({
  cardTitle,
  cardCategory,
  onClose,
  onComplete,
}: ReadyCardMessageModalProps) {
  const [message, setMessage] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send This Card</h2>
            <p className="mt-1 text-sm text-gray-500">
              {cardTitle} • {cardCategory}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6 p-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Personal Message</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Add the message that should appear inside the card, then continue to the music step.
            </p>
          </div>

          <textarea
            rows={7}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write your message here..."
            className="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700 outline-none transition-colors focus:border-black"
          />

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onComplete(message)}
              className="flex-1 rounded-xl bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-900"
            >
              Continue to Music
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
