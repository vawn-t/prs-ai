/**
 * Chrome Runtime Service
 */

import { ChromeMessage, ChromeResponse } from '@types';

class ChromeRuntimeService {
  async sendMessage<T = any>(
    message: ChromeMessage,
  ): Promise<ChromeResponse<T>> {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response as ChromeResponse<T>;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStorageData<T = any>(keys: string[]): Promise<ChromeResponse<T>> {
    return this.sendMessage<T>({
      action: 'getStorageData',
      keys,
    });
  }

  async setStorageData<T = any>(data: T): Promise<ChromeResponse<void>> {
    return this.sendMessage<void>({
      action: 'setStorageData',
      data,
    });
  }

  async openOptionsPage(): Promise<ChromeResponse<void>> {
    return this.sendMessage<void>({
      action: 'openOptions',
    });
  }

  createTab(url: string): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url }, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(tab);
        }
      });
    });
  }

  getExtensionUrl(path: string): string {
    return chrome.runtime.getURL(path);
  }
}

export const chromeRuntimeService = new ChromeRuntimeService();
