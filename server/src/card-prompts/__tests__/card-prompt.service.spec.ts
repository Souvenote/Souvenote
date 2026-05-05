import { CardPromptService } from '../card-prompt.service';
import type { PreserveBranchIntake, TransformBranchIntake, EnhanceBranchIntake } from '../../types/build-my-card';

describe('CardPromptService', () => {
  let service: CardPromptService;

  beforeEach(() => {
    service = new CardPromptService();
  });

  describe('Preserve branch', () => {
    const intake: PreserveBranchIntake = {
      image_usage_mode: 'preserve',
      recipient: 'Sarah',
      recipient_relationship: 'Partner',
      occasion: 'Birthday',
      multi_subject_intent: 'all',
      mood_primary: 'Romantic',
      mood_secondary: 'Calm',
      orientation: 'portrait',
      aspect_ratio: '5:7',
      color_palette: 'Cool',
      text_content: 'Happy Birthday Sarah',
      text_additions: ['Pisces'],
      decorative_elements: ['Stars', 'Sparkles'],
      locale: 'en-US',
      identity_preservation: true,
      design_element_style: 'Hand-drawn doodle',
      design_elements: ['Border', 'Light overlays'],
    };

    it('assembles a preserve prompt with correct mode', () => {
      const result = service.assembleBuildMyCardPrompt(intake);

      expect(result.assembledPrompt).toContain('Preserve');
      expect(result.assembledPrompt).toContain('Birthday');
      expect(result.assembledPrompt).toContain('Sarah');
      expect(result.assembledPrompt).toContain('Happy Birthday Sarah');
      expect(result.assembledPrompt).toContain('Hand-drawn doodle');
      expect(result.assembledPrompt).toContain('6% safe margin');
      expect(result.assembledPrompt).toContain('full-bleed');

      expect(result.jsonTemplate.image_usage_mode).toBe('preserve');
      expect(result.jsonTemplate.recipient).toBe('Sarah');
      expect((result.jsonTemplate.identity_preservation as any).enabled).toBe(true);
    });
  });

  describe('Transform branch', () => {
    const intake: TransformBranchIntake = {
      image_usage_mode: 'transform',
      recipient: 'Ceren',
      recipient_relationship: 'Friend',
      occasion: 'Birthday',
      multi_subject_intent: 'all',
      mood_primary: 'Romantic',
      mood_secondary: 'Calm',
      orientation: 'portrait',
      aspect_ratio: '5:7',
      color_palette: 'Cool',
      text_content: 'Happy Birthday Ceren',
      text_additions: ['Pisces'],
      decorative_elements: ['Stars', 'Sparkles'],
      locale: 'en-US',
      identity_preservation: true,
      scenario: 'a calm, emotional moment representing love and connection',
      style: 'Anime',
      environment: 'Cosmic ocean',
    };

    it('assembles a transform prompt with full-illustration constraints', () => {
      const result = service.assembleBuildMyCardPrompt(intake);

      expect(result.assembledPrompt).toContain('Transform');
      expect(result.assembledPrompt).toContain('Anime');
      expect(result.assembledPrompt).toContain('Cosmic ocean');
      expect(result.assembledPrompt).toContain('100% illustrated');
      expect(result.assembledPrompt).toContain('IDENTITY REFERENCE ONLY');
      expect(result.assembledPrompt).toContain('no photographic elements');
      expect(result.assembledPrompt).toContain('Happy Birthday Ceren');
      expect(result.assembledPrompt).toContain('6% safe margin');

      expect(result.jsonTemplate.image_usage_mode).toBe('transform');
      expect(result.jsonTemplate.style).toBe('Anime');
      expect((result.jsonTemplate.constraints as any).no_photo_pasted_face).toBe(true);
    });
  });

  describe('Enhance branch', () => {
    const intake: EnhanceBranchIntake = {
      image_usage_mode: 'enhance',
      recipient: 'Ceren',
      recipient_relationship: 'Friend',
      occasion: 'Birthday',
      multi_subject_intent: 'all',
      mood_primary: 'Romantic',
      mood_secondary: 'Calm',
      orientation: 'portrait',
      aspect_ratio: '5:7',
      color_palette: 'Cool',
      text_content: 'Happy Birthday Ceren',
      text_additions: ['Pisces'],
      decorative_elements: ['Stars', 'Sparkles'],
      locale: 'en-US',
      identity_preservation: true,
      style: 'Watercolor',
      enhancement_type: ['Lighting', 'Color grading'],
      enhancement_strength: 'Moderate',
    };

    it('assembles an enhance prompt with content-preservation + re-render constraints', () => {
      const result = service.assembleBuildMyCardPrompt(intake);

      expect(result.assembledPrompt).toContain('Enhance');
      expect(result.assembledPrompt).toContain('Watercolor');
      expect(result.assembledPrompt).toContain('CONTENT REFERENCE ONLY');
      expect(result.assembledPrompt).toContain('every element is drawn from scratch');
      expect(result.assembledPrompt).toContain('Moderate');
      expect(result.assembledPrompt).toContain('6% safe margin');
      expect(result.assembledPrompt).toContain('Happy Birthday Ceren');

      expect(result.jsonTemplate.image_usage_mode).toBe('enhance');
      expect((result.jsonTemplate.constraints as any).every_element_redrawn_in_new_medium).toBe(true);
      expect((result.jsonTemplate.enhancement as any).strength).toBe('Moderate');
    });
  });

  describe('R8 character truncation', () => {
    it('truncates recipient name over 60 chars', () => {
      const longName = 'A'.repeat(70);
      const intake: PreserveBranchIntake = {
        image_usage_mode: 'preserve',
        recipient: longName,
        recipient_relationship: 'Friend',
        occasion: 'Birthday',
        multi_subject_intent: 'all',
        mood_primary: 'Romantic',
        mood_secondary: null,
        orientation: 'portrait',
        aspect_ratio: '5:7',
        color_palette: 'Warm',
        text_content: 'Happy Birthday',
        text_additions: [],
        decorative_elements: [],
        locale: 'en-US',
        identity_preservation: false,
        design_element_style: 'Modern minimal',
        design_elements: [],
      };

      const result = service.assembleBuildMyCardPrompt(intake);
      const recipient = result.jsonTemplate.recipient as string;
      expect(recipient.length).toBeLessThanOrEqual(60);
      expect(recipient.endsWith('\u2026')).toBe(true);
    });
  });
});
