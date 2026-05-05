import { Injectable } from '@nestjs/common';
import type { BranchIntake } from '../types/build-my-card';
import { assemblePreservePrompt } from './prompt-builders/preserve.builder';
import { assembleTransformPrompt } from './prompt-builders/transform.builder';
import { assembleEnhancePrompt } from './prompt-builders/enhance.builder';
import type { PromptBuildResult } from './prompt-builders/shared.builder';

@Injectable()
export class CardPromptService {
  assembleBuildMyCardPrompt(intake: BranchIntake): PromptBuildResult {
    switch (intake.image_usage_mode) {
      case 'preserve':
        return assemblePreservePrompt(intake);
      case 'transform':
        return assembleTransformPrompt(intake);
      case 'enhance':
        return assembleEnhancePrompt(intake);
      default:
        throw new Error(`Unknown image_usage_mode: ${(intake as any).image_usage_mode}`);
    }
  }
}
