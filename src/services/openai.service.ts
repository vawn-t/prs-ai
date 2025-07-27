/**
 * OpenAI API Service
 */

import { httpClient, HttpOptions } from './http.service';
import { API_ENDPOINTS } from '@constants';
import { OpenAIResponse } from '@types';

export interface OpenAIConfig {
  key: string;
  model: string;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

class OpenAIService {
  private getHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await httpClient.get(API_ENDPOINTS.OPENAI_MODELS, {
        headers: this.getHeaders(apiKey),
        timeout: 10000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('OpenAI API validation error:', error);
      return false;
    }
  }

  async generateText(
    config: OpenAIConfig,
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      systemMessage?: string;
    } = {},
  ): Promise<string> {
    const {
      maxTokens = 2000,
      temperature = 0.7,
      systemMessage = 'You are a helpful assistant for generating professional pull request descriptions.',
    } = options;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt },
    ];

    const requestData: OpenAIChatRequest = {
      model: config.model,
      messages,
      max_tokens: maxTokens,
      temperature,
    };

    try {
      const response = await httpClient.post<OpenAIResponse>(
        API_ENDPOINTS.OPENAI_CHAT,
        requestData,
        {
          headers: this.getHeaders(config.key),
          timeout: 60000, // 60 seconds for generation
        },
      );

      const content = response.data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return content.trim();
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error(
        `OpenAI API error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async getModels(apiKey: string): Promise<string[]> {
    try {
      const response = await httpClient.get<{ data: Array<{ id: string }> }>(
        API_ENDPOINTS.OPENAI_MODELS,
        {
          headers: this.getHeaders(apiKey),
        },
      );

      const models = response.data.data || [];
      return models
        .filter((model) => model.id.includes('gpt'))
        .map((model) => model.id)
        .sort();
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      throw new Error('Failed to fetch available models');
    }
  }
}

export const openAIService = new OpenAIService();
