/**
 * Chrome Storage Service
 */

import { STORAGE_KEYS } from '@constants';
import { ApiConfig, PRGenerationRules, ChromeResponse } from '@types';

class ChromeStorageService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.sync.get(key);
      return result[key] || null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.sync.set({ [key]: value });
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      throw new Error(`Failed to save ${key}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.sync.remove(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw new Error(`Failed to remove ${key}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  // Specific methods for app data
  async getApiConfig(): Promise<ApiConfig | null> {
    return this.get<ApiConfig>(STORAGE_KEYS.API_CONFIG);
  }

  async setApiConfig(config: ApiConfig): Promise<void> {
    return this.set(STORAGE_KEYS.API_CONFIG, config);
  }

  async getGenerationRules(): Promise<PRGenerationRules | null> {
    return this.get<PRGenerationRules>(STORAGE_KEYS.GENERATION_RULES);
  }

  async setGenerationRules(rules: PRGenerationRules): Promise<void> {
    return this.set(STORAGE_KEYS.GENERATION_RULES, rules);
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const result = await this.get<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return result || false;
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    return this.set(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  }
}

export const chromeStorageService = new ChromeStorageService();
