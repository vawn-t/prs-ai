import { PRData, CodeChange } from '@shared/types';
import { GITHUB_SELECTORS } from '@constants';

export class GitHubExtractor {
  extractPRData(): PRData {
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

  extractFileChanges(): CodeChange[] {
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

  extractCommitMessages(): string[] {
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

  getFormElements(): {
    titleInput: HTMLInputElement | null;
    descriptionTextarea: HTMLTextAreaElement | null;
  } {
    return {
      titleInput: document.querySelector(
        GITHUB_SELECTORS.TITLE_INPUT,
      ) as HTMLInputElement | null,
      descriptionTextarea: document.querySelector(
        GITHUB_SELECTORS.DESCRIPTION_TEXTAREA,
      ) as HTMLTextAreaElement | null,
    };
  }

  waitForElements(): Promise<{
    titleInput: HTMLInputElement | null;
    descriptionTextarea: HTMLTextAreaElement | null;
  }> {
    const findNow = () => this.getFormElements();

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
}
