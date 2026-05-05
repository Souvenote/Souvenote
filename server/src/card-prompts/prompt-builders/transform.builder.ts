import type { TransformBranchIntake } from '../../types/build-my-card';
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

export function assembleTransformPrompt(
  intake: TransformBranchIntake,
): PromptBuildResult {
  const occasionDefaults = OCCASION_DEFAULTS[intake.occasion] || OCCASION_DEFAULTS['Just Because'];
  const { textAdditions, visualMotifs } = splitExtras([
    ...(intake.decorative_elements || []),
    ...(intake.text_additions || []),
  ]);

  const recipient = sanitizeAndTruncate(intake.recipient, 'recipient');
  const occasion = sanitizeAndTruncate(intake.occasion, 'occasion');
  const textContent = sanitizeAndTruncate(intake.text_content, 'customCardText');
  const scenario = sanitizeAndTruncate(intake.scenario, 'scenario');

  const jsonTemplate = {
    image_usage_mode: 'transform',
    generation_behavior: { strict_mode_switching: true },
    recipient,
    recipient_relationship: intake.recipient_relationship,
    occasion,
    multi_subject_intent: intake.multi_subject_intent,
    subject:
      'The final image is 100% illustrated in the chosen artistic style. No photographic elements anywhere, including the face. No photo-pasted face. No mixed media. Use the uploaded photograph as an IDENTITY REFERENCE ONLY: study the person\'s distinguishing features (face shape, eye shape, hair, distinct features) and DRAW those features in the chosen style. The face must be fully rendered in the chosen medium, not preserved photographically from the source. The person reads as recognizably themselves, but as a drawn character on the page. Reimagine pose, expression, outfit, body, and surroundings freely per user choices.',
    identity_preservation: {
      enabled: true,
      mode: 'facial_characteristics_only',
      strength: 'high',
      style_render_allowed: true,
      exact_likeness_required: false,
    },
    transformation_intent: {
      level: 'high',
      allow_full_scene_replacement: true,
      allow_character_redesign: false,
      allow_facial_characteristics_change: false,
      allow_facial_style_rendering: true,
      allow_pose_reimagination: true,
      allow_outfit_reimagination: true,
      allow_expression_reimagination: true,
      allow_body_reimagination: true,
      allow_style_restyling: true,
    },
    scenario,
    environment: intake.environment,
    orientation: intake.orientation,
    aspect_ratio: intake.aspect_ratio,
    composition:
      'Cinematic composition with clear focal point. Subject slightly off-center with reserved space for text.',
    lighting: 'Stylized lighting matching mood',
    style: intake.style,
    color_palette: intake.color_palette || occasionDefaults.palette,
    details:
      `Integrate decorative elements: ${visualMotifs.join(', ')}. Integrate text additions naturally into the scene: ${textAdditions.join(', ')}.`,
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
      fully_illustrated_output: true,
      no_photographic_elements: true,
      no_photo_pasted_face: true,
      no_mixed_media: true,
    },
  };

  const prompt = buildAssembledPrompt(jsonTemplate, intake);

  return { jsonTemplate, assembledPrompt: prompt };
}

function buildAssembledPrompt(
  json: Record<string, any>,
  intake: TransformBranchIntake,
): string {
  const prefix = buildPromptPrefix(intake, 'Transform');
  const occasionDefaults = OCCASION_DEFAULTS[intake.occasion] || OCCASION_DEFAULTS['Just Because'];

  const parts = [
    prefix,
    `The final image is 100% illustrated in ${intake.style} style — every element including the face is drawn in the ${intake.style} medium. No photographic elements anywhere. No photo-pasted face. No mixed media.`,
    `Use the uploaded photograph as an IDENTITY REFERENCE ONLY: study the person's distinguishing features (face shape, eye shape, hair, distinct features) and DRAW those features in the ${intake.style} style. The result reads as the same person, but as a ${intake.style} character on the page — not as a photograph. Reimagine their pose, expression, outfit, body, and surroundings freely.`,
    `The face must be fully illustrated in the ${intake.style} style — do not preserve the photographic face from the source image, do not use any photographic skin texture or photographic facial detail.`,
  ];

  if (intake.scenario) {
    const scenarioDesc = intake.scenario;
    const moodDesc = intake.mood_secondary
      ? `primarily ${intake.mood_primary.toLowerCase()} with a ${intake.mood_secondary.toLowerCase()} undertone`
      : intake.mood_primary.toLowerCase();
    parts.push(
      `Scene: A ${scenarioDesc} set in a ${intake.environment} environment. The atmosphere should feel ${moodDesc}.`,
    );
  } else if (intake.environment) {
    parts.push(
      `Environment: ${intake.environment}. Set the scene in a ${intake.mood_primary.toLowerCase()} atmosphere.`,
    );
  }

  parts.push(
    `Style: High-quality ${intake.style} illustration. Avoid photorealism, avoid mixed media, avoid monochrome.`,
    `Color palette: ${intake.color_palette || occasionDefaults.palette}. Smooth gradient transitions and cohesive color harmony.`,
  );

  if (intake.text_content) {
    parts.push(
      `Text: "${intake.text_content}". Place using natural negative space. Do not overlap the subject's face or important elements. Typography should match the ${intake.style} aesthetic — ${occasionDefaults.typography} — feel integrated into the artwork, clean, legible, undistorted.`,
    );
  }

  const textAdditions = (json.text_secondary as any)?.content || '';
  if (textAdditions) {
    parts.push(
      `Integrate small text additions naturally into the scene: ${textAdditions}. They should be subtle and readable.`,
    );
  }

  const visualMotifs = (json.decorative_elements as string) || '';
  if (visualMotifs) {
    parts.push(
      `Decorative elements (rendered in the ${intake.style} style as part of the illustrated world, not as photographic overlays): ${visualMotifs}.`,
    );
  }

  parts.push(
    `Composition: Balanced with clear focal point. Subject slightly off-center. Leave intentional negative space for text.`,
    `Lighting: Stylized, matching the ${intake.mood_primary.toLowerCase()} mood. Avoid harsh shadows.`,
    SAFE_MARGIN_CONSTRAINT,
    QUALITY_CONSTRAINTS,
    `Constraints: 100% illustrated output — no photographic elements anywhere, no photo-pasted face, no mixed media. The face must be fully drawn in the ${intake.style} style.`,
  );

  return parts.join(' ');
}
