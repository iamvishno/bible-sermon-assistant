/**
 * AI Service - API client for sermon generation and AI features
 * Handles communication with FastAPI backend
 * Uses native fetch API for React Native compatibility
 */

import { API_CONFIG } from '../utils/constants';
import type {
  Sermon,
  SermonConfig,
  VerseReference,
  GenerateSermonRequest,
  GenerateSermonResponse,
} from '../types';

interface FetchOptions {
  method?: string;
  body?: string;
  params?: Record<string, string | number>;
}

class AIService {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Make HTTP request using native fetch
   */
  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, params } = options;

    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        this.authToken = null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail?.message || errorData.detail || `Request failed with status ${response.status}`;

        if (response.status === 403) {
          throw new Error(errorMessage || 'AI quota exceeded');
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Generate sermon from Bible verses
   */
  async generateSermon(
    verses: VerseReference[],
    config: SermonConfig
  ): Promise<GenerateSermonResponse> {
    const request: GenerateSermonRequest = {
      verses,
      config,
    };

    return this.request<GenerateSermonResponse>('/api/v1/sermons/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get sermon by ID
   */
  async getSermon(sermonId: string): Promise<Sermon> {
    return this.request<Sermon>(`/api/v1/sermons/${sermonId}`);
  }

  /**
   * List all user sermons
   */
  async listSermons(limit: number = 50, offset: number = 0): Promise<Sermon[]> {
    return this.request<Sermon[]>('/api/v1/sermons', {
      params: { limit, offset },
    });
  }

  /**
   * Update sermon
   */
  async updateSermon(
    sermonId: string,
    updates: Partial<Pick<Sermon, 'title' | 'content' | 'tags'>>
  ): Promise<Sermon> {
    return this.request<Sermon>(`/api/v1/sermons/${sermonId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete sermon
   */
  async deleteSermon(sermonId: string): Promise<void> {
    await this.request<void>(`/api/v1/sermons/${sermonId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get user quota information
   */
  async getQuota(): Promise<{
    quota_monthly: number;
    quota_used: number;
    quota_remaining: number;
    quota_reset_at: string;
    subscription_tier: string;
    unlimited: boolean;
  }> {
    return this.request('/api/v1/auth/quota');
  }

  /**
   * Get cache statistics (admin/debug)
   */
  async getCacheStats(): Promise<{
    total_keys: number;
    hit_rate: number;
    total_hits: number;
    avg_hits_per_key: number;
  }> {
    return this.request('/api/v1/sermons/stats/cache');
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export const getAIService = (): AIService => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

export default AIService;
