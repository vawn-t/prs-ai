import { AIService } from '@shared/ai-service';
import { StorageService } from '@shared/storage';
import {
  PRData,
  CodeChange,
  ApiConfig,
  PRGenerationRules,
} from '@shared/types';

class GitHubPRGenerator {
  private isInitialized = false;
  private generateButton: HTMLElement | null = null;
  private apiConfig: ApiConfig | null = null;
  private generationRules: PRGenerationRules | null = null;

  async init() {
    console.log('PRs-AI: Initializing...', {
      isInitialized: this.isInitialized,
      readyState: document.readyState,
      url: window.location.href,
    });

    if (this.isInitialized) return;

    // Wait for page to load
    if (document.readyState === 'loading') {
      console.log('PRs-AI: Waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', () => this.init());
      return;
    }

    // Check if we're on a PR creation or edit page
    if (!this.isPRPage()) {
      console.log('PRs-AI: Not a PR page, skipping initialization');
      return;
    }

    console.log('PRs-AI: Loading config...');
    await this.loadConfig();

    console.log('PRs-AI: Injecting UI...');
    await this.injectUI();

    this.isInitialized = true;
    console.log('PRs-AI: Initialization complete');
  }

  private isPRPage(): boolean {
    const url = window.location.href;
    const pathname = window.location.pathname;

    // More comprehensive GitHub PR page detection
    const isPRPage =
      url.includes('/compare/') ||
      url.includes('/pull/new') ||
      pathname.includes('/pull/new') ||
      (url.includes('/pull/') && url.includes('/edit')) ||
      (pathname.includes('/pull/') && pathname.includes('/edit')) ||
      // Also handle GitHub's new PR creation flow
      pathname.endsWith('/compare') ||
      !!pathname.match(/\/pull\/\d+$/); // PR view page

    console.log('PRs-AI: isPRPage check:', { url, pathname, isPRPage });
    return isPRPage;
  }

  private async loadConfig() {
    try {
      console.log('PRs-AI: Requesting config from background...');
      const response = await chrome.runtime.sendMessage({
        action: 'getStorageData',
        keys: ['apiConfig', 'generationRules'],
      });

      console.log('PRs-AI: Received response from background:', response);

      if (response && response.success) {
        this.apiConfig = response.data.apiConfig;
        this.generationRules = response.data.generationRules;

        console.log('PRs-AI: Loaded config:', {
          apiConfig: this.apiConfig,
          generationRules: this.generationRules,
          hasOpenaiKey: !!this.apiConfig?.openai?.key,
          hasGeminiKey: !!this.apiConfig?.gemini?.key,
        });
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

    // Use the exact selectors from the real GitHub PR form
    const titleInput = document.querySelector(
      '#pull_request_title, input[name="pull_request[title]"]',
    ) as HTMLInputElement;

    const descriptionTextarea = document.querySelector(
      '#pull_request_body, textarea[name="pull_request[body]"]',
    ) as HTMLTextAreaElement;

    console.log('PRs-AI: Found elements:', {
      titleInput: !!titleInput,
      descriptionTextarea: !!descriptionTextarea,
      titleInputId: titleInput?.id,
      textareaId: descriptionTextarea?.id,
    });

    if (!titleInput || !descriptionTextarea) {
      console.log('PRs-AI: Elements not found, retrying in 1 second...');
      // Retry after a short delay
      setTimeout(() => this.injectUI(), 1000);
      return;
    }

    console.log('PRs-AI: Creating generate button...');
    // Create and inject the generate button
    this.createGenerateButton(titleInput, descriptionTextarea);
  }

  private createGenerateButton(
    titleInput: HTMLInputElement,
    descriptionTextarea: HTMLTextAreaElement,
  ) {
    console.log('PRs-AI: Creating generate button...');

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ${!this.hasValidConfig() ? 'Setup API Key' : 'Generate with AI'}
        </button>
        <button type="button" class="prs-ai-regenerate-btn" style="display: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Regenerate
        </button>
        <button type="button" class="prs-ai-settings-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
          Settings
        </button>
      </div>
      <div class="prs-ai-status" style="display: none;"></div>
    `;

    // Strategy 1: Insert after the description area (preferred location)
    let inserted = false;

    // Look for the tab-container that contains the description textarea
    const tabContainer = descriptionTextarea.closest('tab-container');
    if (tabContainer && !inserted) {
      console.log('PRs-AI: Inserting button after tab-container');
      tabContainer.parentNode?.insertBefore(
        buttonContainer,
        tabContainer.nextSibling,
      );
      inserted = true;
    }

    // Strategy 2: Insert after the CommentBox container
    if (!inserted) {
      const commentBox = descriptionTextarea.closest('.CommentBox-container');
      if (commentBox) {
        console.log('PRs-AI: Inserting button after CommentBox-container');
        commentBox.parentNode?.insertBefore(
          buttonContainer,
          commentBox.nextSibling,
        );
        inserted = true;
      }
    }

    // Strategy 3: Insert before the submit button area
    if (!inserted) {
      const submitButtonArea = document.querySelector(
        '.d-flex.flex-justify-end.flex-items-center.flex-wrap',
      );
      if (submitButtonArea) {
        console.log('PRs-AI: Inserting button before submit area');
        submitButtonArea.parentNode?.insertBefore(
          buttonContainer,
          submitButtonArea,
        );
        inserted = true;
      }
    }

    // Strategy 4: Find the form and insert before the submit buttons
    if (!inserted) {
      const form = descriptionTextarea.closest('form');
      const btnGroup = form?.querySelector('.BtnGroup, .btn-primary');
      if (btnGroup && btnGroup.parentNode) {
        console.log('PRs-AI: Inserting button before BtnGroup');
        btnGroup.parentNode.insertBefore(buttonContainer, btnGroup);
        inserted = true;
      }
    }

    // Strategy 5: Fallback - insert after textarea parent
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
    } else {
      console.error('PRs-AI: Failed to insert button');
    }
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
    // Get repository info from URL
    const urlParts = window.location.pathname.split('/');
    const owner = urlParts[1];
    const repo = urlParts[2];

    // Extract branch information
    const compareParts = window.location.pathname.match(
      /compare\/(.+?)\.\.\.(.+)/,
    );
    const baseBranch = compareParts ? compareParts[1] : 'main';
    const headBranch = compareParts ? compareParts[2] : 'feature';

    // Extract file changes from the compare view
    const changes = this.extractFileChanges();

    // Extract commit messages
    const commitMessages = this.extractCommitMessages();

    return {
      title: '',
      description: '',
      changes,
      commitMessages,
      baseBranch,
      headBranch,
    };
  }

  private extractFileChanges(): CodeChange[] {
    const changes: CodeChange[] = [];

    // Look for file change elements in GitHub's UI
    const fileElements = document.querySelectorAll(
      '[data-tagsearch-path], .file-header[data-path]',
    );

    fileElements.forEach((element) => {
      const filename =
        element.getAttribute('data-tagsearch-path') ||
        element.getAttribute('data-path') ||
        '';

      if (!filename) return;

      // Extract addition/deletion counts
      const statsElement = element.querySelector('.diffstat');
      const additions = parseInt(
        statsElement?.getAttribute('data-additions') || '0',
      );
      const deletions = parseInt(
        statsElement?.getAttribute('data-deletions') || '0',
      );

      // Determine file status
      let status: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
      if (element.classList.contains('file-added')) status = 'added';
      else if (element.classList.contains('file-deleted')) status = 'deleted';
      else if (element.classList.contains('file-renamed')) status = 'renamed';

      changes.push({
        filename,
        additions,
        deletions,
        status,
      });
    });

    return changes;
  }

  private extractCommitMessages(): string[] {
    const commitElements = document.querySelectorAll(
      '.commit-message, .commit-title',
    );
    const messages: string[] = [];

    commitElements.forEach((element) => {
      const message = element.textContent?.trim();
      if (message && !messages.includes(message)) {
        messages.push(message);
      }
    });

    return messages;
  }

  private extractExistingTemplate(descriptionTextarea: HTMLTextAreaElement): {
    title?: string;
    description?: string;
  } {
    const existingContent = descriptionTextarea.value.trim();

    if (existingContent && existingContent.length > 10) {
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
const prGenerator = new GitHubPRGenerator();

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
    // Wait a bit longer for GitHub's SPA to settle
    setTimeout(() => prGenerator.init(), 2000);
  }
};

// Use multiple detection methods for URL changes
new MutationObserver(() => {
  handleUrlChange();
}).observe(document, { subtree: true, childList: true });

// Also listen for popstate events
window.addEventListener('popstate', handleUrlChange);

// Listen for GitHub's custom navigation events if they exist
document.addEventListener('pjax:end', handleUrlChange);
document.addEventListener('turbo:load', handleUrlChange);

export {};
