// Import test to verify all our exports work correctly
import type {
  ApiConfig,
  PRGenerationRules,
  ButtonProps,
  InputProps,
} from './types';

import { DEFAULT_MODELS, GITHUB_SELECTORS, UI_CLASSES } from './constants';

import { cn, capitalize, detectGitHubPage } from './utils';

import {
  httpClient,
  openAIService,
  geminiService,
  chromeStorageService,
} from './services';

import { useStorage, useApiConfig, useGenerationRules } from './hooks';

// This file is just for testing imports - delete after verification
console.log('All imports work correctly!');
