import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageService } from '@shared/storage';
import { AIService } from '@shared/ai-service';
import { ApiConfig, PRGenerationRules } from '@shared/types';
import { DEFAULT_MODELS, DEFAULT_GENERATION_RULES } from '@constants';

interface OptionsState {
  loading: boolean;
  saving: boolean;
  apiConfig: ApiConfig;
  generationRules: PRGenerationRules;
  statusMessage: { type: 'success' | 'error'; text: string } | null;
  apiStatus: {
    openai: 'connected' | 'disconnected' | 'unknown';
    gemini: 'connected' | 'disconnected' | 'unknown';
  };
  showOnboarding: boolean;
}

const OptionsApp: React.FC = () => {
  const [state, setState] = useState<OptionsState>({
    loading: true,
    saving: false,
    apiConfig: {},
    generationRules: DEFAULT_GENERATION_RULES,
    statusMessage: null,
    apiStatus: { openai: 'unknown', gemini: 'unknown' },
    showOnboarding: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [apiConfig, generationRules, onboardingCompleted] =
        await Promise.all([
          StorageService.getApiConfig(),
          StorageService.getGenerationRules(),
          StorageService.isOnboardingCompleted(),
        ]);

      setState((prev) => ({
        ...prev,
        loading: false,
        apiConfig: apiConfig || {},
        generationRules,
        showOnboarding: !onboardingCompleted,
      }));

      if (apiConfig) {
        checkApiStatus(apiConfig);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        statusMessage: { type: 'error', text: 'Failed to load settings' },
      }));
    }
  };

  const checkApiStatus = async (apiConfig: ApiConfig) => {
    const status: {
      openai: 'connected' | 'disconnected' | 'unknown';
      gemini: 'connected' | 'disconnected' | 'unknown';
    } = {
      openai: 'unknown',
      gemini: 'unknown',
    };

    if (apiConfig.openai?.key) {
      try {
        const isValid = await AIService.validateApiKey(
          'openai',
          apiConfig.openai.key,
        );
        status.openai = isValid ? 'connected' : 'disconnected';
      } catch {
        status.openai = 'disconnected';
      }
    }

    if (apiConfig.gemini?.key) {
      try {
        const isValid = await AIService.validateApiKey(
          'gemini',
          apiConfig.gemini.key,
        );
        status.gemini = isValid ? 'connected' : 'disconnected';
      } catch {
        status.gemini = 'disconnected';
      }
    }

    setState((prev) => ({ ...prev, apiStatus: status }));
  };

  const updateApiConfig = (
    provider: 'openai' | 'gemini',
    field: 'key' | 'model',
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      apiConfig: {
        ...prev.apiConfig,
        [provider]: {
          ...prev.apiConfig[provider],
          [field]: value,
        },
      },
    }));
  };

  const updateGenerationRules = (
    field: keyof PRGenerationRules,
    value: any,
  ) => {
    setState((prev) => ({
      ...prev,
      generationRules: {
        ...prev.generationRules,
        [field]: value,
      },
    }));
  };

  const updateDescriptionSection = (section: string, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      generationRules: {
        ...prev.generationRules,
        descriptionSections: {
          ...prev.generationRules.descriptionSections,
          [section]: enabled,
        },
      },
    }));
  };

  const testApiKey = async (provider: 'openai' | 'gemini') => {
    const key = state.apiConfig[provider]?.key;
    if (!key) {
      setState((prev) => ({
        ...prev,
        statusMessage: {
          type: 'error',
          text: `Please enter a ${provider} API key first`,
        },
      }));
      return;
    }

    try {
      const isValid = await AIService.validateApiKey(provider, key);
      setState((prev) => ({
        ...prev,
        apiStatus: {
          ...prev.apiStatus,
          [provider]: isValid ? 'connected' : 'disconnected',
        },
        statusMessage: {
          type: isValid ? 'success' : 'error',
          text: isValid
            ? `${provider} API key is valid!`
            : `${provider} API key is invalid`,
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        apiStatus: {
          ...prev.apiStatus,
          [provider]: 'disconnected',
        },
        statusMessage: {
          type: 'error',
          text: `Failed to test ${provider} API key`,
        },
      }));
    }
  };

  const saveSettings = async () => {
    setState((prev) => ({ ...prev, saving: true, statusMessage: null }));

    try {
      await Promise.all([
        StorageService.setApiConfig(state.apiConfig),
        StorageService.setGenerationRules(state.generationRules),
        StorageService.setOnboardingCompleted(true),
      ]);

      setState((prev) => ({
        ...prev,
        saving: false,
        showOnboarding: false,
        statusMessage: {
          type: 'success',
          text: 'Settings saved successfully!',
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        saving: false,
        statusMessage: { type: 'error', text: 'Failed to save settings' },
      }));
    }
  };

  if (state.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {state.showOnboarding && (
        <div className='onboarding'>
          <h3>🎉 Welcome to PRs-AI!</h3>
          <p>
            Get started by adding your AI API keys below. We support both OpenAI
            and Google Gemini.
          </p>

          <div className='guide-steps'>
            <h4>Getting API Keys:</h4>
            <div>
              <strong>OpenAI (ChatGPT):</strong>
              <ol>
                <li>
                  Visit{' '}
                  <a
                    href='https://platform.openai.com/api-keys'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    OpenAI API Keys
                  </a>
                </li>
                <li>Sign in or create an account</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the key and paste it below</li>
              </ol>
            </div>

            <div>
              <strong>Google Gemini:</strong>
              <ol>
                <li>
                  Visit{' '}
                  <a
                    href='https://makersuite.google.com/app/apikey'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Google AI Studio
                  </a>
                </li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API key"</li>
                <li>Copy the key and paste it below</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {state.statusMessage && (
        <div className={`status-message ${state.statusMessage.type}`}>
          {state.statusMessage.text}
        </div>
      )}

      <div className='section'>
        <h2>🔑 API Configuration</h2>

        <div className='form-group'>
          <label>OpenAI API Key</label>
          <div className='input-with-button'>
            <input
              type='password'
              placeholder='sk-...'
              value={state.apiConfig.openai?.key || ''}
              onChange={(e) => updateApiConfig('openai', 'key', e.target.value)}
            />
            <button
              className='button secondary'
              onClick={() => testApiKey('openai')}
              disabled={!state.apiConfig.openai?.key}
            >
              Test
            </button>
          </div>
          <div className='api-status'>
            <span
              className={`status-indicator ${state.apiStatus.openai}`}
            ></span>
            Status: {state.apiStatus.openai}
          </div>
          <div className='help-text'>
            Get your API key from{' '}
            <a
              href='https://platform.openai.com/api-keys'
              target='_blank'
              rel='noopener noreferrer'
            >
              OpenAI Platform
            </a>
          </div>
        </div>

        <div className='form-group'>
          <label>OpenAI Model</label>
          <select
            value={state.apiConfig.openai?.model || DEFAULT_MODELS.openai}
            onChange={(e) => updateApiConfig('openai', 'model', e.target.value)}
            aria-label='OpenAI Model'
          >
            <option value='gpt-3.5-turbo'>GPT-3.5 Turbo</option>
            <option value='gpt-4'>GPT-4</option>
            <option value='gpt-4-turbo-preview'>GPT-4 Turbo</option>
          </select>
        </div>

        <div className='form-group'>
          <label>Google Gemini API Key</label>
          <div className='input-with-button'>
            <input
              type='password'
              placeholder='AI...'
              value={state.apiConfig.gemini?.key || ''}
              onChange={(e) => updateApiConfig('gemini', 'key', e.target.value)}
            />
            <button
              className='button secondary'
              onClick={() => testApiKey('gemini')}
              disabled={!state.apiConfig.gemini?.key}
            >
              Test
            </button>
          </div>
          <div className='api-status'>
            <span
              className={`status-indicator ${state.apiStatus.gemini}`}
            ></span>
            Status: {state.apiStatus.gemini}
          </div>
          <div className='help-text'>
            Get your API key from{' '}
            <a
              href='https://makersuite.google.com/app/apikey'
              target='_blank'
              rel='noopener noreferrer'
            >
              Google AI Studio
            </a>
          </div>
        </div>

        <div className='form-group'>
          <label>Gemini Model</label>
          <select
            value={state.apiConfig.gemini?.model || DEFAULT_MODELS.gemini}
            onChange={(e) => updateApiConfig('gemini', 'model', e.target.value)}
            aria-label='Gemini Model'
          >
            <option value='gemini-2.5-pro'>Gemini 2.5 Pro</option>
            <option value='gemini-2.5-pro-flash'>Gemini 2.5 Flash</option>
            <option value='gemini-2.5-flash-lite'>Gemini 2.5 Flash Lite</option>
            <option value='gemini-2.0-flash'>Gemini 2.0 Flash</option>
            <option value='gemini-2.0-flash-lite'>Gemini 2.0 Flash Lite</option>
          </select>
        </div>
      </div>

      <div className='section'>
        <h2>⚙️ Generation Rules</h2>

        <div className='form-group'>
          <label>Title Format</label>
          <select
            value={state.generationRules.titleFormat}
            onChange={(e) =>
              updateGenerationRules('titleFormat', e.target.value)
            }
            aria-label='Title Format'
          >
            <option value='conventional'>
              Conventional Commits (type(scope): description)
            </option>
            <option value='descriptive'>
              Descriptive (Clear, readable format)
            </option>
            <option value='custom'>Custom Template</option>
          </select>
        </div>

        {state.generationRules.titleFormat === 'custom' && (
          <div className='form-group'>
            <label>Custom Title Template</label>
            <input
              type='text'
              placeholder='e.g., [TYPE] Brief description'
              value={state.generationRules.customTitleTemplate || ''}
              onChange={(e) =>
                updateGenerationRules('customTitleTemplate', e.target.value)
              }
            />
          </div>
        )}

        <div className='form-group'>
          <label>Maximum Description Length</label>
          <input
            type='number'
            min='500'
            max='5000'
            value={state.generationRules.maxDescriptionLength}
            onChange={(e) =>
              updateGenerationRules(
                'maxDescriptionLength',
                parseInt(e.target.value),
              )
            }
            aria-label='Maximum description length'
          />
          <div className='help-text'>Characters (500-5000)</div>
        </div>

        <div className='form-group'>
          <label>Include in Analysis</label>
          <div className='checkbox-group'>
            <div className='checkbox-item'>
              <input
                type='checkbox'
                checked={state.generationRules.includeFileChanges}
                onChange={(e) =>
                  updateGenerationRules('includeFileChanges', e.target.checked)
                }
                aria-label='Include file changes and diff statistics'
              />
              <span>File changes and diff statistics</span>
            </div>
            <div className='checkbox-item'>
              <input
                type='checkbox'
                checked={state.generationRules.includeCommitMessages}
                onChange={(e) =>
                  updateGenerationRules(
                    'includeCommitMessages',
                    e.target.checked,
                  )
                }
                aria-label='Include commit messages'
              />
              <span>Commit messages</span>
            </div>
          </div>
        </div>

        <div className='form-group'>
          <label>Description Sections</label>
          <div className='checkbox-group'>
            <div className='checkbox-item'>
              <input
                type='checkbox'
                checked={state.generationRules.descriptionSections.summary}
                onChange={(e) =>
                  updateDescriptionSection('summary', e.target.checked)
                }
                aria-label='Include summary section'
              />
              <span>Summary</span>
            </div>
            <div className='checkbox-item'>
              <input
                type='checkbox'
                checked={state.generationRules.descriptionSections.changes}
                onChange={(e) =>
                  updateDescriptionSection('changes', e.target.checked)
                }
                aria-label='Include changes section'
              />
              <span>Changes Made</span>
            </div>
            <div className='checkbox-item'>
              <input
                type='checkbox'
                checked={state.generationRules.descriptionSections.testing}
                onChange={(e) =>
                  updateDescriptionSection('testing', e.target.checked)
                }
                aria-label='Include testing section'
              />
              <span>Testing Instructions</span>
            </div>
            <div className='checkbox-item'>
              <input
                type='checkbox'
                checked={state.generationRules.descriptionSections.breaking}
                onChange={(e) =>
                  updateDescriptionSection('breaking', e.target.checked)
                }
                aria-label='Include breaking changes section'
              />
              <span>Breaking Changes</span>
            </div>
          </div>
        </div>
      </div>

      <div className='actions'>
        <button
          className='button primary'
          onClick={saveSettings}
          disabled={state.saving}
        >
          {state.saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

// Mount the app
const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(<OptionsApp />);
