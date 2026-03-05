export type Occasion = 'Birthday' | 'Anniversary' | 'Wedding' | 'Thank You' | 'Holiday';

export interface CardTemplate {
  id: string;
  name: string;
  occasion: Occasion;
  physicalPreviewUrl: string;
  digitalPreviewUrl: string;
  basePriceCents: number;
}
