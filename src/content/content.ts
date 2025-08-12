import { AIService } from '@shared/ai-service';
import { StorageService } from '@shared/storage';
import {
	PRData,
	CodeChange,
	ApiConfig,
	PRGenerationRules
} from '@shared/types';
import { createIconElement } from '@utils';

class GitHubPRGenerator {
	private isInitialized = false;
	private generateButton: HTMLElement | null = null;
	private apiConfig: ApiConfig | null = null;
	private generationRules: PRGenerationRules | null = null;

	async init() {
		console.log('PRs-AI: Initializing...', {
			isInitialized: this.isInitialized,
			readyState: document.readyState,
			url: window.location.href
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

		// Inject UI as soon as possible to show the button immediately,
		// then load config in the background and update state.
		console.log('PRs-AI: Injecting UI...');
		await this.injectUI();

		console.log('PRs-AI: Loading config in background...');
		this.loadConfig().then(() => this.updateGenerateButtonState());

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
				keys: ['apiConfig', 'generationRules']
			});

			console.log('PRs-AI: Received response from background:', response);

			if (response && response.success) {
				this.apiConfig = response.data.apiConfig;
				this.generationRules = response.data.generationRules;

				console.log('PRs-AI: Loaded config:', {
					apiConfig: this.apiConfig,
					generationRules: this.generationRules,
					hasOpenaiKey: !!this.apiConfig?.openai?.key,
					hasGeminiKey: !!this.apiConfig?.gemini?.key
				});
			} else {
				console.error(
					'PRs-AI: Failed to load config - invalid response:',
					response
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
		const titleSelector =
			'#pull_request_title, input[name="pull_request[title]"]';
		const bodySelector =
			'#pull_request_body, textarea[name="pull_request[body]"]';

		const findNow = () => ({
			titleInput: document.querySelector(
				titleSelector
			) as HTMLInputElement | null,
			descriptionTextarea: document.querySelector(
				bodySelector
			) as HTMLTextAreaElement | null
		});

		const initial = findNow();
		if (initial.titleInput && initial.descriptionTextarea) {
			return Promise.resolve(initial);
		}

		return new Promise((resolve) => {
			const timeout = setTimeout(() => {
				observer.disconnect();
				resolve(findNow());
			}, 10000); // 10s safety timeout

			const observer = new MutationObserver(() => {
				const current = findNow();
				if (current.titleInput && current.descriptionTextarea) {
					clearTimeout(timeout);
					observer.disconnect();
					resolve(current);
				}
			});

			observer.observe(document.body, { childList: true, subtree: true });
		});
	}

	private createGenerateButton(
		titleInput: HTMLInputElement,
		descriptionTextarea: HTMLTextAreaElement
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

		// Strategy 1: Insert after the description area (preferred location)
		let inserted = false;

		// Look for the tab-container that contains the description textarea
		const tabContainer = descriptionTextarea.closest('tab-container');
		if (tabContainer && !inserted) {
			console.log('PRs-AI: Inserting button after tab-container');
			tabContainer.parentNode?.insertBefore(
				buttonContainer,
				tabContainer.nextSibling
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
					commentBox.nextSibling
				);
				inserted = true;
			}
		}

		// Strategy 3: Insert before the submit button area
		if (!inserted) {
			const submitButtonArea = document.querySelector(
				'.d-flex.flex-justify-end.flex-items-center.flex-wrap'
			);
			if (submitButtonArea) {
				console.log('PRs-AI: Inserting button before submit area');
				submitButtonArea.parentNode?.insertBefore(
					buttonContainer,
					submitButtonArea
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
					'PRs-AI: Fallback - Inserting button after textarea parent'
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

	private setupEventListeners(
		titleInput: HTMLInputElement,
		descriptionTextarea: HTMLTextAreaElement
	) {
		if (!this.generateButton) return;

		const generateBtn = this.generateButton.querySelector(
			'.prs-ai-generate-btn'
		) as HTMLButtonElement;
		const regenerateBtn = this.generateButton.querySelector(
			'.prs-ai-regenerate-btn'
		) as HTMLButtonElement;
		const settingsBtn = this.generateButton.querySelector(
			'.prs-ai-settings-btn'
		) as HTMLButtonElement;
		const statusDiv = this.generateButton.querySelector(
			'.prs-ai-status'
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
				regenerateBtn
			);
		});

		regenerateBtn.addEventListener('click', async () => {
			await this.generatePRContent(
				titleInput,
				descriptionTextarea,
				statusDiv,
				regenerateBtn
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
		regenerateBtn: HTMLButtonElement
	) {
		console.log('PRs-AI: Starting PR content generation...', {
			apiConfig: this.apiConfig,
			generationRules: this.generationRules
		});

		if (!this.apiConfig || !this.generationRules) {
			console.error('PRs-AI: Missing config:', {
				hasApiConfig: !!this.apiConfig,
				hasGenerationRules: !!this.generationRules
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
				geminiKey: this.apiConfig.gemini?.key ? '***' : 'missing'
			});
			this.showStatus(
				statusDiv,
				'Please configure valid API keys first',
				'error'
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
				existingTemplate
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
				'success'
			);
			regenerateBtn.style.display = 'inline-flex';
		} catch (error) {
			console.error('PRs-AI: Generation error:', error);
			this.showStatus(
				statusDiv,
				`Failed to generate: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
				'error'
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
			/compare\/(.+?)\.\.\.(.+)/
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
			headBranch
		};
	}

	private extractFileChanges(): CodeChange[] {
		const changes: CodeChange[] = [];

		// Look for file change elements in GitHub's UI
		const fileElements = document.querySelectorAll(
			'[data-tagsearch-path], .file-header[data-path]'
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
				statsElement?.getAttribute('data-additions') || '0'
			);
			const deletions = parseInt(
				statsElement?.getAttribute('data-deletions') || '0'
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
				status
			});
		});

		return changes;
	}

	private extractCommitMessages(): string[] {
		const commitElements = document.querySelectorAll(
			'.commit-message, .commit-title'
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
			geminiKey: this.apiConfig?.gemini?.key
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
			'.prs-ai-generate-btn'
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
		type: 'success' | 'error' | 'loading'
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
