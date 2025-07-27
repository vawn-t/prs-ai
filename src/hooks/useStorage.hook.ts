/**
 * Custom hook for managing Chrome storage
 */

import { useState, useEffect, useCallback } from 'react';
import { chromeStorageService } from '@services';

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadValue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedValue = await chromeStorageService.get<T>(key);
      setValue(storedValue !== null ? storedValue : defaultValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load value');
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  const updateValue = useCallback(
    async (newValue: T) => {
      try {
        setError(null);
        await chromeStorageService.set(key, newValue);
        setValue(newValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save value');
        throw err;
      }
    },
    [key],
  );

  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await chromeStorageService.remove(key);
      setValue(defaultValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove value');
      throw err;
    }
  }, [key, defaultValue]);

  useEffect(() => {
    loadValue();
  }, [loadValue]);

  return {
    value,
    loading,
    error,
    setValue: updateValue,
    removeValue,
    reload: loadValue,
  };
}
