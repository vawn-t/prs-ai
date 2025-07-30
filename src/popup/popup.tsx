import { createRoot } from 'react-dom/client';

import { AIService } from '@shared/ai-service';
import { StorageService } from '@shared/storage';
import { ApiConfig } from '@shared/types';
import { DEFAULT_MODELS } from '@constants';
import { Component } from 'react';
import { SettingsIcon, CheckIcon } from '../components/icons';

interface PopupState {
  loading: boolean;
  apiConfig: ApiConfig | null;
  apiStatus: {
    openai: 'connected' | 'disconnected' | 'unknown';
    gemini: 'connected' | 'disconnected' | 'unknown';
  };
}

class PopupApp extends Component<{}, PopupState> {
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
            <SettingsIcon size={16} />
            Open Settings
          </button>

          <button className='button' onClick={this.testApis} disabled={loading}>
            <CheckIcon size={16} />
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
