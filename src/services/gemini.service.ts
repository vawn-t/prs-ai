/**
 * Gemini API Service
 */

import { httpClient } from './http.service';
import { API_ENDPOINTS } from '@constants';
import { GeminiResponse } from '@types';

export interface GeminiConfig {
  key: string;
  model: string;
}

export interface GeminiGenerateRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

class GeminiService {
  private buildUrl(endpoint: string, apiKey: string): string {
    return `${endpoint}?key=${apiKey}`;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await httpClient.get(
        this.buildUrl(API_ENDPOINTS.GEMINI_MODELS, apiKey),
        { timeout: 10000 },
      );
      return response.status === 200;
    } catch (error) {
      console.error('Gemini API validation error:', error);
      return false;
    }
  }

  async generateText(
    config: GeminiConfig,
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      topK?: number;
      topP?: number;
    } = {},
  ): Promise<string> {
    const {
      maxTokens = 2000,
      temperature = 0.7,
      topK = 40,
      topP = 0.95,
    } = options;

    const requestData: GeminiGenerateRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature,
        topK,
        topP,
        maxOutputTokens: maxTokens,
      },
    };

    try {
      const url = this.buildUrl(
        `${API_ENDPOINTS.GEMINI_GENERATE}/${config.model}:generateContent`,
        config.key,
      );

      const response = await httpClient.post<GeminiResponse>(url, requestData, {
        timeout: 60000, // 60 seconds for generation
      });

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('No content received from Gemini');
      }

      return content.trim();
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error(
        `Gemini API error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async getModels(apiKey: string): Promise<string[]> {
    try {
      const response = await httpClient.get<{
        models: Array<{ name: string }>;
      }>(this.buildUrl(API_ENDPOINTS.GEMINI_MODELS, apiKey));

      const models = response.data.models || [];
      return models
        .map((model) => model.name.replace('models/', ''))
        .filter((name) => name.includes('gemini'))
        .sort();
    } catch (error) {
      console.error('Error fetching Gemini models:', error);
      throw new Error('Failed to fetch available models');
    }
  }
}

export const geminiService = new GeminiService();
