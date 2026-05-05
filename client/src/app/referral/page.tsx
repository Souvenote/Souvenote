'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Gift, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function buildReferralLink(userId: string): string {
  const ref = btoa(userId);
  return `${window.location.origin}/signup?ref=${ref}`;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const referralLink = user?.userId ? buildReferralLink(user.userId) : '';

  const handleCopy = async () => {
    if (!referralLink) return; 
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Sign in to share</h2>
          <p className="text-gray-500">Create an account to get your referral link and start earning free credits.</p>
          <button
            onClick={() => router.push('/signup')}
            className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            Sign Up Free
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        <button
          onClick={() => router.push('/options')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to options
        </button>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
            <Gift className="w-3 h-3" /> Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Share & Earn</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Invite friends to Souvenote and you'll both earn free credits when they sign up. Credit attribution is coming soon — grab your link now and start sharing.
          </p>
        </div>

        <div className="bg-white rounded-[32px] p-8 md:p-12 border-2 border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Your Referral Link</h3>
              <p className="text-xs text-gray-400">Share this link with friends and earn when they sign up.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-mono text-gray-600 focus:outline-none focus:ring-4 focus:ring-black/5 truncate"
            />
            <button
              onClick={handleCopy}
              className="px-6 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-600">How it works:</strong> Share your link. When a friend signs up using it, both of you will receive free credits. Credit tracking is in beta — rewards will be applied retroactively once the system is live.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Gift, title: 'Free Credits', desc: 'Earn credits for each signup' },
            { icon: Users, title: 'Simple Sharing', desc: 'One link works everywhere' },
            { icon: Check, title: 'Retroactive Rewards', desc: 'All referrals count from day one' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-gray-100 bg-white text-center space-y-2">
              <Icon className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="font-bold text-sm">{title}</h4>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
