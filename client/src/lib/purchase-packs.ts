export type PurchasePackType = 'card' | 'credit';

export interface PurchasePack {
  id: string;
  packType: PurchasePackType;
  label: string;
  price: string;
  savings?: string | null;
  badge?: string | null;
  mailedCards?: number;
  images: number;
  songs: number;
}

export const CARD_PACKS: PurchasePack[] = [
  {
    id: 'single-card',
    packType: 'card',
    label: 'Single Card',
    price: '$7.99 CAD',
    savings: null,
    badge: null,
    mailedCards: 1,
    images: 8,
    songs: 3,
  },
  {
    id: 'two-card-pack',
    packType: 'card',
    label: '2 Card Pack',
    price: '$13.99 CAD',
    savings: '12% savings',
    badge: null,
    mailedCards: 2,
    images: 16,
    songs: 6,
  },
  {
    id: 'three-card-pack',
    packType: 'card',
    label: '3 Card Pack',
    price: '$19.99 CAD',
    savings: '17% savings',
    badge: null,
    mailedCards: 3,
    images: 24,
    songs: 9,
  },
  {
    id: 'four-card-pack',
    packType: 'card',
    label: '4 Card Pack',
    price: '$24.99 CAD',
    savings: '22% savings',
    badge: 'Most Popular',
    mailedCards: 4,
    images: 32,
    songs: 12,
  },
  {
    id: 'five-card-pack',
    packType: 'card',
    label: '5 Card Pack',
    price: '$29.99 CAD',
    savings: '25% savings',
    badge: 'Best Value',
    mailedCards: 5,
    images: 40,
    songs: 15,
  },
];

export const CREDIT_PACKS: PurchasePack[] = [
  {
    id: 'starter',
    packType: 'credit',
    label: 'Starter',
    price: '$1.69 CAD',
    savings: null,
    badge: null,
    images: 8,
    songs: 3,
  },
  {
    id: 'creator',
    packType: 'credit',
    label: 'Creator',
    price: '$2.98 CAD',
    savings: '12% savings',
    badge: 'Most Popular',
    images: 16,
    songs: 6,
  },
  {
    id: 'studio',
    packType: 'credit',
    label: 'Studio',
    price: '$3.87 CAD',
    savings: '24% savings',
    badge: null,
    images: 24,
    songs: 9,
  },
];
