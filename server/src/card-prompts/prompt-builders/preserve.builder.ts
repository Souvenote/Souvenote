import type { PreserveBranchIntake } from '../../types/build-my-card';
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

export function assemblePreservePrompt(
  intake: PreserveBranchIntake,
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
    image_usage_mode: 'preserve',
    generation_behavior: { strict_mode_switching: true },
    recipient,
    recipient_relationship: intake.recipient_relationship,
    occasion,
    multi_subject_intent: intake.multi_subject_intent,
    subject:
      'Use the uploaded image exactly as provided. Do not modify the person, background, pose, expression, or composition. Only add design-layer elements such as text or decorative overlays.',
    identity_preservation: {
      enabled: true,
      mode: 'full_image_lock',
      strength: 'max',
    },
    editing_scope: {
      allow_changes_to_subject: false,
      allow_background_changes: false,
      allow_relighting: false,
      allow_overlays: true,
      allow_design_layer_only: true,
    },
    environment: 'Preserve original setting exactly',
    orientation: intake.orientation,
    aspect_ratio: intake.aspect_ratio,
    composition:
      'Respect original composition. Maintain clear focal point. Do not cover subject\'s face or key elements. Use available negative space for text and overlays.',
    lighting: 'Preserve original lighting exactly',
    style: 'No stylization of the underlying image. Apply chosen design-element style to overlays only.',
    color_palette: intake.color_palette || occasionDefaults.palette,
    design_element_style: intake.design_element_style,
    details: 'Add the chosen design elements without cluttering the image',
    mood_primary: intake.mood_primary,
    mood_secondary: intake.mood_secondary,
    text: {
      content: textContent,
      tone: occasionDefaults.textTone,
      placement: 'auto',
      integration: 'overlay',
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
        design_elements: 'supporting',
      },
    },
    edge_rules: { ...MARGIN_EDGE_RULES },
    integrity_rules: { clean_anatomy: true, no_distortion: true, no_artifacts: true },
    constraints: {
      ...BASE_CONSTRAINTS,
      no_subject_or_background_modification: true,
      design_layer_additions_allowed: true,
    },
  };

  const prompt = buildAssembledPrompt(jsonTemplate, intake);

  return { jsonTemplate, assembledPrompt: prompt };
}

function buildAssembledPrompt(
  json: Record<string, any>,
  intake: PreserveBranchIntake,
): string {
  const prefix = buildPromptPrefix(intake, 'Preserve');
  const occasionDefaults = OCCASION_DEFAULTS[intake.occasion] || OCCASION_DEFAULTS['Just Because'];

  const parts = [
    prefix,
    `Use the uploaded photograph exactly as provided. Do not modify the subject, the background, the pose, the expression, or the composition. Treat the photo as the locked base layer. Do not relight, retouch, or restyle the underlying photograph.`,
  ];

  if (intake.design_element_style) {
    parts.push(
      `Add a ${intake.design_element_style} design layer to the edges or negative space of the image. The design elements should frame the photo without obscuring the subject. Render overlays in ${intake.color_palette || occasionDefaults.palette} tones.`,
    );
  }

  if (intake.design_elements?.length) {
    parts.push(
      `Include these design elements as overlays (never on the subject's face): ${intake.design_elements.join(', ')}.`,
    );
  }

  const visualMotifs = (json.decorative_elements as string) || '';
  const textAdditions = (json.text_secondary as any)?.content || '';

  if (intake.text_content) {
    const recipientName = intake.recipient || '';
    parts.push(
      `Place the primary text "${intake.text_content}" in the upper portion of the card using available negative space, set in ${occasionDefaults.typography}. The text sits on the design layer, not on the subject's face. Tune the typography so the name "${recipientName}" reads cleanly without crowding.`,
    );
  }

  if (textAdditions) {
    parts.push(
      `Integrate small text additions as part of the design layer: ${textAdditions}. Keep them subtle and readable, never competing with the primary text.`,
    );
  }

  parts.push(
    `Layout: ${JSON.stringify(json.layout)}.`,
    SAFE_MARGIN_CONSTRAINT,
    `Do not modify the underlying photograph in any way.`,
    QUALITY_CONSTRAINTS,
  );

  return parts.join(' ');
}
