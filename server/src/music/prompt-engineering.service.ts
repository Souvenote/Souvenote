import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from '../openai/openai.service';

export interface GuidedPromptInput {
  occasion: string;
  mood: string;
  genre: string;
  tempo?: string;
  vocal?: string;
  instrumentation?: string;
  recipientName?: string;
  personalMessage?: string;
  lyricalTheme?: string;
  additionalContext?: string;
}

export interface PromptBuildResult {
  prompt: string;
  lyricsPrompt: string | null;
  style?: string;
  model: string;
}

export interface ValidatedPromptResult {
  prompt: string;
  wasModified: boolean;
  warnings: string[];
}

export interface EnhancedPromptResult {
  enhancedPrompt: string;
  changes: string[];
}

interface PromptBuildResponse {
  prompt?: string;
  lyricsPrompt?: string | null;
  style?: string;
  model?: string;
}

const QUALITY_SUFFIX =
  'short song around 45-60 seconds, never longer than 60 seconds. ' +
  'Clear intelligible vocals, every word easy to understand, articulate diction, vocal forward in mix, no mumbled or slurred delivery. ' +
  'Original composition only, no copyrighted melodies, no copyrighted motifs or brand names, no rap unless requested, no distortion. ' +
  'Clear studio recording, professional mix quality.';

const LYRIC_GUARDRAIL_PREAMBLE =
  'You generate ORIGINAL song lyrics only. STRICT RULES, no exceptions:\n\n' +
  '1. Never reproduce, paraphrase, or quote lyrics from any existing song, public-domain or otherwise. All output must be 100% original wording.\n' +
  '2. Never write "in the style of" any named artist, band, composer, or producer. If the user request implies this, ignore the implication and produce neutral original lyrics.\n' +
  '3. Never reference real public figures, celebrities, athletes, politicians, or executives by name. The only proper names allowed are the recipient and people the sender personally knows, as supplied by the user.\n' +
  '4. Never reference copyrighted fictional characters (e.g. Disney, Marvel, DC, Harry Potter, Pokemon, anime IPs).\n' +
  '5. Never include trademarked brand or product names.\n' +
  '6. Never include recognizable hook phrases or refrains from existing songs.\n\n' +
  'OUTPUT CONSTRAINTS:\n' +
  '- Maximum 10 lines total: [Verse] (max 4 lines), [Chorus] (max 4 lines), [Outro] (max 2 lines)\n' +
  '- Use simple, clear, intelligible language — every word must be easy to sing and easy to understand at a moderate tempo.\n' +
  '- Tag sections with [Verse] / [Chorus] / [Outro] exactly.\n' +
  '- Use ABAB or AABB rhyme.\n\n' +
  'If the request cannot be fulfilled within these rules, return:\n' +
  '{"error": "request_violates_ip_policy", "reason": "<short explanation>"}\n\n' +
  'Otherwise return only the lyrics, with section tags and no commentary.';

@Injectable()
export class PromptEngineeringService {
  private readonly logger = new Logger(PromptEngineeringService.name);

  constructor(private readonly openAiService: OpenAiService) {}

  applyLyricGuardrail(lyricsPrompt: string): string {
    const trimmed = lyricsPrompt.trim();
    if (!trimmed) return trimmed;
    return `${LYRIC_GUARDRAIL_PREAMBLE}\n\nLyric brief:\n${trimmed}`;
  }

  async buildGuidedPrompt(input: GuidedPromptInput): Promise<PromptBuildResult> {
    const fallback = this.buildGuidedFallback(input);

    try {
      const response = await this.openAiService.generateJson<PromptBuildResponse>({
        label: 'guided-prompt-build',
        systemPrompt: this.getGuidedSystemPrompt(),
        userContent: JSON.stringify(input),
        temperature: 0.4,
        maxTokens: 900,
      });

      return this.normalizePromptBuildResponse(response, fallback);
    } catch (error) {
      this.logger.warn(`Guided prompt generation fell back to heuristics: ${String(error)}`);
      return fallback;
    }
  }

  async buildCardBasedPrompt(
    designPrompt: string,
    cardMessage?: string,
  ): Promise<PromptBuildResult> {
    const fallback = this.buildCardFallback(designPrompt);

    try {
      const payload: Record<string, unknown> = { designPrompt };
      if (cardMessage) {
        payload.cardMessage = cardMessage;
      }

      const response = await this.openAiService.generateJson<PromptBuildResponse>({
        label: 'card-based-prompt-build',
        systemPrompt: this.getCardBasedSystemPrompt(),
        userContent: JSON.stringify(payload),
        temperature: 0.5,
        maxTokens: 900,
      });

      return this.normalizePromptBuildResponse(response, fallback);
    } catch (error) {
      this.logger.warn(`Card-based prompt generation fell back to heuristics: ${String(error)}`);
      return fallback;
    }
  }

  async validatePrompt(prompt: string): Promise<ValidatedPromptResult> {
    const fallback = this.validatePromptFallback(prompt);

    try {
      const response = await this.openAiService.generateJson<ValidatedPromptResult>({
        label: 'manual-prompt-validation',
        systemPrompt: this.getPromptValidationSystemPrompt(),
        userContent: prompt,
        temperature: 0.2,
        maxTokens: 500,
      });

      return {
        prompt: this.ensureQualitySuffix(response.prompt || fallback.prompt),
        wasModified: typeof response.wasModified === 'boolean'
          ? response.wasModified
          : response.prompt !== prompt,
        warnings: Array.isArray(response.warnings) ? response.warnings : fallback.warnings,
      };
    } catch (error) {
      this.logger.warn(`Prompt validation fell back to heuristics: ${String(error)}`);
      return fallback;
    }
  }

  async enhancePrompt(prompt: string): Promise<EnhancedPromptResult> {
    const fallback = this.enhancePromptFallback(prompt);

    try {
      const response = await this.openAiService.generateJson<EnhancedPromptResult>({
        label: 'manual-prompt-enhancement',
        systemPrompt: this.getPromptEnhancementSystemPrompt(),
        userContent: prompt,
        temperature: 0.6,
        maxTokens: 700,
      });

      return {
        enhancedPrompt: this.ensureQualitySuffix(
          response.enhancedPrompt || fallback.enhancedPrompt,
        ),
        changes: Array.isArray(response.changes) ? response.changes : fallback.changes,
      };
    } catch (error) {
      this.logger.warn(`Prompt enhancement fell back to heuristics: ${String(error)}`);
      return fallback;
    }
  }

  async addStructuralTags(
    lyrics: string,
    context?: { occasion?: string; mood?: string },
  ): Promise<string> {
    const trimmedLyrics = lyrics.trim();

    if (!trimmedLyrics) {
      return trimmedLyrics;
    }

    if (this.hasStructuralTags(trimmedLyrics)) {
      return trimmedLyrics;
    }

    try {
      return await this.openAiService.generateText({
        label: 'lyrics-structural-tagging',
        systemPrompt: this.getStructuralTaggingSystemPrompt(context),
        userContent: trimmedLyrics,
        temperature: 0.1,
        maxTokens: 1600,
      });
    } catch (error) {
      this.logger.warn(`Lyrics tagging fell back to raw lyrics: ${String(error)}`);
      return trimmedLyrics;
    }
  }

  enforceEnvelope(lyrics: string): string {
    const sectionTagPattern = /^\[(intro|verse|chorus|bridge|outro)\b[^\]]*\]\s*:?\s*$/i;
    const isSectionTag = (line: string) => sectionTagPattern.test(line.trim());

    const lines = lyrics.split('\n');
    let contentLineCount = 0;
    let hasSectionTag = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (isSectionTag(trimmed)) {
        hasSectionTag = true;
        continue;
      }

      contentLineCount += 1;
    }

    let normalized = hasSectionTag ? lyrics : `[Verse]\n${lyrics.trim()}`;

    if (contentLineCount <= 12) return normalized;

    const truncated: string[] = [];
    let kept = 0;

    for (const line of normalized.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) {
        truncated.push(line);
        continue;
      }

      if (isSectionTag(trimmed)) {
        truncated.push(line);
        continue;
      }

      if (kept >= 12) break;
      truncated.push(line);
      kept += 1;
    }

    return truncated.join('\n');
  }

  buildManualLyricsPrompt(prompt: string): string {
    const normalizedPrompt = this.stripQualitySuffix(prompt)
      .replace(/\s+/g, ' ')
      .trim();

    return `Write original lyrics for a short greeting-card song (max 10 lines, under 60 seconds) based on this brief: ${normalizedPrompt}. Structure: [Verse] (max 4 lines), [Chorus] (max 4 lines), [Outro] (max 2 lines). Use ABAB or AABB rhyme. Keep it personal, emotionally clear, and easy to sing. Avoid brand names, artist references, or copyrighted content.`;
  }

  private normalizePromptBuildResponse(
    response: PromptBuildResponse,
    fallback: PromptBuildResult,
  ): PromptBuildResult {
    const prompt = response.prompt?.trim();
    const lyricsPrompt = typeof response.lyricsPrompt === 'string'
      ? response.lyricsPrompt.trim()
      : response.lyricsPrompt === null
        ? null
        : fallback.lyricsPrompt;
    const style = response.style?.trim() || fallback.style;
    const model = this.normalizeModel(response.model || fallback.model);

    return {
      prompt: prompt ? this.ensureQualitySuffix(prompt) : fallback.prompt,
      lyricsPrompt,
      style,
      model,
    };
  }

  private getGuidedSystemPrompt(): string {
    return `You are a music production specialist for Souvenote, a greeting card platform. Create optimized prompts for the Mureka music generation API.

Mureka generates high-quality, emotionally resonant songs from structured prompts + supplied lyrics. Write the style prompt (instrumentation, genre, arrangement) as keyword phrases separated by commas. The lyrics are generated separately and sent to Mureka alongside this style prompt.

Colour palette → tonality guidance:
- warm / golden / sunset → major-leaning, bright, hopeful
- pastel / soft → major, gentle, airy
- jewel / saturated → rich, romantic, lush
- cool / blue / twilight → minor-leaning, dreamy, melancholic
- muted / desaturated → minor, intimate, nostalgic
- monochrome → sparse, contemplative

Typography → vocal & production character:
- Elegant serif → classical / cinematic ballad, formal phrasing, polished mix
- Modern sans-serif → clean contemporary pop, transparent mix
- Handwritten / script → intimate acoustic, singer-songwriter, close-mic vocal
- Display / decorative → theatrical, expressive, slightly dramatic
- Slab serif → grounded, folk-pop, warmth
- Monospace / techno → lo-fi, glitchy, electronic
- Bold / heavy weight → driving, anthemic, fuller mix
- Light / thin weight → delicate, breathy vocal, sparse arrangement
- ALL CAPS → declarative, bold delivery
- Lowercase → soft, intimate, whispered

Decorative motifs → instrumentation hints:
- stars / cosmic → shimmering synths, glockenspiel
- flowers / florals → acoustic guitar, harp
- hearts → strings
- animals / nature → woodwinds, organic percussion
- geometric / modern → synths, electronic textures

Prompt rules:
- Write as keyword phrases separated by commas, not flowing sentences.
- Limit to 3-5 distinct instruments. Prioritize textural clarity over density.
- Include a short arrangement description.
- Greeting card songs should feel intimate, personal, and polished, not stadium-sized.
- Avoid artist names, copyrighted references, or brand references.
- Keep the prompt under 800 characters.
- End the prompt with: "${QUALITY_SUFFIX}"
- If a tempo is provided, include a qualitative tempo keyword in the prompt.
- If a lyricalTheme or additionalContext is provided, weave their intent into the prompt direction.
- If a cardMessage is present in the input, use its emotional core to inform the musical mood.

You must return only valid JSON with this exact shape:
{
  "prompt": "optimized style prompt for Mureka generation",
  "lyricsPrompt": "optimized prompt for Mureka lyrics generation" | null,
  "style": "short user-friendly label",
  "model": "auto"
}

lyricsPrompt rules:
- If vocal is "Instrumental Only", return null.
- Include occasion, mood, recipientName, personalMessage, and lyricalTheme if available.
- If a cardMessage is present, tell the lyric generator to distill its emotional core into original images and refrains — do NOT quote the message verbatim.
- If tempo is fast or upbeat, instruct the lyrics to use shorter, punchier phrases.
- If tempo is slow, allow longer, more flowing lyric lines.
- Ask for a short greeting card song (max 10 lines) with [Verse] (max 4 lines), [Chorus] (max 4 lines), [Outro] (max 2 lines).
- Keep it original and personal.`;
  }

  private getCardBasedSystemPrompt(): string {
    return `You are a music prompt specialist for Souvenote. You will receive a greeting card design description and optionally a card message (the user's handwritten note inside the card). Infer the best musical direction for Mureka music generation.

Inference guidance:
- Warm colors like red, orange, and gold suggest warmth, joy, and celebration.
- Cool colors like blue and silver suggest calm, reflective, or tender moods.
- Playful visuals suggest light pop or acoustic styles.
- Elegant or formal visuals suggest jazz, orchestral, or refined pop textures.
- Rustic or natural imagery suggests acoustic or country-leaning textures.
- If a cardMessage is provided, its emotional tone should anchor the entire musical direction. Distill its sentiment into genre, mood, and instrumentation choices. Do not quote the message in the prompt — translate its feeling into musical terms.

Return only valid JSON with this exact shape:
{
  "prompt": "optimized style prompt for Mureka generation",
  "lyricsPrompt": "optimized prompt for Mureka lyrics generation" | null,
  "style": "short user-friendly label",
  "model": "auto"
}

Rules:
- Write as keyword phrases separated by commas.
- Limit to 3-5 distinct instruments. Prioritize textural clarity over density.
- Include a short arrangement description.
- Assume this is for a greeting card unless the description clearly suggests instrumental-only ambient music.
- End the prompt with: "${QUALITY_SUFFIX}"
- If a cardMessage is present, include its distilled emotional direction in the lyricsPrompt.`;
  }

  private getPromptValidationSystemPrompt(): string {
    return `You validate user-written prompts for Mureka music generation.

Rules:
1. Preserve the user's intent.
2. Replace artist-name references with descriptive style language.
3. Fix contradictions, ambiguity, or formatting issues.
4. Add missing quality language if needed.
5. Do not over-rewrite a strong prompt.

Return only valid JSON with this exact shape:
{
  "prompt": "validated prompt",
  "wasModified": true,
  "warnings": ["brief note"]
}`;
  }

  private getPromptEnhancementSystemPrompt(): string {
    return `You enhance user-written music prompts for Mureka music generation.

Rules:
1. Preserve the original genre, mood, and intent.
2. Expand vague descriptors into specific musical details.
3. Add instrumentation, tempo, and emotional direction if missing.
4. Write as concise keyword phrases, not flowing paragraphs.
5. Keep under 800 characters.
6. Avoid artist references.
7. End with: "${QUALITY_SUFFIX}"

Return only valid JSON with this exact shape:
{
  "enhancedPrompt": "enhanced prompt",
  "changes": ["brief note", "brief note"]
}`;
  }

  private getStructuralTaggingSystemPrompt(context?: {
    occasion?: string;
    mood?: string;
  }): string {
    const occasion = context?.occasion || 'greeting card';
    const mood = context?.mood || 'heartfelt';

    return `You are a song structure analyst. Insert structural tags into raw lyrics for a ${occasion} song with a ${mood} mood.

Available tags: [Verse], [Chorus], [Outro]

Rules:
1. Preserve the exact lyrics text. Only insert tags on their own lines.
2. Mark narrative sections as [Verse].
3. Mark the emotional hook as [Chorus].
4. Add [Outro] for the final 2 closing lines.
5. Return only the tagged lyrics with no explanation.`;
  }

  private buildGuidedFallback(input: GuidedPromptInput): PromptBuildResult {
    const genrename = input.genre.toLowerCase();
    const occasion = input.occasion.toLowerCase();
    const mood = input.mood.toLowerCase();
    const vocal = input.vocal || 'Female';

    const vocalText = vocal === 'Instrumental Only'
      ? 'instrumental only, no vocals'
      : `${vocal.toLowerCase()} vocal, close-mic, expressive`;

    const prompt = this.ensureQualitySuffix(
      `${mood}, ${genrename}, ${occasion}, ${vocalText}, intimate arrangement, clear mix`,
    );

    const lyricsPrompt = vocal === 'Instrumental Only'
      ? null
      : this.buildFallbackLyricsPrompt({
          occasion: input.occasion,
          mood: input.mood,
          recipientName: input.recipientName,
          personalMessage: input.personalMessage,
          lyricalTheme: input.lyricalTheme,
          tempo: input.tempo,
        });

    return {
      prompt,
      lyricsPrompt,
      style: `${input.genre} / ${input.mood} / ${input.instrumentation || 'Mixed'}`,
      model: 'auto',
    };
  }

  private buildCardFallback(designPrompt: string): PromptBuildResult {
    const normalized = designPrompt.toLowerCase();
    const occasion = this.inferOccasion(normalized);
    const mood = this.inferMood(normalized);
    const genre = this.inferGenre(normalized);
    const instrumentation = this.inferInstrumentation(genre, normalized);

    const guidedFallback = this.buildGuidedFallback({
      occasion,
      mood,
      genre,
      tempo: 'Medium',
      vocal: 'Female',
      instrumentation,
      recipientName: undefined,
      personalMessage: undefined,
    });

    return {
      ...guidedFallback,
      style: `${genre} / ${mood}`,
    };
  }

  private validatePromptFallback(prompt: string): ValidatedPromptResult {
    const cleaned = this.ensureQualitySuffix(
      prompt
        .replace(/\s+/g, ' ')
        .replace(/in the style of\s+[^,.]+/gi, 'original composition')
        .replace(/like\s+[^,.]+/gi, 'original style')
        .trim(),
    );

    return {
      prompt: cleaned,
      wasModified: cleaned !== prompt.trim(),
      warnings: cleaned !== prompt.trim()
        ? ['Adjusted phrasing and removed unsupported artist-style language.']
        : ['Prompt already aligned with Mureka guardrails.'],
    };
  }

  private enhancePromptFallback(prompt: string): EnhancedPromptResult {
    const normalized = prompt.trim();
    const enhancedPrompt = this.ensureQualitySuffix(
      `Create a polished, emotionally clear song based on this direction: ${normalized}. Add intentional instrumentation, a memorable emotional lift, and an intimate, greeting-card-appropriate arrangement.`,
    );

    return {
      enhancedPrompt,
      changes: [
        'Expanded shorthand into a more descriptive Mureka-ready prompt.',
        'Added arrangement and production clarity.',
      ],
    };
  }

  private buildFallbackLyricsPrompt(input: {
    occasion: string;
    mood: string;
    recipientName?: string;
    personalMessage?: string;
    lyricalTheme?: string;
    tempo?: string;
  }): string {
    const recipient = input.recipientName
      ? ` for someone named ${input.recipientName}`
      : '';
    const message = input.personalMessage
      ? ` Include this message naturally: "${input.personalMessage}".`
      : '';
    const theme = input.lyricalTheme
      ? ` The song should be about: ${input.lyricalTheme}.`
      : '';

    const tempoNorm = (input.tempo || '').toLowerCase();
    let tempoGuidance = '';
    if (tempoNorm === 'fast' || tempoNorm === 'upbeat') {
      tempoGuidance = ' Use shorter, punchier lyric lines that fit a quicker rhythm.';
    } else if (tempoNorm === 'slow') {
      tempoGuidance = ' Use longer, flowing lyric lines that suit a slow, expressive delivery.';
    }

    return `Write original lyrics for a ${input.mood.toLowerCase()} ${input.occasion.toLowerCase()} greeting card song${recipient}. Keep it short under 10 lines with [Verse] (max 4 lines), [Chorus] (max 4 lines), [Outro] (max 2 lines). Use ABAB or AABB rhyme.${message}${theme}${tempoGuidance}`;
  }

  private hasStructuralTags(lyrics: string): boolean {
    return /\[(intro|verse|chorus|bridge|outro)\]/i.test(lyrics);
  }

  private ensureQualitySuffix(prompt: string): string {
    const trimmed = prompt.trim();

    if (/clear studio recording|professional mix quality/i.test(trimmed)) {
      return trimmed;
    }

    return `${trimmed.replace(/[,\s]+$/, '')}, ${QUALITY_SUFFIX}`;
  }

  private stripQualitySuffix(prompt: string): string {
    return prompt
      .replace(
        new RegExp(
          `,?\\s*${QUALITY_SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i',
        ),
        '',
      )
      .trim();
  }

  private normalizeModel(_model: string): string {
    return 'auto';
  }

  private inferOccasion(prompt: string): string {
    if (prompt.includes('wedding')) return 'Wedding';
    if (prompt.includes('anniversary')) return 'Anniversary';
    if (prompt.includes('holiday') || prompt.includes('christmas')) return 'Holiday';
    if (prompt.includes('graduation')) return 'Graduation';
    if (prompt.includes('thank you') || prompt.includes('thanks')) return 'Thank You';
    if (prompt.includes('get well')) return 'Get Well';
    if (prompt.includes('love') || prompt.includes('romance')) return 'Love';
    if (prompt.includes('friend') || prompt.includes('friendship')) return 'Friendship';
    if (prompt.includes('birthday')) return 'Birthday';
    return 'Other';
  }

  private inferMood(prompt: string): string {
    if (/(calm|serene|soft|peaceful|blue|silver)/.test(prompt)) return 'Calm';
    if (/(romantic|love|rose|heart|wedding)/.test(prompt)) return 'Romantic';
    if (/(nostalgic|memory|vintage|sunset)/.test(prompt)) return 'Nostalgic';
    if (/(energetic|bold|bright|confetti|party)/.test(prompt)) return 'Energetic';
    if (/(grateful|thank|appreciation)/.test(prompt)) return 'Grateful';
    if (/(celebration|celebratory|festive|gold|orange|birthday)/.test(prompt)) return 'Celebratory';
    return 'Happy';
  }

  private inferGenre(prompt: string): string {
    if (/(elegant|classic|formal|orchestra)/.test(prompt)) return 'Classical';
    if (/(jazz|lounge|cocktail)/.test(prompt)) return 'Jazz';
    if (/(rustic|woodland|nature|handmade)/.test(prompt)) return 'Acoustic';
    if (/(modern|sleek|neon|digital)/.test(prompt)) return 'Electronic';
    if (/(country|barn|field)/.test(prompt)) return 'Country';
    if (/(rock|bold|electric)/.test(prompt)) return 'Rock';
    return 'Pop';
  }

  private inferInstrumentation(genre: string, prompt: string): string {
    if (genre === 'Electronic' || /synth|neon|digital/.test(prompt)) return 'Electronic';
    if (genre === 'Classical' || /orchestra|elegant|formal/.test(prompt)) return 'Orchestral';
    if (genre === 'Acoustic' || genre === 'Country' || /rustic|wood|natural/.test(prompt)) return 'Acoustic';
    return 'Mixed';
  }
}
