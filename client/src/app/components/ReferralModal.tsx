'use client';

import { useState } from 'react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaybeLater: () => void;
}

export default function ReferralModal({ isOpen, onClose, onMaybeLater }: ReferralModalProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/referrals/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteeEmail: email }),
      });
      if (!res.ok) throw new Error('Failed to send invite');
      setSent(true);
    } catch {
      setError('Could not send invite. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Sent!</h2>
            <p className="text-gray-500 mb-6">
              When your friend signs up, you'll receive <strong>2 image credits</strong> and{' '}
              <strong>1 song credit</strong> automatically.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">✨</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're out of credits</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Invite a friend to Souvenote and earn <strong>2 image credits + 1 song credit</strong> when
                they sign up — for free.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Friend's email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={handleSendInvite}
                disabled={loading || !email.trim()}
                className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invite & Earn Credits'}
              </button>
              <button
                onClick={onMaybeLater}
                className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition text-sm"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
