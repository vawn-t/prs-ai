// Chrome Extension Types
export interface ChromeMessage {
  action: string;
  data?: any;
  keys?: string[];
}

export interface ChromeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Storage Types
export interface StorageKeys {
  API_CONFIG: string;
  GENERATION_RULES: string;
  ONBOARDING_COMPLETED: string;
}

// Application State Types
export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  apiConfig: import('./api.types').ApiConfig | null;
  generationRules: import('./pr.types').PRGenerationRules | null;
}

// GitHub Page Types
export interface GitHubPageInfo {
  isValid: boolean;
  pageType: 'pr-creation' | 'pr-edit' | 'compare' | 'unknown';
  repository?: {
    owner: string;
    name: string;
  };
  branches?: {
    base: string;
    head: string;
  };
}
