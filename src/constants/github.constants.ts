import { PRGenerationRules } from '@types';

// Default PR Generation Rules
export const DEFAULT_GENERATION_RULES: PRGenerationRules = {
  includeFileChanges: true,
  includeCommitMessages: true,
  maxDescriptionLength: 2000,
  titleFormat: 'conventional',
  descriptionSections: {
    summary: true,
    changes: true,
    testing: true,
    breaking: true,
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
