import React from 'react';
import { createRoot } from 'react-dom/client';
import { AIService } from '@shared/ai-service';
import { StorageService } from '@shared/storage';
import { ApiConfig } from '@shared/types';
import { DEFAULT_MODELS } from '@constants';

interface PopupState {
  loading: boolean;
  apiConfig: ApiConfig | null;
  apiStatus: {
    openai: 'connected' | 'disconnected' | 'unknown';
    gemini: 'connected' | 'disconnected' | 'unknown';
  };
}

class PopupApp extends React.Component<{}, PopupState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      loading: true,
      apiConfig: null,
      apiStatus: {
        openai: 'unknown',
        gemini: 'unknown',
      },
    };
  }

  async componentDidMount() {
    await this.loadConfig();
    this.setState({ loading: false });
  }

  private async loadConfig() {
    try {
      const apiConfig = await StorageService.getApiConfig();
      this.setState({ apiConfig });

      if (apiConfig) {
        await this.checkApiStatus(apiConfig);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  private async checkApiStatus(apiConfig: ApiConfig) {
    const status = { ...this.state.apiStatus };

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

    this.setState({ apiStatus: status });
  }

  private openOptions = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    window.close();
  };

  private testApis = async () => {
    if (!this.state.apiConfig) return;

    this.setState({ loading: true });
    await this.checkApiStatus(this.state.apiConfig);
    this.setState({ loading: false });
  };

  render() {
    const { loading, apiConfig, apiStatus } = this.state;

    return (
      <div className={loading ? 'loading' : ''}>
        <div className='header'>
          <div className='logo'>AI</div>
          <div className='title'>PRs-AI</div>
        </div>

        <div className='status-section'>
          <div className='section-title'>API Status</div>

          <div className='status-item'>
            <span>
              <span className={`status-indicator ${apiStatus.openai}`}></span>
              OpenAI
            </span>
            <span>{apiConfig?.openai?.model || DEFAULT_MODELS.openai}</span>
          </div>

          <div className='status-item'>
            <span>
              <span className={`status-indicator ${apiStatus.gemini}`}></span>
              Gemini
            </span>
            <span>{apiConfig?.gemini?.model || DEFAULT_MODELS.gemini}</span>
          </div>
        </div>

        <div className='quick-actions'>
          <button className='button primary' onClick={this.openOptions}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z' />
            </svg>
            Open Settings
          </button>

          <button className='button' onClick={this.testApis} disabled={loading}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
            </svg>
            Test API Keys
          </button>
        </div>
      </div>
    );
  }
}

// Mount the app
const container = document.getElementById('root');
if (!container) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(<PopupApp />);
