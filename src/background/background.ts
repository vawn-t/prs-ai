import { StorageService } from '../shared/storage';

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open options page for initial setup
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
});

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
});

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
  console.log('PRs-AI extension started');
});

export {};
