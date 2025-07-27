/**
 * HTTP Client Service for API calls
 */

export interface HttpOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

class HttpClient {
  private defaultTimeout = 30000; // 30 seconds

  private async request<T>(
    url: string,
    options: RequestInit & HttpOptions = {},
  ): Promise<HttpResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      signal,
      headers = {},
      ...fetchOptions
    } = options;

    // Create abort controller for timeout if no signal provided
    const controller = new AbortController();
    const finalSignal = signal || controller.signal;

    const timeoutId = setTimeout(() => {
      if (!signal) controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: finalSignal,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      clearTimeout(timeoutId);

      let data: T;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`,
        );
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(
    url: string,
    options: HttpOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(
    url: string,
    data?: any,
    options: HttpOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    url: string,
    data?: any,
    options: HttpOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    url: string,
    data?: any,
    options: HttpOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    url: string,
    options: HttpOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
