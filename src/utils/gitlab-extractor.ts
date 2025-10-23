import { PRData, CodeChange } from '@shared/types';
import { GITLAB_SELECTORS } from '@constants';

export class GitLabExtractor {
  extractPRData(): PRData {
    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter((p) => p && p !== '-');

    return {
      title: '',
      description: '',
      baseBranch: 'main',
      headBranch: 'feature',
      changes: this.extractFileChanges(),
      commitMessages: this.extractCommitMessages(),
    };
  }

  extractFileChanges(): CodeChange[] {
    const changes: CodeChange[] = [];

    const fileHeaders = document.querySelectorAll(
      '.file-header, .diff-file .file-title',
    );

    fileHeaders.forEach((header) => {
      const filePathElement = header.querySelector(
        '[data-file-path], .file-title-name',
      );
      const filename = filePathElement?.textContent?.trim() || '';

      if (filename) {
        changes.push({
          filename,
          status: 'modified',
          additions: 0,
          deletions: 0,
        });
      }
    });

    return changes;
  }

  extractCommitMessages(): string[] {
    const messages: string[] = [];
    const commitElements = document.querySelectorAll(
      '.commit-title, .commit-row-message',
    );

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
        GITLAB_SELECTORS.TITLE_INPUT,
      ) as HTMLInputElement | null,
      descriptionTextarea: document.querySelector(
        GITLAB_SELECTORS.DESCRIPTION_TEXTAREA,
      ) as HTMLTextAreaElement | null,
    };
  }

  waitForElements(): Promise<{
    titleInput: HTMLInputElement | null;
    descriptionTextarea: HTMLTextAreaElement | null;
  }> {
    const findNow = () => {
      const elements = this.getFormElements();
      return elements;
    };

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
