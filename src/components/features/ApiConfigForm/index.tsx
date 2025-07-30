import { useEffect, useState } from 'react';
import { ApiConfig } from '@types';
import { Button, Input, Select, StatusIndicator } from '../../common';
import { useApiConfig } from '@hooks';
import { DEFAULT_MODELS } from '@constants';

interface ApiConfigFormProps {
  onSave?: (config: ApiConfig) => void;
  className?: string;
}

export const ApiConfigForm = ({
  onSave,
  className = '',
}: ApiConfigFormProps) => {
  const { config, loading, error, validating, saveConfig, validateApiKey } =
    useApiConfig();

  const [formData, setFormData] = useState<ApiConfig>(
    () =>
      config || {
        openai: { key: '', model: DEFAULT_MODELS.openai },
        gemini: { key: '', model: DEFAULT_MODELS.gemini },
      },
  );

  const [validationStatus, setValidationStatus] = useState<{
    openai: 'idle' | 'success' | 'error' | 'loading';
    gemini: 'idle' | 'success' | 'error' | 'loading';
  }>({
    openai: 'idle',
    gemini: 'idle',
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleValidateKey = async (provider: 'openai' | 'gemini') => {
    const key = formData[provider]?.key;
    if (!key) return;

    setValidationStatus((prev) => ({ ...prev, [provider]: 'loading' }));

    try {
      const isValid = await validateApiKey(provider, key);
      setValidationStatus((prev) => ({
        ...prev,
        [provider]: isValid ? 'success' : 'error',
      }));
    } catch {
      setValidationStatus((prev) => ({ ...prev, [provider]: 'error' }));
    }
  };

  const handleSave = async () => {
    try {
      await saveConfig(formData);
      onSave?.(formData);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const updateField = (
    provider: 'openai' | 'gemini',
    field: 'key' | 'model',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));

    if (field === 'key') {
      setValidationStatus((prev) => ({ ...prev, [provider]: 'idle' }));
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <StatusIndicator status='loading' message='Loading configuration...' />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && <StatusIndicator status='error' message={error} />}

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          OpenAI Configuration
        </h3>

        <div className='space-y-4'>
          <div className='flex gap-4 items-end'>
            <Input
              label='API Key'
              type='password'
              value={formData.openai?.key || ''}
              onChange={(value) => updateField('openai', 'key', value)}
              placeholder='sk-...'
              className='flex-1'
            />

            <Button
              variant='secondary'
              size='md'
              onClick={() => handleValidateKey('openai')}
              disabled={!formData.openai?.key || validating}
              loading={validationStatus.openai === 'loading'}
            >
              Validate
            </Button>
          </div>

          {validationStatus.openai !== 'idle' && (
            <StatusIndicator
              status={validationStatus.openai}
              message={
                validationStatus.openai === 'success'
                  ? 'API key is valid'
                  : validationStatus.openai === 'error'
                  ? 'Invalid API key'
                  : 'Validating...'
              }
              showIcon
            />
          )}

          <Select
            label='Model'
            value={formData.openai?.model || DEFAULT_MODELS.openai}
            onChange={(value) => updateField('openai', 'model', value)}
            options={[
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
            ]}
          />
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Gemini Configuration
        </h3>

        <div className='space-y-4'>
          <div className='flex gap-4 items-end'>
            <Input
              label='API Key'
              type='password'
              value={formData.gemini?.key || ''}
              onChange={(value) => updateField('gemini', 'key', value)}
              placeholder='AIza...'
              className='flex-1'
            />

            <Button
              variant='secondary'
              size='md'
              onClick={() => handleValidateKey('gemini')}
              disabled={!formData.gemini?.key || validating}
              loading={validationStatus.gemini === 'loading'}
            >
              Validate
            </Button>
          </div>

          {validationStatus.gemini !== 'idle' && (
            <StatusIndicator
              status={validationStatus.gemini}
              message={
                validationStatus.gemini === 'success'
                  ? 'API key is valid'
                  : validationStatus.gemini === 'error'
                  ? 'Invalid API key'
                  : 'Validating...'
              }
              showIcon
            />
          )}

          <Select
            label='Model'
            value={formData.gemini?.model || DEFAULT_MODELS.gemini}
            onChange={(value) => updateField('gemini', 'model', value)}
            options={[
              { value: 'gemini-pro', label: 'Gemini Pro' },
              { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
            ]}
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button
          variant='primary'
          onClick={handleSave}
          disabled={!formData.openai?.key && !formData.gemini?.key}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
