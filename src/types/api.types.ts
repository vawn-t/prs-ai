// API Configuration Types
export interface ApiKey {
  provider: 'openai' | 'gemini';
  key: string;
  model?: string;
}

export interface ApiConfig {
  openai?: {
    key: string;
    model: string;
  };
  gemini?: {
    key: string;
    model: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}
