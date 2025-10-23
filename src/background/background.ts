import { StorageService } from '../shared/storage';

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open options page for initial setup
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
});

// Handle browser action click (extension icon click)
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id && tab.url) {
    const url = new URL(tab.url);
    if (isGitLabInstance(url) && isGitLabMRPage(url)) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });

        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css'],
        });
      } catch (error) {
        console.error('PRs-AI Background: Manual injection failed:', error);
      }
    } else {
      // Open popup for non-GitLab pages
      chrome.action.setPopup({ popup: 'popup.html' });
    }
  }
});

// Listen for tab updates to inject content script on custom GitLab instances
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when tab loading is complete and we have a URL
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);

      // Check if this is a GitLab instance that we should inject into
      const isGitLab = isGitLabInstance(url);
      const isMRPage = isGitLabMRPage(url);

      if (isGitLab && isMRPage) {
        // Check if content script is already injected
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () =>
              typeof (window as any).__PRsAI_Initialized !== 'undefined',
          });

          if (results[0]?.result) {
            return; // Already injected
          }
        } catch (e) {
          // Proceed with injection if we can't check
        }

        // Inject the content script
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js'],
        });

        // Inject the CSS
        await chrome.scripting.insertCSS({
          target: { tabId },
          files: ['content.css'],
        });
      }
    } catch (error) {
      console.error(
        'PRs-AI Background: Failed to process tab or inject:',
        error,
      );
    }
  }
});

function isGitLabInstance(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  const pathname = url.pathname;

  return (
    hostname === 'gitlab.com' ||
    hostname.includes('gitlab') ||
    pathname.includes('/-/merge_requests/') ||
    pathname.includes('/-/compare/')
  );
}

function isGitLabMRPage(url: URL): boolean {
  const pathname = url.pathname;

  return (
    pathname.includes('/-/merge_requests/new') ||
    (pathname.includes('/-/merge_requests/') && pathname.includes('/edit')) ||
    pathname.includes('/-/merge_requests/') ||
    pathname.includes('/-/compare/')
  );
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStorageData') {
    handleGetStorageData(request.keys).then(sendResponse);
    return true; // Indicates async response
  }

  if (request.action === 'setStorageData') {
    handleSetStorageData(request.data).then(sendResponse);
    return true;
  }

  if (request.action === 'openOptions') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    sendResponse({ success: true });
    return true;
  }

  // Add manual injection handler
  if (request.action === 'injectContentScript') {
    injectIntoActiveTab().then(sendResponse);
    return true;
  }
});

// Function to inject into active tab
async function injectIntoActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id && tab.url) {
      const url = new URL(tab.url);

      if (isGitLabInstance(url) && isGitLabMRPage(url)) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });

        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css'],
        });

        return { success: true, message: 'Content script injected' };
      } else {
        return { success: false, message: 'Not a GitLab MR page' };
      }
    }
    return { success: false, message: 'No active tab found' };
  } catch (error) {
    console.error('PRs-AI Background: Injection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleGetStorageData(keys: string[]) {
  try {
    const data: any = {};

    for (const key of keys) {
      switch (key) {
        case 'apiConfig':
          data.apiConfig = await StorageService.getApiConfig();
          break;
        case 'generationRules':
          data.generationRules = await StorageService.getGenerationRules();
          break;
        case 'onboardingCompleted':
          data.onboardingCompleted =
            await StorageService.isOnboardingCompleted();
          break;
      }
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function handleSetStorageData(data: any) {
  try {
    if (data.apiConfig) {
      await StorageService.setApiConfig(data.apiConfig);
    }

    if (data.generationRules) {
      await StorageService.setGenerationRules(data.generationRules);
    }

    if (typeof data.onboardingCompleted === 'boolean') {
      await StorageService.setOnboardingCompleted(data.onboardingCompleted);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  // Extension started
});

export {};
