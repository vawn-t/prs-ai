/**
 * Application Constants
 * Application-wide constants
 */

import { GenerationRules } from '@types';

export const DEFAULT_NEW_GENERATION_RULES: GenerationRules = {
  // Title generation
  titleStyle: 'conventional',
  titleMaxLength: 50,
  includeTicketNumber: true,

  // Description generation
  descriptionFormat: 'structured',
  includeSummary: true,
  includeChanges: true,
  includeTesting: true,

  // Content preferences
  detailLevel: 'moderate',
  tone: 'professional',
  includeCodeSnippets: false,

  // Custom template
  customTemplate: undefined,
};
