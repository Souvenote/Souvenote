export type PurchasePackType = 'card' | 'credit';

export interface PurchasePack {
  id: string;
  packType: PurchasePackType;
  label: string;
  priceCad: number;
  imageCredits: number;
  songCredits: number;
  mailedCards?: number;
  savings?: string | null;
  badge?: string | null;
}

export const CARD_PACKS: PurchasePack[] = [
  {
    id: 'single-card',
    packType: 'card',
    label: 'Single Card',
    priceCad: 7.99,
    mailedCards: 1,
    imageCredits: 8,
    songCredits: 3,
  },
  {
    id: 'two-card-pack',
    packType: 'card',
    label: '2 Card Pack',
    priceCad: 13.99,
    mailedCards: 2,
    imageCredits: 16,
    songCredits: 6,
    savings: '12% savings',
  },
  {
    id: 'three-card-pack',
    packType: 'card',
    label: '3 Card Pack',
    priceCad: 19.99,
    mailedCards: 3,
    imageCredits: 24,
    songCredits: 9,
    savings: '17% savings',
  },
  {
    id: 'four-card-pack',
    packType: 'card',
    label: '4 Card Pack',
    priceCad: 24.99,
    mailedCards: 4,
    imageCredits: 32,
    songCredits: 12,
    savings: '22% savings',
    badge: 'Most Popular',
  },
  {
    id: 'five-card-pack',
    packType: 'card',
    label: '5 Card Pack',
    priceCad: 29.99,
    mailedCards: 5,
    imageCredits: 40,
    songCredits: 15,
    savings: '25% savings',
    badge: 'Best Value',
  },
];

export const CREDIT_PACKS: PurchasePack[] = [
  {
    id: 'starter',
    packType: 'credit',
    label: 'Starter',
    priceCad: 1.69,
    imageCredits: 8,
    songCredits: 3,
  },
  {
    id: 'creator',
    packType: 'credit',
    label: 'Creator',
    priceCad: 2.98,
    imageCredits: 16,
    songCredits: 6,
    savings: '12% savings',
    badge: 'Most Popular',
  },
  {
    id: 'studio',
    packType: 'credit',
    label: 'Studio',
    priceCad: 3.87,
    imageCredits: 24,
    songCredits: 9,
    savings: '24% savings',
  },
];

export const ALL_PURCHASE_PACKS = [...CARD_PACKS, ...CREDIT_PACKS];

export function findPurchasePack(packType: PurchasePackType, packId: string) {
  return ALL_PURCHASE_PACKS.find(
    (pack) => pack.packType === packType && pack.id === packId,
  );
}
