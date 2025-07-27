/**
 * GitHub Utilities
 */

import { GITHUB_URL_PATTERNS } from '@constants';
import { GitHubPageInfo } from '@types';

export const detectGitHubPage = (): GitHubPageInfo => {
  const url = window.location.href;
  const pathname = window.location.pathname;

  // Check for PR creation/edit pages
  if (
    url.includes('/compare/') ||
    url.includes('/pull/new') ||
    pathname.includes('/pull/new') ||
    pathname.endsWith('/compare')
  ) {
    return {
      isValid: true,
      pageType: 'pr-creation',
      repository: extractRepositoryInfo(),
      branches: extractBranchInfo(),
    };
  }

  if (
    (url.includes('/pull/') && url.includes('/edit')) ||
    (pathname.includes('/pull/') && pathname.includes('/edit'))
  ) {
    return {
      isValid: true,
      pageType: 'pr-edit',
      repository: extractRepositoryInfo(),
    };
  }

  if (pathname.match(GITHUB_URL_PATTERNS.PULL_VIEW)) {
    return {
      isValid: true,
      pageType: 'compare',
      repository: extractRepositoryInfo(),
    };
  }

  return {
    isValid: false,
    pageType: 'unknown',
  };
};

export const extractRepositoryInfo = () => {
  const pathParts = window.location.pathname.split('/');
  if (pathParts.length >= 3) {
    return {
      owner: pathParts[1],
      name: pathParts[2],
    };
  }
  return undefined;
};

export const extractBranchInfo = () => {
  const compareParts = window.location.pathname.match(
    /compare\/(.+?)\.\.\.(.+)/,
  );
  if (compareParts) {
    return {
      base: compareParts[1],
      head: compareParts[2],
    };
  }
  return {
    base: 'main',
    head: 'feature',
  };
};

export const extractFileChanges = () => {
  const changes: Array<{
    filename: string;
    additions: number;
    deletions: number;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
  }> = [];

  const fileElements = document.querySelectorAll(
    '[data-tagsearch-path], .file-header[data-path]',
  );

  fileElements.forEach((element) => {
    const filename =
      element.getAttribute('data-tagsearch-path') ||
      element.getAttribute('data-path') ||
      '';

    if (!filename) return;

    const statsElement = element.querySelector('.diffstat');
    const additions = parseInt(
      statsElement?.getAttribute('data-additions') || '0',
    );
    const deletions = parseInt(
      statsElement?.getAttribute('data-deletions') || '0',
    );

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
};

export const extractCommitMessages = (): string[] => {
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
};
