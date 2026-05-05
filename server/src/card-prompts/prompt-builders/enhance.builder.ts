import type { EnhanceBranchIntake } from '../../types/build-my-card';
import {
  sanitizeAndTruncate,
  splitExtras,
  SAFE_MARGIN_CONSTRAINT,
  QUALITY_CONSTRAINTS,
  MARGIN_EDGE_RULES,
  BASE_CONSTRAINTS,
  buildPromptPrefix,
  buildTypographyBlock,
  buildTextSecondary,
  type PromptBuildResult,
} from './shared.builder';
import { OCCASION_DEFAULTS } from '../occasion-defaults';

export function assembleEnhancePrompt(
  intake: EnhanceBranchIntake,
): PromptBuildResult {
  const occasionDefaults = OCCASION_DEFAULTS[intake.occasion] || OCCASION_DEFAULTS['Just Because'];
  const { textAdditions, visualMotifs } = splitExtras([
    ...(intake.decorative_elements || []),
    ...(intake.text_additions || []),
  ]);

  const recipient = sanitizeAndTruncate(intake.recipient, 'recipient');
  const occasion = sanitizeAndTruncate(intake.occasion, 'occasion');
  const textContent = sanitizeAndTruncate(intake.text_content, 'customCardText');

  const jsonTemplate = {
    image_usage_mode: 'enhance',
    generation_behavior: { strict_mode_switching: true },
    recipient,
    recipient_relationship: intake.recipient_relationship,
    occasion,
    multi_subject_intent: intake.multi_subject_intent,
    subject:
      `Re-illustrate the entire uploaded photograph from scratch in the chosen artistic style (${intake.style}). The final image is 100% drawn — no photographic elements anywhere, including the face, body, hair, clothing, or background. Do not photo-paste, copy, or preserve any pixel from the original photograph; every surface in the output is illustrated. Use the photograph as a CONTENT REFERENCE ONLY: preserve the identity (recognizable as the same person), pose, body position, clothing, expression, background, and composition exactly — but render every single element in the new medium. The face and body must be re-drawn in the chosen style, not preserved photographically.`,
    identity_preservation: {
      enabled: true,
      mode: 'content_locked_style_open',
      strength: 'max',
      preserves: [
        'all_subjects',
        'pose',
        'body',
        'clothing',
        'face',
        'expression',
        'background',
        'composition',
      ],
    },
    editing_scope: {
      allow_changes_to_subject: false,
      allow_pose_change: false,
      allow_clothing_change: false,
      allow_face_change: false,
      allow_body_change: false,
      allow_background_change: false,
      allow_composition_change: false,
      allow_style_restyling: true,
      allow_medium_change: true,
      allow_relighting_within_style: true,
      allow_color_grading: true,
      allow_overlays: true,
    },
    enhancement: {
      type: intake.enhancement_type.join(', '),
      strength: intake.enhancement_strength,
      interpretation:
        'strength controls how aggressively the style transformation is applied. Subtle = mostly the original photo with a stylistic touch. Moderate = clearly stylized but still reads as the original photo. Strong = full re-rendering in the new medium while preserving all content.',
    },
    environment: 'Preserve original environment exactly; re-render in the chosen style',
    orientation: intake.orientation,
    aspect_ratio: intake.aspect_ratio,
    composition:
      'Maintain original composition exactly. Re-render in the chosen style without altering the arrangement or focal point.',
    lighting:
      'Preserve the original lighting direction and structure; re-interpret the lighting within the chosen artistic style',
    style: intake.style,
    color_palette: intake.color_palette || occasionDefaults.palette,
    details:
      `Preserve all original content. Re-render the entire scene in the chosen style. Apply decorative elements as part of the same stylistic medium so they read as part of the world rather than as overlays: ${visualMotifs.join(', ')}.`,
    mood_primary: intake.mood_primary,
    mood_secondary: intake.mood_secondary,
    text: {
      content: textContent,
      tone: occasionDefaults.textTone,
      placement: 'auto',
      integration: 'integrated',
      hierarchy: 'secondary',
    },
    text_secondary: buildTextSecondary(textAdditions),
    decorative_elements: visualMotifs.join(', '),
    typography: buildTypographyBlock(
      occasionDefaults.typography,
      occasionDefaults.typographyWeight,
      recipient,
    ),
    layout: {
      density: 'balanced',
      negative_space_usage: 'intentional',
      visual_priority: {
        subject: 'primary',
        text: 'secondary',
        background: 'supporting',
      },
    },
    edge_rules: { ...MARGIN_EDGE_RULES },
    integrity_rules: { clean_anatomy: true, no_distortion: true, no_artifacts: true },
    constraints: {
      ...BASE_CONSTRAINTS,
      preserve_original_structure: true,
      fully_illustrated_output: true,
      no_photographic_elements: true,
      no_photo_pasted_face: true,
      no_mixed_media: true,
      every_element_redrawn_in_new_medium: true,
    },
  };

  const prompt = buildAssembledPrompt(jsonTemplate, intake);

  return { jsonTemplate, assembledPrompt: prompt };
}

function buildAssembledPrompt(
  json: Record<string, any>,
  intake: EnhanceBranchIntake,
): string {
  const prefix = buildPromptPrefix(intake, 'Enhance');
  const occasionDefaults = OCCASION_DEFAULTS[intake.occasion] || OCCASION_DEFAULTS['Just Because'];

  const parts = [
    prefix,
    `Re-illustrate the entire uploaded photograph from scratch in the chosen ${intake.style} style. The final image is 100% rendered — no photographic elements anywhere, including the face, body, hair, clothing, or background. Do not photo-paste, copy, or preserve any pixel from the original photograph; every surface in the output is rendered as ${intake.style}.`,
    `Use the photograph as a CONTENT REFERENCE ONLY: preserve the identity (recognizable as the same person), pose, body position, clothing, expression, background, and composition exactly — but re-render every single element in the ${intake.style} medium. The face and body must be fully rendered in the ${intake.style} style, not preserved photographically.`,
  ];

  if (intake.enhancement_strength) {
    const strengthDesc =
      intake.enhancement_strength === 'Subtle'
        ? 'mostly the original photo with a stylistic touch — light artistic effects, photographic base preserved'
        : intake.enhancement_strength === 'Moderate'
          ? 'clearly stylized — the face, body, and surroundings are re-drawn in the chosen style with visible stylistic features, while content (pose, clothing, identity, composition) matches the original'
          : 'fully re-illustrated — every element is drawn from scratch in the new medium; no photographic elements remain';
    parts.push(
      `Apply ${intake.enhancement_strength.toLowerCase()} strength to the style transformation: ${strengthDesc}.`,
    );
  }

  if (intake.enhancement_type?.length) {
    parts.push(
      `Within the ${intake.style} style, apply: ${intake.enhancement_type.join(', ')}. These effects must be rendered as part of the ${intake.style} medium, not as photographic overlays.`,
    );
  }

  parts.push(
    `Maintain the original composition and focal point exactly. The subject remains primary. Reserve negative space in the upper portion of the card for text.`,
    `Color palette: ${intake.color_palette || occasionDefaults.palette}.`,
  );

  if (intake.text_content) {
    parts.push(
      `Place the primary text "${intake.text_content}" in the upper portion of the card, set in ${occasionDefaults.typography}. The text should feel integrated with the color palette and remain clearly legible.`,
      SAFE_MARGIN_CONSTRAINT,
      `Tune so "${intake.recipient || ''}" reads cleanly without crowding.`,
    );
  } else {
    parts.push(SAFE_MARGIN_CONSTRAINT);
  }

  const visualMotifs = (json.decorative_elements as string) || '';
  if (visualMotifs) {
    parts.push(
      `Decorative elements integrated into the re-rendered scene: ${visualMotifs} — all rendered in the same ${intake.style} style so they read as part of the world rather than as photographic overlays.`,
    );
  }

  const textAdditions = (json.text_secondary as any)?.content || '';
  if (textAdditions) {
    parts.push(
      `Integrate small text additions: ${textAdditions} — integrated naturally as small readable detail, rendered in the ${intake.style} style.`,
    );
  }

  parts.push(
    QUALITY_CONSTRAINTS,
    `Constraints: The image is 100% ${intake.style} illustration — no photographic elements anywhere, no photo-pasted face, no mixed media. Every surface — face, skin, hair, body, clothing, background — is fully rendered in the ${intake.style} medium. Preserve the content of the original (who, where, how arranged, what they're wearing, the composition) but render every element in the new medium.`,
  );

  return parts.join(' ');
}
