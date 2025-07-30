// Storage Keys
export const STORAGE_KEYS = {
  API_CONFIG: 'prs_ai_api_config',
  GENERATION_RULES: 'prs_ai_generation_rules',
  ONBOARDING_COMPLETED: 'prs_ai_onboarding_completed',
} as const;

// Default Models
export const DEFAULT_MODELS = {
  openai: 'gpt-3.5-turbo',
  gemini: 'gemini-2.5-pro',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  OPENAI_MODELS: 'https://api.openai.com/v1/models',
  OPENAI_CHAT: 'https://api.openai.com/v1/chat/completions',
  GEMINI_MODELS: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

// Extension URLs
export const EXTENSION_URLS = {
  OPTIONS: 'options.html',
  POPUP: 'popup.html',
} as const;

// PR Generation Constants
export const PR_TITLE_TYPES = {
  FEAT: 'feat',
  FIX: 'fix',
  DOCS: 'docs',
  STYLE: 'style',
  REFACTOR: 'refactor',
  TEST: 'test',
  CHORE: 'chore',
  PERF: 'perf',
  CI: 'ci',
  BUILD: 'build',
  REVERT: 'revert',
} as const;

export const PR_TITLE_TYPE_DESCRIPTIONS = {
  [PR_TITLE_TYPES.FEAT]: 'New feature or functionality',
  [PR_TITLE_TYPES.FIX]: 'Bug fix',
  [PR_TITLE_TYPES.DOCS]: 'Documentation changes',
  [PR_TITLE_TYPES.STYLE]: 'Code style changes (formatting, no functional change)',
  [PR_TITLE_TYPES.REFACTOR]: 'Code refactoring without changing functionality',
  [PR_TITLE_TYPES.TEST]: 'Adding or updating tests',
  [PR_TITLE_TYPES.CHORE]: 'Maintenance tasks (e.g., updating dependencies)',
  [PR_TITLE_TYPES.PERF]: 'Performance improvements',
  [PR_TITLE_TYPES.CI]: 'CI/CD pipeline changes',
  [PR_TITLE_TYPES.BUILD]: 'Build system or dependency changes',
  [PR_TITLE_TYPES.REVERT]: 'Reverting a previous commit',
} as const;

export const PR_SCOPES = {
  AUTH: 'auth',
  UI: 'ui',
  API: 'api',
  DB: 'db',
  CONFIG: 'config',
  DEPS: 'deps',
  SECURITY: 'security',
  DOCS: 'docs',
  TEST: 'test',
  BUILD: 'build',
  CI: 'ci',
} as const;

export const DEFAULT_DESCRIPTION_TEMPLATE = `## Description
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

export const TITLE_FORMAT_EXAMPLES = {
  conventional: 'feat(auth): add OAuth2 login support',
  descriptive: 'Add OAuth2 login support for enhanced user authentication',
  custom: '[FEATURE] OAuth2 Login Implementation',
} as const;

export const DESCRIPTION_SECTION_TYPES = {
  DESCRIPTION: 'description',
  CHANGES: 'changes',
  RELATED_ISSUES: 'relatedIssues',
  TESTING: 'testing',
  SCREENSHOTS: 'screenshots',
  BREAKING_CHANGES: 'breakingChanges',
  ADDITIONAL_NOTES: 'additionalNotes',
} as const;

export const TITLE_CONSTRAINTS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 72,
  RECOMMENDED_MAX: 50,
} as const;

export const DESCRIPTION_CONSTRAINTS = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 5000,
  DEFAULT_MAX: 2000,
} as const;
