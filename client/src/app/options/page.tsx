'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Heart, Music, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const templateThumbnails = [
  'Horoscope',
  'On This Day',
  'Comic Card',
  'Book/Movie Cover',
  'Mental Health',
  'Couples Cards',
];

const cardPacks = [
  {
    id: 'single',
    name: 'Single',
    price: 8.99,
    perCard: 8.99,
    savings: null,
    badge: null,
    cards: '1 Card',
    images: 'Unlimited',
    songs: 'Unlimited',
  },
  {
    id: 'twopack',
    name: '2-Pack',
    price: 16.99,
    perCard: 8.5,
    savings: '$0.98 saved',
    badge: null,
    cards: '2 Cards',
    images: 'Unlimited',
    songs: 'Unlimited',
  },
  {
    id: 'threepack',
    name: '3-Pack',
    price: 23.99,
    perCard: 8.0,
    savings: '$2.93 saved',
    badge: null,
    cards: '3 Cards',
    images: 'Unlimited',
    songs: 'Unlimited',
  },
  {
    id: 'fourpack',
    name: '4-Pack',
    price: 29.99,
    perCard: 7.5,
    savings: '$5.97 saved',
    badge: 'Most Popular',
    cards: '4 Cards',
    images: 'Unlimited',
    songs: 'Unlimited',
  },
  {
    id: 'fivepack',
    name: '5-Pack',
    price: 34.99,
    perCard: 7.0,
    savings: '$9.96 saved',
    badge: 'Best Value',
    cards: '5 Cards',
    images: 'Unlimited',
    songs: 'Unlimited',
  },
];

const creditPacks = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1.69,
    savings: null,
    badge: null,
    credits: '50 Credits',
    duration: 'Valid for 90 days',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 2.98,
    savings: '$0.40 saved',
    badge: 'Most Popular',
    credits: '100 Credits',
    duration: 'Valid for 90 days',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 3.87,
    savings: '$0.82 saved',
    badge: null,
    credits: '150 Credits',
    duration: 'Valid for 90 days',
  },
];

export default function OptionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pricingRef = useRef<HTMLDivElement>(null);

  const [selectedCardPack, setSelectedCardPack] = useState<string | null>(null);
  const [selectedCreditPack, setSelectedCreditPack] = useState<string | null>(null);

  const userCredits = {
    images: user?.imageCreditBalance ?? 0,
    songs: user?.songCreditBalance ?? 0
  };
  const hasCredits = userCredits.images > 0 || userCredits.songs > 0;

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOptionClick = (href: string) => {
    if (hasCredits) {
      router.push(href);
    } else {
      scrollToPricing();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How do you want to create your card?
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Choose from our curated options or build something entirely new
          </p>

          {/* Credits Display */}
          {user && (
            <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">{userCredits.images} Image Credits</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
                    <Music className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold text-purple-900">{userCredits.songs} Song Credits</span>
                </div>
            </div>
          )}
        </div>
      </section>

      {/* Option Cards Grid - 2x2 */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Card 1: Customize a Template */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Customize a Template
              </h3>
              <p className="text-gray-600 mb-6">
                Choose from our beautiful pre-designed templates and make it your own
              </p>

              {/* Mini Thumbnails Grid */}
              <div className="grid grid-cols-3 gap-3">
                {templateThumbnails.map((template, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Heart className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 font-medium px-1 line-clamp-2">
                        {template}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleOptionClick('/customize')}
                className="w-full mt-6 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
              >
                Browse Templates
              </button>
            </div>

            {/* Card 2: Build My Card */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-900">Build My Card</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Start from scratch with AI-powered assistance. Describe your vision and let our AI artist create something unique just for you.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  AI-generated artwork
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  Full customization
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  AI-generated music
                </div>
              </div>

              <button 
                onClick={() => handleOptionClick('/create')}
                className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
               >
                Start Building
              </button>
            </div>

            {/* Card 3: Ready to Send */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Ready to Send</h3>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                  <Zap className="w-3 h-3" />
                  NO CUSTOMIZATION
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Skip the design process. Choose from our instantly ready-to-mail cards and send them today.
              </p>

              {/* Mini Card Thumbnails */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                  >
                    <Heart className="w-6 h-6 text-pink-400" />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleOptionClick('/customize?ready=true')}
                className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
               >
                See All Cards
              </button>
            </div>

            {/* Card 4: My Cards & Songs */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Music className="w-8 h-8 text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-900">My Cards & Songs</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Resume work on cards you've started. Check your saved creations and continue editing, customizing, or send them to loved ones.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  Access your drafts
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  Edit anytime
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  Never lose your work
                </div>
              </div>

              <button 
                onClick={() => router.push('/my-cards')}
                className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
               >
                View My Cards
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t border-gray-200" />

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          {/* No Credits Banner */}
          {!hasCredits && (
            <div className="mb-12 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                <p className="text-orange-800 font-semibold">
                ⚠️ No credits remaining. Purchase a card pack or add AI credits to continue.
                </p>
            </div>
          )}

          {/* Card Packs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Card Packs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {cardPacks.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedCardPack(pack.id)}
                  className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCardPack === pack.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Badge */}
                  {pack.badge && (
                    <div className="absolute top-4 right-4 inline-flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full">
                      {pack.badge}
                    </div>
                  )}

                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {pack.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900">
                      ${pack.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${pack.perCard.toFixed(2)}/card
                    </p>
                    {pack.savings && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        {pack.savings}
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      {pack.cards}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      {pack.images} AI Images
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      {pack.songs} AI Songs
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    className={`w-full py-2 font-semibold rounded-lg transition-colors ${
                      selectedCardPack === pack.id
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>

            {/* Shipping Note */}
            <p className="text-sm text-gray-600 italic">
              * Cards are professionally printed and mailed directly to your recipient
            </p>
          </div>

          {/* AI Credit Packs */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">AI Credit Packs</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {creditPacks.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedCreditPack(pack.id)}
                  className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCreditPack === pack.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Badge */}
                  {pack.badge && (
                    <div className="absolute top-4 right-4 inline-flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full">
                      {pack.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <Zap className="w-8 h-8 text-yellow-500 mb-3" />

                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {pack.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900">
                      ${pack.price.toFixed(2)}
                    </p>
                    {pack.savings && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        {pack.savings}
                      </p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      {pack.credits}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-500" />
                      {pack.duration}
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    className={`w-full py-2 font-semibold rounded-lg transition-colors ${
                      selectedCreditPack === pack.id
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
