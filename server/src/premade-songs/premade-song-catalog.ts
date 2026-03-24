export interface PremadeSongCatalogEntry {
  slug: string;
  title: string;
  description: string;
  occasion: string;
  mood: string;
  genre: string;
  prompt: string;
  lyricsPrompt: string;
  style: string;
  sortOrder: number;
}

export const PREMADE_SONG_CATALOG: PremadeSongCatalogEntry[] = [
  {
    slug: 'birthday-happy-sunrise',
    title: 'Birthday Sunrise',
    description: 'A bright birthday pick with big smiles, warm wishes, and easy singalong energy.',
    occasion: 'Birthday',
    mood: 'Happy',
    genre: 'Pop',
    prompt:
      'upbeat pop birthday anthem, warm acoustic rhythm, bright hooks, celebratory, polished, family friendly',
    lyricsPrompt:
      'Write uplifting birthday lyrics about celebrating someone special, happy memories, candles, laughter, and a joyful day ahead.',
    style: 'Upbeat pop / celebratory',
    sortOrder: 1,
  },
  {
    slug: 'anniversary-romantic-evermore',
    title: 'Evermore Together',
    description: 'A soft romantic track for anniversaries, promises, and heartfelt milestones.',
    occasion: 'Anniversary',
    mood: 'Romantic',
    genre: 'Acoustic Pop',
    prompt:
      'romantic acoustic pop ballad, gentle piano, warm strings, intimate duet feel, heartfelt, elegant',
    lyricsPrompt:
      'Write romantic anniversary lyrics about lasting love, shared years, gratitude, tenderness, and growing old together.',
    style: 'Romantic acoustic / intimate',
    sortOrder: 2,
  },
  {
    slug: 'wedding-elegant-first-dance',
    title: 'First Dance Glow',
    description: 'An elegant wedding song with graceful pacing and a polished first-dance feel.',
    occasion: 'Wedding',
    mood: 'Elegant',
    genre: 'Cinematic Pop',
    prompt:
      'elegant cinematic wedding song, graceful piano, sweeping strings, refined, emotional, first dance energy',
    lyricsPrompt:
      'Write elegant wedding lyrics about commitment, new beginnings, celebration, family, and a beautiful shared future.',
    style: 'Elegant cinematic / wedding',
    sortOrder: 3,
  },
  {
    slug: 'thank-you-warm-golden-note',
    title: 'Golden Thank You',
    description: 'A warm thank-you song that feels sincere, gracious, and close to the heart.',
    occasion: 'Thank You',
    mood: 'Warm',
    genre: 'Soul Pop',
    prompt:
      'warm soul pop thank you song, mellow groove, heartfelt vocal, rich harmony, sincere, uplifting',
    lyricsPrompt:
      'Write thank-you lyrics about kindness, support, appreciation, and the lasting impact of someone showing up for you.',
    style: 'Warm soul pop / grateful',
    sortOrder: 4,
  },
  {
    slug: 'congratulations-exciting-sky-high',
    title: 'Sky High Cheers',
    description: 'A high-energy congratulations track for big wins, milestones, and proud moments.',
    occasion: 'Congratulations',
    mood: 'Exciting',
    genre: 'Dance Pop',
    prompt:
      'exciting dance pop celebration song, driving beat, bold chorus, victorious, confident, uplifting',
    lyricsPrompt:
      'Write congratulations lyrics about hard work paying off, pride, applause, new chapters, and celebrating a major achievement.',
    style: 'Dance pop / triumphant',
    sortOrder: 5,
  },
];
