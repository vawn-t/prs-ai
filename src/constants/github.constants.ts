import { PRGenerationRules } from '@types';

// Default PR Generation Rules - Based on Best Practices Guide
export const DEFAULT_GENERATION_RULES: PRGenerationRules = {
  // Content inclusion preferences
  includeFileChanges: true,
  includeCommitMessages: true,
  
  // Title generation settings
  titleFormat: 'conventional', // Use conventional commits format by default
  customTitleTemplate: undefined, // No custom template by default
  
  // Description settings
  maxDescriptionLength: 2000, // Professional length for readability
  
  // Description sections (comprehensive structure)
  descriptionSections: {
    summary: true,     // ## Description - Clear explanation of what and why
    changes: true,     // ## Changes Made - Specific bullet points
    testing: true,     // ## Testing - How changes were verified
    breaking: true,    // ## Breaking Changes - Critical compatibility notes
  },
};

// GitHub URL Patterns
export const GITHUB_URL_PATTERNS = {
  COMPARE: /\/compare\//,
  PULL_NEW: /\/pull\/new/,
  PULL_EDIT: /\/pull\/\d+\/edit/,
  PULL_VIEW: /\/pull\/\d+$/,
} as const;

// GitHub DOM Selectors
export const GITHUB_SELECTORS = {
  TITLE_INPUT: '#pull_request_title, input[name="pull_request[title]"]',
  DESCRIPTION_TEXTAREA:
    '#pull_request_body, textarea[name="pull_request[body]"]',
  TAB_CONTAINER: 'tab-container',
  COMMENT_BOX: '.CommentBox-container',
  SUBMIT_AREA: '.d-flex.flex-justify-end.flex-items-center.flex-wrap',
  BTN_GROUP: '.BtnGroup, .btn-primary',
} as const;
