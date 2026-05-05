export type ImageUsageMode = 'preserve' | 'transform' | 'enhance';
export type Orientation = 'portrait' | 'landscape';
export type AspectRatio = '5:7' | '7:5';
export type MultiSubjectIntent = 'all' | 'centered' | 'custom';
export type VibeOption = 'Romantic' | 'Funny' | 'Cute' | 'Heartfelt' | 'Elegant' | 'Playful' | 'Calm' | 'Celebratory';
export type StyleOption = 'Photographic' | 'Cinematic' | 'Cartoon' | 'Anime' | 'Watercolor' | 'Painterly' | 'Minimal' | 'Vintage' | 'Fantasy' | 'Dreamy';
export type SceneOption = 'Keep original' | 'Indoors' | 'Beach' | 'Nature' | 'City' | 'Fantasy' | 'Cosmic' | 'Garden' | 'Café';
export type ColorFeelOption = 'Warm' | 'Soft' | 'Bright' | 'Cool' | 'Dark' | 'Muted';
export type EnhancementStrength = 'Subtle' | 'Moderate' | 'Strong';
export type EnhancementType = 'Lighting' | 'Color grading' | 'Artistic filter' | 'Soft glow';
export type DesignElementStyle = 'Vintage frame' | 'Watercolor border' | 'Gold foil accents' | 'Modern minimal' | 'Hand-drawn doodle' | 'Floral wreath' | 'Geometric pattern';

export interface BuildMyCardIntake {
  image_usage_mode: ImageUsageMode;
  recipient: string;
  recipient_relationship: string;
  occasion: string;
  multi_subject_intent: MultiSubjectIntent;
  mood_primary: VibeOption;
  mood_secondary: VibeOption | null;
  orientation: Orientation;
  aspect_ratio: AspectRatio;
  color_palette: ColorFeelOption | string;
  text_content: string;
  text_additions: string[];
  decorative_elements: string[];
  locale: string;
  identity_preservation: boolean;
}

export interface PreserveBranchIntake extends BuildMyCardIntake {
  image_usage_mode: 'preserve';
  design_element_style: DesignElementStyle | string;
  design_elements: string[];
}

export interface TransformBranchIntake extends BuildMyCardIntake {
  image_usage_mode: 'transform';
  scenario: string;
  style: StyleOption | string;
  environment: SceneOption | string;
}

export interface EnhanceBranchIntake extends BuildMyCardIntake {
  image_usage_mode: 'enhance';
  style: StyleOption | string;
  enhancement_type: EnhancementType[];
  enhancement_strength: EnhancementStrength;
}

export type BranchIntake = PreserveBranchIntake | TransformBranchIntake | EnhanceBranchIntake;

export interface CardTextGenerationInput {
  recipient_name: string;
  recipient_relationship: string;
  occasion: string;
  mood_primary: string;
  mood_secondary: string | null;
  memory_or_feeling?: string;
  style?: string;
  decorative_elements?: string[];
  locale: string;
}

export interface CardTextGenerationResult {
  options: string[];
}
