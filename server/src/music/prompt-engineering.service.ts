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

const QUALITY_SUFFIX = 'Original composition only, no copyrighted motifs or brand names. Clear studio recording, professional mix quality.';

@Injectable()
export class PromptEngineeringService {
  private readonly logger = new Logger(PromptEngineeringService.name);

  constructor(private readonly openAiService: OpenAiService) {}

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

  async buildCardBasedPrompt(designPrompt: string): Promise<PromptBuildResult> {
    const fallback = this.buildCardFallback(designPrompt);

    try {
      const response = await this.openAiService.generateJson<PromptBuildResponse>({
        label: 'card-based-prompt-build',
        systemPrompt: this.getCardBasedSystemPrompt(),
        userContent: JSON.stringify({ designPrompt }),
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

  buildManualLyricsPrompt(prompt: string): string {
    const normalizedPrompt = this.stripQualitySuffix(prompt)
      .replace(/\s+/g, ' ')
      .trim();

    return `Write original lyrics for a concise 1-2 minute greeting card song inspired by this brief: ${normalizedPrompt}. Keep it personal, emotionally clear, and easy to sing, with 2 verses, 2 choruses, and an optional bridge. Match the imagery and tone of the brief while avoiding brand names or copyrighted references.`;
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
    return `You are a music production specialist for Souvenote, a greeting card platform. Create optimized prompts for the Mureka.ai music generation API.

Mureka uses MusiCoT (Chain-of-Thought structural reasoning) to plan the entire song before generating audio. Well-structured prompts dramatically improve output quality.

Structure the prompt as: [Context/Occasion] + [Style/Genre] + [Instrumentation] + [Arrangement Arc] + [Quality Constraints].

Prompt rules:
- Write as flowing descriptive sentences, never comma-separated keywords.
- Limit to 3-5 distinct instruments. Prioritize textural clarity over density. For intimate occasions, lean toward fewer instruments with more space.
- Include a short arrangement arc describing how the song develops (e.g., "Opens with solo fingerpicked guitar, adds soft percussion in the verse, builds into a warm full arrangement with vocal harmonies in the chorus, and resolves gently in the outro").
- Use era-based or style-based descriptors instead of vague terms (e.g., "warm 70s folk-pop textures" instead of "retro feel").
- Greeting card songs should feel intimate, personal, and polished, not stadium-sized.
- Avoid artist names, copyrighted references, or brand references.
- Keep the prompt under 800 characters.
- End the prompt with: "${QUALITY_SUFFIX}"
- If a tempo is provided, include a qualitative tempo phrase in the prompt (e.g., "gentle moderate groove" or "driving uptempo energy").
- If a lyricalTheme or additionalContext is provided, weave their intent into the prompt direction.

You must return only valid JSON with this exact shape:
{
  "prompt": "optimized style prompt for Mureka song generation",
  "lyricsPrompt": "optimized prompt for Mureka lyrics generation" | null,
  "style": "short user-friendly label",
  "model": "mureka-8"
}

lyricsPrompt rules:
- If vocal is "Instrumental Only", return null.
- Otherwise include occasion, mood, recipientName, personalMessage, and lyricalTheme if available.
- If tempo is fast or upbeat, instruct the lyrics to use shorter, punchier phrases that fit a quicker rhythm.
- If tempo is slow, allow longer, more flowing lyric lines.
- Ask for a concise 1-2 minute greeting card song with 2 verses, 2 choruses, and an optional bridge.
- Keep it original and personal.`;
  }

  private getCardBasedSystemPrompt(): string {
    return `You are a music prompt specialist for Souvenote. You will receive a greeting card design description and infer the best musical direction for Mureka.ai.

Inference guidance:
- Warm colors like red, orange, and gold suggest warmth, joy, and celebration.
- Cool colors like blue and silver suggest calm, reflective, or tender moods.
- Playful visuals suggest light pop or acoustic styles.
- Elegant or formal visuals suggest jazz, orchestral, or refined pop textures.
- Rustic or natural imagery suggests acoustic or country-leaning textures.

Structure the prompt as: [Context/Occasion] + [Style/Genre] + [Instrumentation] + [Arrangement Arc] + [Quality Constraints].

Return only valid JSON with this exact shape:
{
  "prompt": "optimized style prompt for Mureka song generation",
  "lyricsPrompt": "optimized prompt for Mureka lyrics generation" | null,
  "style": "short user-friendly label",
  "model": "mureka-8"
}

Rules:
- Write as flowing descriptive sentences, never comma-separated keywords.
- Limit to 3-5 distinct instruments. Prioritize textural clarity over density.
- Include a short arrangement arc describing how the song develops.
- Assume this is for a greeting card unless the description clearly suggests instrumental-only ambient music.
- End the prompt with: "${QUALITY_SUFFIX}"`;
  }

  private getPromptValidationSystemPrompt(): string {
    return `You validate user-written prompts for Mureka.ai music generation.

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
    return `You enhance user-written music prompts for Mureka.ai.

Rules:
1. Preserve the original genre, mood, and intent.
2. Expand vague descriptors into specific musical details.
3. Add instrumentation, tempo, and emotional direction if missing.
4. Write as natural descriptive sentences, not keyword fragments.
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

Available tags: [Intro], [Verse], [Chorus], [Bridge], [Outro]

Rules:
1. Preserve the exact lyrics text. Only insert tags on their own lines.
2. Mark narrative sections as [Verse].
3. Mark the emotional hook as [Chorus].
4. Add [Bridge] only if there is a clear contrasting section.
5. Add [Intro] or [Outro] only if clearly appropriate.
6. Return only the tagged lyrics with no explanation.`;
  }

  private buildGuidedFallback(input: GuidedPromptInput): PromptBuildResult {
    const tempo = input.tempo?.toLowerCase() || 'medium';
    const vocal = input.vocal || 'Female';
    const instrumentation = input.instrumentation || 'Mixed';
    const occasion = input.occasion.toLowerCase();
    const mood = input.mood.toLowerCase();
    const genre = input.genre.toLowerCase();

    const instrumentationText = this.getInstrumentationText(instrumentation);
    const vocalText = vocal === 'Instrumental Only'
      ? 'Keep it instrumental only with no singing.'
      : `Feature an expressive ${vocal.toLowerCase()} vocal that feels sincere and close.`;

    const prompt = this.ensureQualitySuffix(
      `Create a ${mood} ${genre} song for a ${occasion} greeting card with a ${tempo} groove. Use ${instrumentationText}. The arrangement should feel personal, emotionally clear, and easy to connect with, building into a memorable chorus without sounding oversized. ${vocalText}`,
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
      style: `${input.genre} / ${input.mood} / ${instrumentation}`,
      model: 'mureka-8',
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
        .replace(/in the style of\s+[^,.]+/gi, 'with an original genre-inspired feel')
        .replace(/like\s+[^,.]+/gi, 'with a clear musical identity')
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
    const keywordStyle = normalized.includes(',')
      ? normalized.split(',').map((part) => part.trim()).filter(Boolean)
      : [normalized];
    const lead = keywordStyle.join(', ');
    const enhancedPrompt = this.ensureQualitySuffix(
      `Create a polished, emotionally clear song based on this direction: ${lead}. Add a strong sense of atmosphere, intentional instrumentation, and a memorable emotional lift while keeping the arrangement intimate and suitable for a greeting card moment.`,
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

    return `Write original lyrics for a ${input.mood.toLowerCase()} ${input.occasion.toLowerCase()} greeting card song${recipient}. Keep it concise and personal, around 1-2 minutes long, with 2 verses, 2 choruses, and an optional bridge.${message}${theme}${tempoGuidance}`;
  }

  private hasStructuralTags(lyrics: string): boolean {
    return /\[(intro|verse|chorus|bridge|outro)\]/i.test(lyrics);
  }

  private ensureQualitySuffix(prompt: string): string {
    const trimmed = prompt.trim();

    if (/clear studio recording|professional mix quality/i.test(trimmed)) {
      return trimmed;
    }

    return `${trimmed.replace(/[.\s]+$/, '')}. ${QUALITY_SUFFIX}`;
  }

  private stripQualitySuffix(prompt: string): string {
    return prompt
      .replace(
        /\.?\s*Original composition only, no copyrighted motifs or brand names\. Clear studio recording, professional mix quality\.?$/i,
        '',
      )
      .trim();
  }

  private normalizeModel(model: string): string {
    const allowed = new Set(['auto', 'mureka-7.5', 'mureka-7.6', 'mureka-o1', 'mureka-o2', 'mureka-8']);
    return allowed.has(model) ? model : 'mureka-8';
  }

  private getInstrumentationText(instrumentation: string): string {
    switch (instrumentation.toLowerCase()) {
      case 'acoustic':
        return 'warm acoustic guitar, gentle piano, soft percussion, and subtle supporting textures';
      case 'electronic':
        return 'clean synth layers, tight electronic drums, warm pads, and focused melodic textures';
      case 'orchestral':
        return 'expressive strings, piano, light orchestral percussion, and cinematic supporting layers';
      default:
        return 'a balanced mix of acoustic and modern instruments with clear melodic focus';
    }
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
