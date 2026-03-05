'use client';

import React from 'react';
import { CardTemplate } from '@/types/card';

interface CardListingProps {
  card: CardTemplate;
  onSelectAsIs: (card: CardTemplate) => void;
  onPersonalize: (card: CardTemplate) => void;
  onBuildMyOwn: () => void;
}

export default function CardListing({
  card,
  onSelectAsIs,
  onPersonalize,
  onBuildMyOwn,
}: CardListingProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4">
      <div className="flex gap-3 mb-4">
        {/* Physical preview — 5×7 portrait */}
        <div className="flex-1 flex flex-col">
          <span className="text-xs text-gray-500 mb-1.5 font-medium">Physical</span>
          <div
            className="w-full border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-xs text-gray-400"
            style={{ aspectRatio: '5 / 7' }}
          >
            {card.physicalPreviewUrl ? (
              <img
                src={card.physicalPreviewUrl}
                alt={`${card.name} physical`}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              '5 × 7'
            )}
          </div>
        </div>

        {/* Digital preview — 9×16 vertical */}
        <div className="w-24 flex flex-col">
          <span className="text-xs text-gray-500 mb-1.5 font-medium">Digital</span>
          <div
            className="w-full border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-xs text-gray-400"
            style={{ aspectRatio: '9 / 16' }}
          >
            {card.digitalPreviewUrl ? (
              <img
                src={card.digitalPreviewUrl}
                alt={`${card.name} digital`}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              '9 × 16'
            )}
          </div>
        </div>
      </div>

      <p className="text-sm font-medium mb-3 truncate">{card.name}</p>

      <div className="flex gap-2">
        <button
          onClick={() => onSelectAsIs(card)}
          className="flex-1 px-2 py-2 text-xs font-medium bg-[#111111] text-white rounded cursor-pointer hover:bg-gray-800 transition-colors"
        >
          Select as is
        </button>
        <button
          onClick={() => onPersonalize(card)}
          className="flex-1 px-2 py-2 text-xs font-medium border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Personalize
        </button>
        <button
          onClick={onBuildMyOwn}
          className="flex-1 px-2 py-2 text-xs font-medium border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Build My Own
        </button>
      </div>
    </div>
  );
}
