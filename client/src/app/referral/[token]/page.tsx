'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TokenInfo {
  valid: boolean;
  referrerName: string;
  inviteeEmail: string;
}

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/referrals/verify-token/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error('invalid');
        return r.json();
      })
      .then((data) => setTokenInfo(data))
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmitOrSkip = async (skip = false) => {
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/referrals/collect-invitee-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          skip
            ? { token }
            : { token, fullName, birthday, street, city, province, postalCode, country },
        ),
      });
    } catch {
      // Silently continue even if collection fails
    }
    router.push(`/signup?ref=${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (invalid || !tokenInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-700">This invite link is invalid or has expired.</h2>
          <button
            onClick={() => router.push('/signup')}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Sign Up Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tokenInfo.referrerName} thought you'd love Souvenote!
          </h1>
          <p className="text-gray-500 mt-2">
            Send personalized greeting cards with a song made just for them.
          </p>
        </div>

        {/* Optional form */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            To help <strong>{tokenInfo.referrerName}</strong> send you something special, share a little about yourself:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Address</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Province / State"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal / ZIP code"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">This is optional — your info is only shared with {tokenInfo.referrerName}.</p>
        </div>

        {/* Actions */}
        <button
          onClick={() => handleSubmitOrSkip(false)}
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl mb-3 transition-colors"
        >
          {submitting ? 'Saving...' : 'Continue to Sign Up'}
        </button>

        <button
          onClick={() => handleSubmitOrSkip(true)}
          disabled={submitting}
          className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
        >
          Skip — just sign up
        </button>
      </div>
    </div>
  );
}
