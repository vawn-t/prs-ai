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
  GEMINI_GENERATE: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

// Extension URLs
export const EXTENSION_URLS = {
  OPTIONS: 'options.html',
  POPUP: 'popup.html',
} as const;
