'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import request from '@/lib/api';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceLocation?: string;
  onMaybeLater?: () => void;
}

export default function ReferralModal({
  isOpen,
  onClose,
  sourceLocation = 'credits_depleted',
  onMaybeLater,
}: ReferralModalProps) {
  const { user } = useAuth();
  const [emails, setEmails] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      request<{ referralCode: string; referralLink: string }>('/referrals/link')
        .then((data) => setReferralLink(data.referralLink))
        .catch(() => {});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    const emailList = emails
      .split(/[,\n\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'));

    if (emailList.length === 0) {
      setError('Please enter at least one valid email address.');
      return;
    }

    setSending(true);
    setError('');
    const results: string[] = [];

    for (const email of emailList) {
      try {
        await request('/referrals/invite', {
          method: 'POST',
          body: { inviteeEmail: email, sourceLocation },
        });
        results.push(email);
      } catch (e: any) {
        setError(e.message || `Failed to send invite to ${email}`);
      }
    }

    setSent(results);
    setSending(false);
    if (results.length > 0) setEmails('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-2xl font-bold text-gray-900">You're out of credits</h2>
          <p className="text-gray-500 mt-1">Invite friends to keep creating</p>
        </div>

        {/* Reward callout */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-5">
          <p className="text-purple-800 font-semibold text-center">
            Get <span className="text-purple-600">2 image credits + 1 song credit</span> for every friend you invite
          </p>
        </div>

        {/* Success message */}
        {sent.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-green-700 text-sm">
            ✓ Invites sent to: {sent.join(', ')}
          </div>
        )}

        {/* Email input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Friend's email addresses
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="friend@example.com, another@example.com"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl mb-3 transition-colors"
        >
          {sending ? 'Sending...' : 'Send Invites'}
        </button>

        {/* Referral link */}
        {referralLink && (
          <div className="flex gap-2 mb-4">
            <input
              readOnly
              value={referralLink}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}

        {/* Dismiss */}
        <button
          onClick={onMaybeLater ?? onClose}
          className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
