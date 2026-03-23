'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message =
    typeof error?.message === 'string' && error.message !== '[object Event]'
      ? error.message
      : 'An unexpected browser error occurred. Please try again.';

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6 text-sm">
          {message}
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full py-3.5 rounded-xl bg-[#111111] text-white font-semibold hover:bg-[#333] transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/options"
            className="block w-full py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
