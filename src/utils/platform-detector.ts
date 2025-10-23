import {
  GITHUB_URL_PATTERNS,
  GITLAB_URL_PATTERNS,
  GITHUB_SELECTORS,
  GITLAB_SELECTORS,
} from '@constants';

export type Platform = 'github' | 'gitlab';

export interface PlatformConfig {
  platform: Platform;
  urlPatterns: Record<string, RegExp>;
  selectors: Record<string, string>;
}

export class PlatformDetector {
  static detectPlatform(): Platform {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    if (hostname === 'github.com') {
      return 'github';
    }

    // Detect GitLab by hostname patterns and URL structure
    if (
      hostname === 'gitlab.com' ||
      hostname.includes('gitlab') ||
      pathname.includes('/-/merge_requests/') ||
      pathname.includes('/-/compare/')
    ) {
      return 'gitlab';
    }

    // Default to GitHub for unknown platforms
    return 'github';
  }

  static getPlatformConfig(platform: Platform): PlatformConfig {
    switch (platform) {
      case 'github':
        return {
          platform: 'github',
          urlPatterns: GITHUB_URL_PATTERNS,
          selectors: GITHUB_SELECTORS,
        };
      case 'gitlab':
        return {
          platform: 'gitlab',
          urlPatterns: GITLAB_URL_PATTERNS,
          selectors: GITLAB_SELECTORS,
        };
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  static isPRPage(platform: Platform): boolean {
    const config = this.getPlatformConfig(platform);
    const url = window.location.href;
    const pathname = window.location.pathname;

    if (platform === 'github') {
      return (
        config.urlPatterns.COMPARE.test(url) ||
        config.urlPatterns.PULL_NEW.test(url) ||
        config.urlPatterns.PULL_EDIT.test(url) ||
        config.urlPatterns.PULL_VIEW.test(pathname) ||
        url.includes('/compare/') ||
        url.includes('/pull/new') ||
        pathname.includes('/pull/new') ||
        (url.includes('/pull/') && url.includes('/edit')) ||
        (pathname.includes('/pull/') && pathname.includes('/edit')) ||
        pathname.endsWith('/compare')
      );
    }

    if (platform === 'gitlab') {
      return (
        config.urlPatterns.MERGE_REQUEST_NEW.test(pathname) ||
        config.urlPatterns.MERGE_REQUEST_EDIT.test(pathname) ||
        config.urlPatterns.MERGE_REQUEST_VIEW.test(pathname) ||
        config.urlPatterns.COMPARE.test(pathname) ||
        pathname.includes('/-/merge_requests/') ||
        pathname.includes('/-/compare/')
      );
    }

    return false;
  }
}
