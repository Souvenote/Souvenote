export interface OccasionDefaults {
  palette: string;
  typography: string;
  typographyWeight: string;
  defaultMotifs: string[];
  textTone: string;
}

export const OCCASION_DEFAULTS: Record<string, OccasionDefaults> = {
  Birthday: {
    palette: 'Warm — peach, gold, coral, blush',
    typography: 'Playful display + clean modern sans',
    typographyWeight: 'medium',
    defaultMotifs: ['Balloons', 'Confetti', 'Sparkles'],
    textTone: 'Cheerful, warm',
  },
  Anniversary: {
    palette: 'Deep romantic — burgundy, navy, gold, cream',
    typography: 'Elegant serif + refined script accent',
    typographyWeight: 'bold',
    defaultMotifs: ['Roses', 'Hearts', 'Floral wreath'],
    textTone: 'Heartfelt, sincere',
  },
  "Valentine's Day": {
    palette: 'Blush + gold + cream',
    typography: 'Handwritten script + clean serif',
    typographyWeight: 'regular',
    defaultMotifs: ['Hearts', 'Roses', 'Ribbon'],
    textTone: 'Romantic, warm',
  },
  "Mother's Day": {
    palette: 'Soft pastels — lavender, blush, sage, cream',
    typography: 'Elegant script + modern serif',
    typographyWeight: 'regular',
    defaultMotifs: ['Flowers', 'Floral wreath', 'Butterflies'],
    textTone: 'Tender, grateful',
  },
  "Father's Day": {
    palette: 'Muted earth — forest, navy, terracotta, charcoal',
    typography: 'Bold slab serif or clean sans',
    typographyWeight: 'bold',
    defaultMotifs: ['Stars', 'Geometric pattern'],
    textTone: 'Warm, appreciative',
  },
  Christmas: {
    palette: 'Classic red + green + gold',
    typography: 'Classic serif or hand-drawn script',
    typographyWeight: 'bold',
    defaultMotifs: ['Holly', 'Snowflakes', 'Ornaments', 'Ribbon'],
    textTone: 'Warm, festive',
  },
  Easter: {
    palette: 'Pastels — sage, blush, butter yellow, sky blue, lavender',
    typography: 'Rounded sans or playful script',
    typographyWeight: 'regular',
    defaultMotifs: ['Flowers', 'Spring florals'],
    textTone: 'Joyful, gentle',
  },
  'Thank You': {
    palette: 'Soft neutrals — cream, sage, blush, gold',
    typography: 'Refined script + clean modern sans',
    typographyWeight: 'regular',
    defaultMotifs: ['Florals', 'Ribbon', 'Gold accents'],
    textTone: 'Sincere, warm',
  },
  Congratulations: {
    palette: 'Bright celebratory — gold, white, navy',
    typography: 'Bold modern + script accent',
    typographyWeight: 'bold',
    defaultMotifs: ['Confetti', 'Gold', 'Stars', 'Sparkle'],
    textTone: 'Enthusiastic, proud',
  },
  'Just Because': {
    palette: 'Soft warm — cream, blush, sage',
    typography: 'Hand-drawn + clean modern',
    typographyWeight: 'regular',
    defaultMotifs: ['Florals', 'Leaves', 'Stars', 'Hearts'],
    textTone: 'Warm, casual',
  },
  Weddings: {
    palette: 'Ivory, champagne, sage, soft gold',
    typography: 'Elegant serif + refined script',
    typographyWeight: 'bold',
    defaultMotifs: ['Florals', 'Ribbon', 'Gold accents', 'Hearts'],
    textTone: 'Heartfelt, elegant',
  },
  Graduations: {
    palette: 'Bright celebratory — gold, white, navy, accent color',
    typography: 'Bold modern + script accent',
    typographyWeight: 'bold',
    defaultMotifs: ['Confetti', 'Gold', 'Stars', 'Sparkle'],
    textTone: 'Enthusiastic, proud',
  },
  'New Baby / Baby Shower': {
    palette: 'Soft pastels — blush, mint, butter yellow, cream',
    typography: 'Rounded sans or playful script',
    typographyWeight: 'regular',
    defaultMotifs: ['Stars', 'Balloons', 'Ribbon'],
    textTone: 'Tender, joyful',
  },
  'Get Well Soon': {
    palette: 'Soft warm — cream, sage, butter yellow',
    typography: 'Clean sans + gentle serif',
    typographyWeight: 'regular',
    defaultMotifs: ['Flowers', 'Leaves', 'Soft glow'],
    textTone: 'Gentle, warm, encouraging',
  },
  Sympathy: {
    palette: 'Muted — cream, sage, slate, soft lavender',
    typography: 'Classic serif',
    typographyWeight: 'regular',
    defaultMotifs: ['Florals', 'Leaves', 'Soft texture'],
    textTone: 'Quiet, respectful, tender',
  },
  Retirement: {
    palette: 'Warm earth — terracotta, cream, sage, gold',
    typography: 'Refined serif + modern sans',
    typographyWeight: 'regular',
    defaultMotifs: ['Stars', 'Confetti'],
    textTone: 'Warm, celebratory, reflective',
  },
  'New Home': {
    palette: 'Warm neutrals — cream, sage, terracotta, soft gold',
    typography: 'Clean modern sans + gentle serif',
    typographyWeight: 'regular',
    defaultMotifs: ['Florals', 'Stars', 'Hearts'],
    textTone: 'Warm, welcoming, sincere',
  },
  Farewell: {
    palette: 'Soft warm — cream, sage, blush, soft gold',
    typography: 'Clean sans + gentle serif',
    typographyWeight: 'regular',
    defaultMotifs: ['Stars', 'Florals', 'Leaves'],
    textTone: 'Warm, sincere, bittersweet',
  },
};

export const RELATIONSHIPS = [
  'Partner',
  'Friend',
  'Best friend',
  'Mom',
  'Dad',
  'Family member',
  'Myself',
  'Coworker',
  'Teacher',
] as const;

export const OCCASIONS = Object.keys(OCCASION_DEFAULTS);

export const VIBES = [
  'Romantic',
  'Funny',
  'Cute',
  'Heartfelt',
  'Elegant',
  'Playful',
  'Calm',
  'Celebratory',
] as const;

export const STYLES = [
  'Photographic',
  'Cinematic',
  'Cartoon',
  'Anime',
  'Watercolor',
  'Painterly',
  'Minimal',
  'Vintage',
  'Fantasy',
  'Dreamy',
] as const;

export const SCENES = [
  'Keep original',
  'Indoors',
  'Beach',
  'Nature',
  'City',
  'Fantasy',
  'Cosmic',
  'Garden',
  'Café',
] as const;

export const DESIGN_ELEMENT_STYLES = [
  'Vintage frame',
  'Watercolor border',
  'Gold foil accents',
  'Modern minimal',
  'Hand-drawn doodle',
  'Floral wreath',
  'Geometric pattern',
] as const;

export const ENHANCEMENT_TYPES = [
  'Lighting',
  'Color grading',
  'Artistic filter',
  'Soft glow',
] as const;

export const ENHANCEMENT_STRENGTHS = ['Subtle', 'Moderate', 'Strong'] as const;

export const TEXT_ADDITIONS = [
  'Zodiac sign',
  'Birthdate',
  'Year',
  'Custom number',
] as const;

export const VISUAL_MOTIFS = [
  'Flowers',
  'Hearts',
  'Stars',
  'Balloons',
  'Cake',
  'Pets',
  'Confetti',
  'Sparkles',
  'Ribbons',
] as const;

export const FRONT_TEXT_PRESETS = [
  'Happy Birthday',
  'I love you',
  'Happy Anniversary',
  'Thank you',
  'Congratulations',
  'Merry Christmas',
  "Happy Mother's Day",
  "Happy Father's Day",
  'Happy Easter',
  'Just Because',
] as const;
