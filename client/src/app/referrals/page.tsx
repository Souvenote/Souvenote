'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { referralsApi } from '@/lib/api';

interface ReferralStats {
  totalReferrals: number;
  totalRewardsEarned: number;
  referralCode: string;
  invites: Array<{
    id: string;
    inviteeEmail: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ReferralsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [user]);

  async function loadData() {
    try {
      const [linkRes, statsRes] = await Promise.all([
        referralsApi.getLink(),
        referralsApi.getStats(),
      ]);
      setReferralLink(linkRes.referralLink);
      setStats(statsRes);
    } catch {
      // ignore
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setMessage('');
    try {
      await referralsApi.sendInvite({ inviteeEmail: email.trim(), sourceLocation: 'referrals_page' });
      setMessage(`Invite sent to ${email}!`);
      setEmail('');
      void loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error?.response?.data?.message || 'Failed to send invite.');
    } finally {
      setSending(false);
    }
  }

  function copyLink() {
    void navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Referrals & Rewards</h1>
          <p className="mt-2 text-gray-500">Invite friends and earn credits for every signup.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-gray-900">{stats?.totalReferrals ?? 0}</div>
            <div className="text-sm text-gray-500 mt-1">Friends Referred</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-pink-500">{stats?.totalRewardsEarned ?? 0}</div>
            <div className="text-sm text-gray-500 mt-1">Rewards Earned</div>
          </div>
        </div>

        {/* Reward info */}
        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5 text-sm text-pink-800">
          <strong>How it works:</strong> For each friend who signs up using your link, you earn <strong>2 image credits + 1 song credit</strong> automatically.
        </div>

        {/* Referral link */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Your Referral Link</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink || 'Loading...'}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
            />
            <button
              onClick={copyLink}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Send invite */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-900">Send an Invite</h2>
          <form onSubmit={sendInvite} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@email.com"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
          {message && (
            <p className={`text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Invite history */}
        {stats?.invites && stats.invites.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Invite History</h2>
            <div className="space-y-3">
              {stats.invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{invite.inviteeEmail}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    invite.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : invite.status === 'sent'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {invite.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
