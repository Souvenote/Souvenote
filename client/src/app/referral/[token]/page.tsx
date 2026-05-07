'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [referrerName, setReferrerName] = useState('');

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/referrals/validate/${token}`)
      .then((r) => r.json())
      .then((data) => {
        setValid(data.valid);
        setReferrerName(data.referrerName || 'Someone');
      })
      .catch(() => setValid(false))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/referrals/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, contactName: name, birthday: birthday || undefined, mailingAddress: address || undefined }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = () => {
    router.push(`/signup?referral=${token}`);
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500">This referral link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanks!</h1>
          <p className="text-gray-500 mb-6">
            Your info was saved. Ready to join Souvenote and start making cards?
          </p>
          <button
            onClick={handleSignUp}
            className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition"
          >
            Create Your Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {referrerName} invited you to Souvenote
          </h1>
          <p className="text-gray-500 text-sm">
            Create beautiful personalized greeting cards with AI art and custom songs.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Birthday (optional)</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mailing Address (optional)</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, Province, Postal Code"
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>

          <button
            onClick={handleSignUp}
            className="w-full py-3 text-gray-500 text-sm font-medium hover:text-gray-700 transition"
          >
            Skip & sign up directly →
          </button>
        </div>
      </div>
    </div>
  );
}
