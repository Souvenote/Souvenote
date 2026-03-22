'use client';

/**
 * Placeholder component for "Invite a Friend to Souvenote" feature.
 * This will be implemented by Rayan.
 */
export default function InviteFriendPlaceholder() {
  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-5 bg-gray-50">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-700">Invite a Friend to Souvenote</p>
          <p className="text-xs text-gray-400">Share the love while you wait</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2 italic">
        (Coming soon)
      </p>
    </div>
  );
}
