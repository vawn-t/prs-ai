/**
 * Custom hook for managing generation rules
 */

import { useState, useEffect, useCallback } from 'react';
import { PRGenerationRules } from '@types';
import { chromeRuntimeService } from '@services';
import { DEFAULT_GENERATION_RULES } from '@constants';

export function useGenerationRules() {
  const [rules, setRules] = useState<PRGenerationRules>(
    DEFAULT_GENERATION_RULES,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chromeRuntimeService.getStorageData([
        'generationRules',
      ]);

      if (response.success) {
        setRules(response.data.generationRules || DEFAULT_GENERATION_RULES);
      } else {
        setError(response.error || 'Failed to load generation rules');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load generation rules',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRules = useCallback(async (newRules: PRGenerationRules) => {
    try {
      setError(null);
      const response = await chromeRuntimeService.setStorageData({
        generationRules: newRules,
      });

      if (response.success) {
        setRules(newRules);
      } else {
        throw new Error(response.error || 'Failed to save generation rules');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save generation rules',
      );
      throw err;
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    await saveRules(DEFAULT_GENERATION_RULES);
  }, [saveRules]);

  const updateRule = useCallback(
    async <K extends keyof PRGenerationRules>(
      key: K,
      value: PRGenerationRules[K],
    ) => {
      const updatedRules = { ...rules, [key]: value };
      await saveRules(updatedRules);
    },
    [rules, saveRules],
  );

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return {
    rules,
    loading,
    error,
    saveRules,
    updateRule,
    resetToDefaults,
    reload: loadRules,
  };
}
