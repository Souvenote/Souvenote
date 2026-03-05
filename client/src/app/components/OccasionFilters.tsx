'use client';

import React from 'react';
import { Occasion } from '@/types/card';

const OCCASIONS: Occasion[] = ['Birthday', 'Anniversary', 'Wedding', 'Thank You', 'Holiday'];

interface OccasionFiltersProps {
  activeFilter: Occasion | null;
  onFilterChange: (occasion: Occasion | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function OccasionFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: OccasionFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-2 overflow-x-auto">
        {OCCASIONS.map((occasion) => (
          <button
            key={occasion}
            onClick={() => onFilterChange(activeFilter === occasion ? null : occasion)}
            className={`px-4 py-1.5 text-sm rounded-md border whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === occasion
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-[#111111] border-gray-200 hover:bg-gray-50'
            }`}
          >
            {occasion}
          </button>
        ))}
      </div>

      <div className="relative shrink-0">
        <input
          type="text"
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-48 pl-3 pr-9 py-1.5 text-sm border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
        />
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
    </div>
  );
}
