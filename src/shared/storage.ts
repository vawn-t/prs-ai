import { ApiConfig, PRGenerationRules } from './types';

export const STORAGE_KEYS = {
  API_CONFIG: 'prs_ai_api_config',
  GENERATION_RULES: 'prs_ai_generation_rules',
  ONBOARDING_COMPLETED: 'prs_ai_onboarding_completed',
} as const;

export const DEFAULT_RULES: PRGenerationRules = {
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

export const DEFAULT_MODELS = {
  openai: 'gpt-3.5-turbo',
  gemini: 'gemini-2.5-flash',
};

export class StorageService {
  static async getApiConfig(): Promise<ApiConfig | null> {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.API_CONFIG);
      const config = result[STORAGE_KEYS.API_CONFIG] || null;
      return config;
    } catch (error) {
      console.error('StorageService: Error getting API config:', error);
      return null;
    }
  }

  static async setApiConfig(config: ApiConfig): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.API_CONFIG]: config });
  }

  static async getGenerationRules(): Promise<PRGenerationRules> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.GENERATION_RULES);
    return result[STORAGE_KEYS.GENERATION_RULES] || DEFAULT_RULES;
  }

  static async setGenerationRules(rules: PRGenerationRules): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.GENERATION_RULES]: rules });
  }

  static async isOnboardingCompleted(): Promise<boolean> {
    const result = await chrome.storage.sync.get(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
    );
    return result[STORAGE_KEYS.ONBOARDING_COMPLETED] || false;
  }

  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    await chrome.storage.sync.set({
      [STORAGE_KEYS.ONBOARDING_COMPLETED]: completed,
    });
  }
}
