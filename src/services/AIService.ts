/**
 * AI Service - API client for sermon generation and AI features
 * Handles communication with FastAPI backend
 */

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../utils/constants';
import type {
  Sermon,
  SermonConfig,
  VerseReference,
  GenerateSermonRequest,
  GenerateSermonResponse,
} from '../types';

class AIService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.authToken = null;
          // Emit event for auth stores to handle
          // TODO: Implement event emitter
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Generate sermon from Bible verses
   */
  async generateSermon(
    verses: VerseReference[],
    config: SermonConfig
  ): Promise<GenerateSermonResponse> {
    try {
      const request: GenerateSermonRequest = {
        verses,
        config,
      };

      const response = await this.api.post<GenerateSermonResponse>(
        '/api/v1/sermons/generate',
        request
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        // Quota exceeded
        throw new Error(
          error.response.data?.detail?.message || 'AI quota exceeded'
        );
      }
      throw new Error(
        error.response?.data?.detail || 'Failed to generate sermon'
      );
    }
  }

  /**
   * Get sermon by ID
   */
  async getSermon(sermonId: string): Promise<Sermon> {
    try {
      const response = await this.api.get<Sermon>(
        `/api/v1/sermons/${sermonId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to fetch sermon'
      );
    }
  }

  /**
   * List all user sermons
   */
  async listSermons(limit: number = 50, offset: number = 0): Promise<Sermon[]> {
    try {
      const response = await this.api.get<Sermon[]>('/api/v1/sermons', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to fetch sermons'
      );
    }
  }

  /**
   * Update sermon
   */
  async updateSermon(
    sermonId: string,
    updates: Partial<Pick<Sermon, 'title' | 'content' | 'tags'>>
  ): Promise<Sermon> {
    try {
      const response = await this.api.put<Sermon>(
        `/api/v1/sermons/${sermonId}`,
        updates
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to update sermon'
      );
    }
  }

  /**
   * Delete sermon
   */
  async deleteSermon(sermonId: string): Promise<void> {
    try {
      await this.api.delete(`/api/v1/sermons/${sermonId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to delete sermon'
      );
    }
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
    try {
      const response = await this.api.get('/api/v1/auth/quota');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to fetch quota'
      );
    }
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
    try {
      const response = await this.api.get('/api/v1/sermons/stats/cache');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Failed to fetch cache stats'
      );
    }
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
