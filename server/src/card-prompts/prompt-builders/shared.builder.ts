import type {
  BuildMyCardIntake,
  CardTextGenerationInput,
} from '../../types/build-my-card';

export const R8_CAPS: Record<string, number> = {
  recipient: 60,
  occasion: 50,
  scenario: 280,
  customCardText: 80,
  insideMessage: 500,
  signOff: 30,
  musicEdit: 280,
};

export function truncateWithEllipsis(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1).trimEnd() + '\u2026';
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /override\s+system\s+(prompt|instructions?)/gi,
  /you\s+are\s+now\s+(a\s+)?(different|new)\s+(model|ai|assistant)/gi,
  /forget\s+(all\s+)?(your\s+)?(training|instructions?|rules?)/gi,
];

export function sanitizeInput(text: string): string {
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  cleaned = cleaned.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');

  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '[filtered]');
  }

  cleaned = cleaned.trim();
  return cleaned;
}

export function sanitizeAndTruncate(
  value: string | undefined | null,
  fieldKey: string,
): string {
  if (!value) return '';
  const sanitized = sanitizeInput(value);
  const cap = R8_CAPS[fieldKey];
  if (cap) return truncateWithEllipsis(sanitized, cap);
  return sanitized;
}

export function splitExtras(
  selectedExtras: string[] | undefined,
): { textAdditions: string[]; visualMotifs: string[] } {
  if (!selectedExtras?.length) return { textAdditions: [], visualMotifs: [] };

  const textExtras = new Set(['Zodiac sign', 'Birthdate', 'Year', 'Custom number']);
  const textAdditions: string[] = [];
  const visualMotifs: string[] = [];

  for (const extra of selectedExtras) {
    if (textExtras.has(extra)) {
      textAdditions.push(extra);
    } else {
      visualMotifs.push(extra);
    }
  }

  return { textAdditions, visualMotifs };
}

export const SAFE_MARGIN_CONSTRAINT = `
STRICT 6% safe margin on all sides — no text, no faces, no key design elements,
and no meaningful decorative motifs may extend into the outer 6% of the canvas
on top, bottom, left, or right. This is a hard constraint, not a guideline.
The margin may contain only background color, soft texture, gradient continuation,
and atmospheric edge bleed.`;

export const QUALITY_CONSTRAINTS =
  'Full-bleed, edge-to-edge. Front cover only, not a mockup. ' +
  'Clean typography, no distortion. No logos or copyrighted content. ' +
  'No floating elements. Maintain clear visual hierarchy. ' +
  'High resolution, professional print quality, clean composition.';

export const MARGIN_EDGE_RULES = {
  safe_margin: '6%',
  strict_safe_margin: true,
  no_text_in_margin: true,
  no_faces_in_margin: true,
  no_key_elements_in_margin: true,
  no_decorative_motifs_in_margin: true,
  margin_may_contain: [
    'background color',
    'soft texture',
    'gradient continuation',
    'atmospheric edge bleed only',
  ],
  hard_constraint: true,
  no_vignetting: true,
  consistent_edges: true,
};

export const BASE_CONSTRAINTS = {
  full_bleed: true,
  front_cover_only: true,
  no_mockup: true,
  no_floating_elements: true,
  no_logos: true,
  no_copyrighted_content: true,
  consistent_style: true,
  clean_typography: true,
  maintain_visual_hierarchy: true,
  avoid_clutter: true,
  strict_safe_margin_hard_constraint: true,
  no_text_in_safe_margin: true,
  no_faces_in_safe_margin: true,
  no_key_elements_in_safe_margin: true,
  no_decorative_motifs_in_safe_margin: true,
};

export function buildPromptPrefix(
  intake: BuildMyCardIntake,
  branchLabel: string,
): string {
  const occasion = `${intake.occasion} Greeting Card`;
  return `Design a front-of-card ${occasion}. Orientation: ${intake.orientation} (aspect ratio ${intake.aspect_ratio}). This must be a complete front cover greeting card design, not a mockup. Branch: ${branchLabel}.`;
}

export function buildTypographyBlock(
  typographyFamily: string,
  typographyWeight: string,
  recipientName: string,
): Record<string, unknown> {
  return {
    font_family: typographyFamily,
    weight: typographyWeight,
    case: 'auto',
    spacing: 'auto',
    legibility_priority: 'high',
    tuned_for_recipient_name: true,
    no_distortion: true,
  };
}

export function buildTextSecondary(
  textAdditions: string[],
): { content: string; tone: string; placement: string; hierarchy: string } {
  return {
    content: textAdditions.join(', '),
    tone: 'subtle',
    placement: 'integrated',
    hierarchy: 'tertiary',
  };
}

export interface PromptBuildResult {
  jsonTemplate: Record<string, unknown>;
  assembledPrompt: string;
}
