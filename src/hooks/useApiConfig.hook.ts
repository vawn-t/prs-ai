/**
 * API Configuration Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '@types';
import {
  chromeStorageService,
  chromeRuntimeService,
  openAIService,
  geminiService,
} from '@services';
import { DEFAULT_MODELS } from '@constants';

export function useApiConfig() {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chromeRuntimeService.getStorageData(['apiConfig']);

      if (response.success) {
        setConfig(response.data.apiConfig || null);
      } else {
        setError(response.error || 'Failed to load configuration');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load configuration',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: ApiConfig) => {
    try {
      setError(null);
      const response = await chromeRuntimeService.setStorageData({
        apiConfig: newConfig,
      });

      if (response.success) {
        setConfig(newConfig);
      } else {
        throw new Error(response.error || 'Failed to save configuration');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save configuration',
      );
      throw err;
    }
  }, []);

  const validateApiKey = useCallback(
    async (provider: 'openai' | 'gemini', apiKey: string): Promise<boolean> => {
      try {
        setValidating(true);
        setError(null);

        if (provider === 'openai') {
          return await openAIService.validateApiKey(apiKey);
        } else {
          return await geminiService.validateApiKey(apiKey);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Validation failed');
        return false;
      } finally {
        setValidating(false);
      }
    },
    [],
  );

  const hasValidConfig = useCallback((): boolean => {
    return !!(config && (config.openai?.key || config.gemini?.key));
  }, [config]);

  const createDefaultConfig = useCallback((): ApiConfig => {
    return {
      openai: {
        key: '',
        model: DEFAULT_MODELS.openai,
      },
      gemini: {
        key: '',
        model: DEFAULT_MODELS.gemini,
      },
    };
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    validating,
    hasValidConfig: hasValidConfig(),
    saveConfig,
    validateApiKey,
    reload: loadConfig,
    createDefault: createDefaultConfig,
  };
}
