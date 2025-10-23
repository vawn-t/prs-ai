import { AIService } from '@shared/ai-service';
import { StorageService } from '@shared/storage';
import {
  PRData,
  CodeChange,
  ApiConfig,
  PRGenerationRules,
} from '@shared/types';
import {
  createIconElement,
  PlatformDetector,
  GitHubExtractor,
  GitLabExtractor,
} from '@utils';

class UniversalPRGenerator {
  private isInitialized = false;
  private generateButton: HTMLElement | null = null;
  private apiConfig: ApiConfig | null = null;
  private generationRules: PRGenerationRules | null = null;
  public platform = PlatformDetector.detectPlatform();
  public config = PlatformDetector.getPlatformConfig(this.platform);
  public extractor =
    this.platform === 'github' ? new GitHubExtractor() : new GitLabExtractor();

  async init() {
    if (this.isInitialized) return;

    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
      return;
    }

    // Check if we're on a PR creation or edit page
    const isPRPage = this.isPRPage();

    if (!isPRPage) {
      return;
    }

    // Inject UI as soon as possible to show the button immediately,
    // then load config in the background and update state.
    await this.injectUI();
    this.loadConfig().then(() => this.updateGenerateButtonState());

    this.isInitialized = true;
  }

  private isPRPage(): boolean {
    return PlatformDetector.isPRPage(this.platform);
  }

  private async loadConfig() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getStorageData',
        keys: ['apiConfig', 'generationRules'],
      });

      if (response && response.success) {
        this.apiConfig = response.data.apiConfig;
        this.generationRules = response.data.generationRules;
      } else {
        console.error(
          'PRs-AI: Failed to load config - invalid response:',
          response,
        );
        this.apiConfig = null;
        this.generationRules = null;
      }
    } catch (error) {
      console.error('PRs-AI: Failed to load config:', error);
      this.apiConfig = null;
      this.generationRules = null;
    }
  }

  private async injectUI() {
    console.log('PRs-AI: Attempting to inject UI...');
    // Wait for the PR form elements to appear as GitHub lazily renders parts of the page
    const { titleInput, descriptionTextarea } = await this.waitForPRElements();
    if (!titleInput || !descriptionTextarea) {
      console.warn('PRs-AI: PR form elements not found after waiting.');
      return;
    }

    console.log('PRs-AI: Creating generate button...');
    // Create and inject the generate button
    this.createGenerateButton(titleInput, descriptionTextarea);
  }

  private waitForPRElements(): Promise<{
    titleInput: HTMLInputElement | null;
    descriptionTextarea: HTMLTextAreaElement | null;
  }> {
    return this.extractor.waitForElements();
  }

  private createGenerateButton(
    titleInput: HTMLInputElement,
    descriptionTextarea: HTMLTextAreaElement,
  ) {
    console.log('PRs-AI: Creating generate button...', {
      platform: this.platform,
    });

    // Remove existing button if any
    if (this.generateButton) {
      this.generateButton.remove();
    }

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'prs-ai-container';
    buttonContainer.innerHTML = `
      <div class="prs-ai-button-group">
        <button type="button" class="prs-ai-generate-btn" ${
          !this.hasValidConfig() ? 'disabled' : ''
        }>
          ${createIconElement('star', 16)}
          ${!this.hasValidConfig() ? 'Setup API Key' : 'Generate with AI'}
        </button>
        <button type="button" class="prs-ai-regenerate-btn" style="display: none;">
          ${createIconElement('refresh', 16)}
          Regenerate
        </button>
        <button type="button" class="prs-ai-settings-btn">
          ${createIconElement('settings', 16)}
          Settings
        </button>
      </div>
      <div class="prs-ai-status" style="display: none;"></div>
    `;

    // Platform-specific insertion strategies
    let inserted = false;

    if (this.platform === 'github') {
      inserted = this.insertButtonForGitHub(
        buttonContainer,
        descriptionTextarea,
      );
    } else if (this.platform === 'gitlab') {
      inserted = this.insertButtonForGitLab(
        buttonContainer,
        descriptionTextarea,
      );
    }
    if (!inserted) {
      const parent = descriptionTextarea.parentNode;
      if (parent) {
        console.log(
          'PRs-AI: Fallback - Inserting button after textarea parent',
        );
        parent.insertBefore(buttonContainer, descriptionTextarea.nextSibling);
        inserted = true;
      }
    }

    if (inserted) {
      console.log('PRs-AI: Button successfully inserted');
      this.generateButton = buttonContainer;
      this.setupEventListeners(titleInput, descriptionTextarea);
      // In case the config has finished loading already, reflect the state
      this.updateGenerateButtonState();
    } else {
      console.error('PRs-AI: Failed to insert button');
    }
  }

  private insertButtonForGitHub(
    buttonContainer: HTMLElement,
    descriptionTextarea: HTMLTextAreaElement,
  ): boolean {
    // Strategy 1: Insert after the tab-container that contains the description textarea
    const tabContainer = descriptionTextarea.closest('tab-container');
    if (tabContainer) {
      console.log('PRs-AI: Inserting button after tab-container');
      tabContainer.parentNode?.insertBefore(
        buttonContainer,
        tabContainer.nextSibling,
      );
      return true;
    }

    // Strategy 2: Insert after the CommentBox container
    const commentBox = descriptionTextarea.closest('.CommentBox-container');
    if (commentBox) {
      console.log('PRs-AI: Inserting button after CommentBox-container');
      commentBox.parentNode?.insertBefore(
        buttonContainer,
        commentBox.nextSibling,
      );
      return true;
    }

    // Strategy 3: Insert before the submit button area
    const submitButtonArea = document.querySelector(
      '.d-flex.flex-justify-end.flex-items-center.flex-wrap',
    );
    if (submitButtonArea) {
      console.log('PRs-AI: Inserting button before submit area');
      submitButtonArea.parentNode?.insertBefore(
        buttonContainer,
        submitButtonArea,
      );
      return true;
    }

    // Strategy 4: Find the form and insert before the submit buttons
    const form = descriptionTextarea.closest('form');
    const btnGroup = form?.querySelector('.BtnGroup, .btn-primary');
    if (btnGroup && btnGroup.parentNode) {
      console.log('PRs-AI: Inserting button before BtnGroup');
      btnGroup.parentNode.insertBefore(buttonContainer, btnGroup);
      return true;
    }

    return false;
  }

  private insertButtonForGitLab(
    buttonContainer: HTMLElement,
    descriptionTextarea: HTMLTextAreaElement,
  ): boolean {
    // Strategy 1: Insert after the markdown editor container
    const editorContainer = descriptionTextarea.closest(
      '.md-area, .js-md-write-button',
    );
    if (editorContainer) {
      console.log('PRs-AI: GitLab - Inserting button after editor container');
      editorContainer.parentNode?.insertBefore(
        buttonContainer,
        editorContainer.nextSibling,
      );
      return true;
    }

    // Strategy 2: Insert before GitLab's form actions
    const formActions = document.querySelector(
      '.form-actions, .mr-form-actions',
    );
    if (formActions) {
      console.log('PRs-AI: GitLab - Inserting button before form actions');
      formActions.parentNode?.insertBefore(buttonContainer, formActions);
      return true;
    }

    // Strategy 3: Insert after the description field container
    const fieldContainer = descriptionTextarea.closest('.form-group');
    if (fieldContainer) {
      console.log('PRs-AI: GitLab - Inserting button after field container');
      fieldContainer.parentNode?.insertBefore(
        buttonContainer,
        fieldContainer.nextSibling,
      );
      return true;
    }

    return false;
  }

  private setupEventListeners(
    titleInput: HTMLInputElement,
    descriptionTextarea: HTMLTextAreaElement,
  ) {
    if (!this.generateButton) return;

    const generateBtn = this.generateButton.querySelector(
      '.prs-ai-generate-btn',
    ) as HTMLButtonElement;
    const regenerateBtn = this.generateButton.querySelector(
      '.prs-ai-regenerate-btn',
    ) as HTMLButtonElement;
    const settingsBtn = this.generateButton.querySelector(
      '.prs-ai-settings-btn',
    ) as HTMLButtonElement;
    const statusDiv = this.generateButton.querySelector(
      '.prs-ai-status',
    ) as HTMLDivElement;

    generateBtn.addEventListener('click', async () => {
      if (!this.hasValidConfig()) {
        chrome.runtime.sendMessage({ action: 'openOptions' });
        return;
      }

      await this.generatePRContent(
        titleInput,
        descriptionTextarea,
        statusDiv,
        regenerateBtn,
      );
    });

    regenerateBtn.addEventListener('click', async () => {
      await this.generatePRContent(
        titleInput,
        descriptionTextarea,
        statusDiv,
        regenerateBtn,
      );
    });

    settingsBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openOptions' });
    });
  }

  private async generatePRContent(
    titleInput: HTMLInputElement,
    descriptionTextarea: HTMLTextAreaElement,
    statusDiv: HTMLDivElement,
    regenerateBtn: HTMLButtonElement,
  ) {
    console.log('PRs-AI: Starting PR content generation...', {
      apiConfig: this.apiConfig,
      generationRules: this.generationRules,
    });

    if (!this.apiConfig || !this.generationRules) {
      console.error('PRs-AI: Missing config:', {
        hasApiConfig: !!this.apiConfig,
        hasGenerationRules: !!this.generationRules,
      });
      this.showStatus(statusDiv, 'Please configure API keys first', 'error');
      return;
    }

    // Additional validation for API keys
    const hasValidKey =
      this.apiConfig.openai?.key || this.apiConfig.gemini?.key;
    if (!hasValidKey) {
      console.error('PRs-AI: No valid API keys found:', {
        openaiKey: this.apiConfig.openai?.key ? '***' : 'missing',
        geminiKey: this.apiConfig.gemini?.key ? '***' : 'missing',
      });
      this.showStatus(
        statusDiv,
        'Please configure valid API keys first',
        'error',
      );
      return;
    }

    try {
      this.showStatus(statusDiv, 'Generating PR content...', 'loading');

      // Extract PR data from the page
      const prData = await this.extractPRData();
      console.log('PRs-AI: Extracted PR data:', prData);

      // Check for existing template
      const existingTemplate =
        this.extractExistingTemplate(descriptionTextarea);
      console.log('PRs-AI: Existing template:', existingTemplate);

      // Generate content using AI
      console.log('PRs-AI: Calling AI service...');
      const result = await AIService.generatePRContent(
        prData,
        this.generationRules,
        this.apiConfig,
        existingTemplate,
      );
      console.log('PRs-AI: AI service result:', result);

      // Update the form fields
      titleInput.value = result.title;
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));

      descriptionTextarea.value = result.description;
      descriptionTextarea.dispatchEvent(new Event('input', { bubbles: true }));

      this.showStatus(
        statusDiv,
        'PR content generated successfully!',
        'success',
      );
      regenerateBtn.style.display = 'inline-flex';
    } catch (error) {
      console.error('PRs-AI: Generation error:', error);
      this.showStatus(
        statusDiv,
        `Failed to generate: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        'error',
      );
    }
  }

  private async extractPRData(): Promise<PRData> {
    return this.extractor.extractPRData();
  }

  private extractExistingTemplate(descriptionTextarea: HTMLTextAreaElement): {
    title?: string;
    description?: string;
  } {
    const existingContent = descriptionTextarea.value.trim();

    if (existingContent && existingContent.length > 0) {
      return { description: existingContent };
    }

    return {};
  }

  private hasValidConfig(): boolean {
    console.log('PRs-AI: Checking config validity:', {
      apiConfig: this.apiConfig,
      apiConfigType: typeof this.apiConfig,
      openaiConfig: this.apiConfig?.openai,
      geminiConfig: this.apiConfig?.gemini,
      openaiKey: this.apiConfig?.openai?.key,
      geminiKey: this.apiConfig?.gemini?.key,
    });

    const isValid = !!(
      this.apiConfig &&
      (this.apiConfig.openai?.key || this.apiConfig.gemini?.key)
    );

    console.log('PRs-AI: Config is valid:', isValid);
    return isValid;
  }

  private updateGenerateButtonState() {
    if (!this.generateButton) return;
    const generateBtn = this.generateButton.querySelector(
      '.prs-ai-generate-btn',
    ) as HTMLButtonElement | null;
    if (!generateBtn) return;

    const hasConfig = this.hasValidConfig();
    generateBtn.disabled = !hasConfig;
    const label = hasConfig ? 'Generate with AI' : 'Setup API Key';
    // Re-set innerHTML to update the label while keeping the icon
    generateBtn.innerHTML = `${createIconElement('star', 16)} ${label}`;
  }

  private showStatus(
    statusDiv: HTMLDivElement,
    message: string,
    type: 'success' | 'error' | 'loading',
  ) {
    statusDiv.textContent = message;
    statusDiv.className = `prs-ai-status prs-ai-status--${type}`;
    statusDiv.style.display = 'block';

    if (type !== 'loading') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }
}

// Initialize the PR generator
console.log('PRs-AI: Content script loaded');

// Prevent multiple initialization
if (!(window as any).__PRsAI_Initialized) {
  (window as any).__PRsAI_Initialized = true;

  const prGenerator = new UniversalPRGenerator();

  // Run initialization
  prGenerator.init();

  // Handle navigation changes (for SPA behavior) with more aggressive detection
  let lastUrl = location.href;
  const handleUrlChange = () => {
    const url = location.href;
    if (url !== lastUrl) {
      console.log('PRs-AI: URL changed from', lastUrl, 'to', url);
      lastUrl = url;
      // Reset initialization flag to allow re-initialization on new pages
      (prGenerator as any).isInitialized = false;
      // Wait a bit longer for GitLab's SPA to settle
      setTimeout(() => prGenerator.init(), 2000);
    }
  };

  // Use multiple detection methods for URL changes
  new MutationObserver(() => {
    handleUrlChange();
  }).observe(document, { subtree: true, childList: true });

  // Also listen for popstate events
  window.addEventListener('popstate', handleUrlChange);

  // Listen for GitLab/GitHub's custom navigation events if they exist
  document.addEventListener('pjax:end', handleUrlChange);
  document.addEventListener('turbo:load', handleUrlChange);

  // Add debugging function to global scope for testing
  (window as any).PRsAIDebug = {
    platform: prGenerator.platform,
    config: prGenerator.config,
    checkElements: () => {
      const elements = prGenerator.extractor.getFormElements();
      console.log('PRs-AI Debug: Form elements check:', {
        titleInput: elements.titleInput,
        descriptionTextarea: elements.descriptionTextarea,
        titleFound: !!elements.titleInput,
        descriptionFound: !!elements.descriptionTextarea,
      });
      return elements;
    },
    isPRPage: () => {
      const result = PlatformDetector.isPRPage(prGenerator.platform);
      console.log('PRs-AI Debug: isPRPage result:', result);
      return result;
    },
    forceInit: () => {
      console.log('PRs-AI Debug: Forcing initialization...');
      (prGenerator as any).isInitialized = false;
      prGenerator.init();
    },
    testSelectors: () => {
      const selectors = prGenerator.config.selectors;
      console.log('PRs-AI Debug: Testing selectors for', prGenerator.platform);
      Object.entries(selectors).forEach(([key, selector]) => {
        const element = document.querySelector(selector);
        console.log(`  ${key}: ${selector} -> ${!!element}`);
      });
    },
  };
}

export {};
