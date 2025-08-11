/**
 * PR Generation Constants and Templates
 * Based on professional PR best practices guide
 */

import { PRGenerationRules } from '@types';

// Enhanced Default Generation Rules with Professional Standards
export const ENHANCED_DEFAULT_GENERATION_RULES: PRGenerationRules = {
  // Content inclusion - what to analyze from the codebase
  includeFileChanges: true,
  includeCommitMessages: true,

  // Title generation - following conventional commits
  titleFormat: 'conventional',
  customTitleTemplate: undefined,

  // Description constraints for readability
  maxDescriptionLength: 2000, // Sweet spot for comprehensive yet readable PRs

  // Professional PR structure sections
  descriptionSections: {
    summary: true, // Essential: What and why
    changes: true, // Essential: Specific modifications
    testing: true, // Essential: Verification methods
    breaking: true, // Critical: Compatibility impact
  },
};

// Title Format Templates and Examples
export const TITLE_TEMPLATES = {
  conventional: {
    format: '[type]([scope]): [description]',
    example: 'feat(auth): add OAuth2 login support',
    maxLength: 72,
    recommendedLength: 50,
    description:
      'Conventional Commits format with type, optional scope, and imperative description',
  },
  descriptive: {
    format: '[Clear action statement]',
    example: 'Add OAuth2 login support for enhanced user authentication',
    maxLength: 72,
    recommendedLength: 60,
    description: 'Clear, descriptive format focusing on the action and benefit',
  },
  custom: {
    format: 'User-defined template',
    example: '[FEATURE] OAuth2 Login Implementation',
    maxLength: 72,
    recommendedLength: 50,
    description: 'Custom format defined by user preferences',
  },
} as const;

// Professional Description Template (Markdown format)
export const PROFESSIONAL_DESCRIPTION_TEMPLATE = `## Description
[Provide a clear and concise explanation of what the PR does and why it's needed.]

## Changes Made
- [List specific changes or tasks completed, using bullet points.]
- [Focus on key modifications, e.g., "Added X feature to Y module."]

## Related Issues
- [Link to relevant issue(s) or ticket(s), e.g., "Closes #123" or "Fixes #456".]

## Testing
- [Describe how the changes were tested, e.g., unit tests, manual testing, or CI.]
- [Mention any specific test cases or scenarios covered.]

## Screenshots (if applicable)
- [Include screenshots or GIFs for UI changes to provide visual context.]

## Additional Notes
- [Add any extra information, such as known limitations, follow-up tasks, or reviewer instructions.]
`;

// Minimal Description Template (for smaller changes)
export const MINIMAL_DESCRIPTION_TEMPLATE = `## Description
[Brief explanation of the change]

## Changes
- [Key modification]

## Testing
- [How it was verified]
`;

// Comprehensive Description Template (for major features)
export const COMPREHENSIVE_DESCRIPTION_TEMPLATE = `## Description
[Detailed explanation of what the PR does and why it's needed, including business context]

## Changes Made
- [Detailed list of specific changes or tasks completed]
- [Include technical details and implementation notes]
- [Mention new files, modified modules, removed functionality]

## Related Issues
- [Link to relevant issue(s): "Closes #123", "Fixes #456", "Related to #789"]
- [Reference any design documents or specifications]

## Breaking Changes
- [List any breaking changes that affect existing functionality]
- [Include migration instructions if applicable]

## Testing
- [Unit tests: Describe new or modified test cases]
- [Integration tests: End-to-end testing scenarios]
- [Manual testing: Steps taken to verify functionality]
- [Performance testing: If applicable]
- [Security testing: If applicable]

## Screenshots/Videos
- [Include visual evidence for UI/UX changes]
- [Before/after comparisons if relevant]

## Documentation
- [Links to updated documentation]
- [API documentation changes]
- [README updates]

## Deployment Notes
- [Any special deployment requirements]
- [Environment variable changes]
- [Database migrations needed]

## Additional Notes
- [Known limitations or technical debt]
- [Follow-up tasks or future improvements]
- [Reviewer-specific instructions]
- [Dependencies on other PRs]
`;

// Section Configuration Options
export const DESCRIPTION_SECTIONS = {
  summary: {
    title: 'Description',
    required: true,
    description: 'Clear explanation of what the PR does and why',
    template:
      "[Provide a clear and concise explanation of what the PR does and why it's needed.]",
  },
  changes: {
    title: 'Changes Made',
    required: true,
    description: 'Specific modifications and tasks completed',
    template:
      '- [List specific changes or tasks completed, using bullet points.]\n- [Focus on key modifications, e.g., "Added X feature to Y module."]',
  },
  relatedIssues: {
    title: 'Related Issues',
    required: false,
    description: 'Links to relevant issues or tickets',
    template:
      '- [Link to relevant issue(s) or ticket(s), e.g., "Closes #123" or "Fixes #456".]',
  },
  testing: {
    title: 'Testing',
    required: true,
    description: 'How the changes were verified',
    template:
      '- [Describe how the changes were tested, e.g., unit tests, manual testing, or CI.]\n- [Mention any specific test cases or scenarios covered.]',
  },
  breaking: {
    title: 'Breaking Changes',
    required: false,
    description: 'Any breaking changes that affect compatibility',
    template:
      '- [List any breaking changes that affect existing functionality]\n- [Include migration instructions if applicable]',
  },
  screenshots: {
    title: 'Screenshots',
    required: false,
    description: 'Visual evidence for UI/UX changes',
    template:
      '- [Include screenshots or GIFs for UI changes to provide visual context.]',
  },
  additionalNotes: {
    title: 'Additional Notes',
    required: false,
    description: 'Extra information, limitations, or follow-up tasks',
    template:
      '- [Add any extra information, such as known limitations, follow-up tasks, or reviewer instructions.]',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  title: {
    minLength: 10,
    maxLength: 72,
    recommendedMaxLength: 50,
    patterns: {
      conventional:
        /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,}$/,
      noUppercaseStart: /^[a-z]/,
      noTrailingPeriod: /[^.]$/,
    },
  },
  description: {
    minLength: 20,
    maxLength: 5000,
    recommendedMaxLength: 2000,
  },
} as const;

// Type and Scope Suggestions for Conventional Commits
export const CONVENTIONAL_TYPES = {
  feat: 'A new feature',
  fix: 'A bug fix',
  docs: 'Documentation only changes',
  style:
    'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
  refactor: 'A code change that neither fixes a bug nor adds a feature',
  perf: 'A code change that improves performance',
  test: 'Adding missing tests or correcting existing tests',
  build: 'Changes that affect the build system or external dependencies',
  ci: 'Changes to our CI configuration files and scripts',
  chore: "Other changes that don't modify src or test files",
  revert: 'Reverts a previous commit',
} as const;

export const COMMON_SCOPES = [
  'api',
  'ui',
  'auth',
  'db',
  'config',
  'deps',
  'security',
  'docs',
  'test',
  'build',
  'ci',
  'core',
  'utils',
  'types',
  'components',
  'services',
  'hooks',
  'styles',
] as const;

// Quality Guidelines for PR Generation
export const PR_QUALITY_GUIDELINES = {
  title: {
    useImperativeMood: true, // "Add feature" not "Added feature"
    keepConcise: true, // Under 50 characters ideally
    avoidVagueTerms: true, // Avoid "update", "improve", "fix" without context
    includeContext: true, // What component/area is affected
  },
  description: {
    explainWhy: true, // Why the change is needed
    explainWhat: true, // What was changed
    includeContext: true, // Business or technical context
    linkIssues: true, // Reference related issues
    describeTestinng: true, // How it was verified
    mentionBreaking: true, // Call out breaking changes
  },
  general: {
    keepPRsSmall: true, // Focus on one logical change
    useMarkdown: true, // Leverage formatting for readability
    reviewBeforeSubmit: true, // Check for typos and clarity
  },
} as const;

// Error Messages for Validation
export const VALIDATION_MESSAGES = {
  title: {
    tooShort: `Title must be at least ${VALIDATION_RULES.title.minLength} characters`,
    tooLong: `Title should not exceed ${VALIDATION_RULES.title.maxLength} characters`,
    recommendedLength: `Consider keeping title under ${VALIDATION_RULES.title.recommendedMaxLength} characters for better readability`,
    invalidConventional:
      'Title should follow conventional commit format: type(scope): description',
    shouldStartLowercase: 'Title should start with lowercase letter',
    noTrailingPeriod: 'Title should not end with a period',
  },
  description: {
    tooShort: `Description must be at least ${VALIDATION_RULES.description.minLength} characters`,
    tooLong: `Description should not exceed ${VALIDATION_RULES.description.maxLength} characters`,
    recommendedLength: `Consider keeping description under ${VALIDATION_RULES.description.recommendedMaxLength} characters for better readability`,
  },
} as const;
