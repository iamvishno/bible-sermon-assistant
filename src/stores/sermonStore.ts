/**
 * Sermon Store - Zustand state management for sermons
 * Handles sermon generation, caching, and CRUD operations
 */

import { create } from 'zustand';
import type {
  Sermon,
  SermonConfig,
  VerseReference,
  GenerateSermonResponse,
} from '../types';
import { getAIService } from '../services/AIService';
import * as SQLite from 'expo-sqlite';

interface QuotaInfo {
  quota_monthly: number;
  quota_used: number;
  quota_remaining: number;
  quota_reset_at: string;
  subscription_tier: string;
  unlimited: boolean;
}

interface SermonStore {
  // State
  sermons: Sermon[];
  currentSermon: Sermon | null;
  isGenerating: boolean;
  generationProgress: number; // 0-100
  generationStatus: string;
  quota: QuotaInfo | null;
  error: string | null;

  // Actions
  generateSermon: (
    verses: VerseReference[],
    config: SermonConfig
  ) => Promise<GenerateSermonResponse | null>;
  loadSermons: () => Promise<void>;
  getSermon: (sermonId: string) => Promise<Sermon | null>;
  updateSermon: (
    sermonId: string,
    updates: Partial<Pick<Sermon, 'title' | 'content' | 'tags'>>
  ) => Promise<boolean>;
  deleteSermon: (sermonId: string) => Promise<boolean>;
  loadQuota: () => Promise<void>;
  setCurrentSermon: (sermon: Sermon | null) => void;
  clearError: () => void;
}

export const useSermonStore = create<SermonStore>((set, get) => ({
  // Initial state
  sermons: [],
  currentSermon: null,
  isGenerating: false,
  generationProgress: 0,
  generationStatus: '',
  quota: null,
  error: null,

  // Generate sermon using AI
  generateSermon: async (verses, config) => {
    try {
      set({
        isGenerating: true,
        generationProgress: 0,
        generationStatus: 'Checking quota...',
        error: null,
      });

      const aiService = getAIService();

      // Check quota first
      set({ generationProgress: 10, generationStatus: 'Verifying quota...' });
      const quota = await aiService.getQuota();
      set({ quota });

      if (!quota.unlimited && quota.quota_remaining <= 0) {
        throw new Error(
          'AI generation quota exceeded. Please upgrade your subscription.'
        );
      }

      // Generate sermon
      set({ generationProgress: 20, generationStatus: 'Generating sermon...' });
      const response = await aiService.generateSermon(verses, config);

      set({ generationProgress: 80, generationStatus: 'Saving sermon...' });

      // Save to local database
      const db = await SQLite.openDatabaseAsync('bible_assistant.db');
      await db.runAsync(
        `INSERT INTO sermons_local (id, user_id, title, content, source_verses, sermon_type, target_audience, language, ai_model_used, tags, sync_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          response.sermon.id,
          response.sermon.user_id,
          response.sermon.title,
          JSON.stringify(response.sermon.content),
          JSON.stringify(response.sermon.source_verses),
          response.sermon.sermon_type,
          response.sermon.target_audience,
          response.sermon.language,
          response.sermon.ai_model_used || null,
          JSON.stringify(response.sermon.tags || []),
          'synced', // Already synced since it came from API
          response.sermon.created_at,
          response.sermon.updated_at,
        ]
      );

      set({ generationProgress: 90, generationStatus: 'Updating quota...' });

      // Update quota
      set({
        quota: {
          ...quota,
          quota_used: quota.quota_used + 1,
          quota_remaining: quota.unlimited
            ? -1
            : quota.quota_remaining - 1,
        },
      });

      // Add to sermons list
      set((state) => ({
        sermons: [response.sermon, ...state.sermons],
        currentSermon: response.sermon,
        generationProgress: 100,
        generationStatus: 'Complete!',
        isGenerating: false,
      }));

      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to generate sermon',
        isGenerating: false,
        generationProgress: 0,
        generationStatus: '',
      });
      return null;
    }
  },

  // Load sermons from local database
  loadSermons: async () => {
    try {
      const db = await SQLite.openDatabaseAsync('bible_assistant.db');
      const result = await db.getAllAsync<{
        id: string;
        user_id: string;
        title: string;
        content: string;
        source_verses: string;
        sermon_type: string;
        target_audience: string;
        language: string;
        ai_model_used: string | null;
        tags: string;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, user_id, title, content, source_verses, sermon_type, target_audience, language, ai_model_used, tags, created_at, updated_at
         FROM sermons_local
         ORDER BY created_at DESC
         LIMIT 50`
      );

      const sermons: Sermon[] = result.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        content: JSON.parse(row.content),
        source_verses: JSON.parse(row.source_verses),
        sermon_type: row.sermon_type as any,
        target_audience: row.target_audience as any,
        language: row.language,
        ai_model_used: row.ai_model_used || undefined,
        tags: JSON.parse(row.tags),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      set({ sermons });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load sermons' });
    }
  },

  // Get specific sermon
  getSermon: async (sermonId) => {
    try {
      // First check local database
      const db = await SQLite.openDatabaseAsync('bible_assistant.db');
      const result = await db.getFirstAsync<{
        id: string;
        user_id: string;
        title: string;
        content: string;
        source_verses: string;
        sermon_type: string;
        target_audience: string;
        language: string;
        ai_model_used: string | null;
        tags: string;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, user_id, title, content, source_verses, sermon_type, target_audience, language, ai_model_used, tags, created_at, updated_at
         FROM sermons_local
         WHERE id = ?`,
        [sermonId]
      );

      if (result) {
        const sermon: Sermon = {
          id: result.id,
          user_id: result.user_id,
          title: result.title,
          content: JSON.parse(result.content),
          source_verses: JSON.parse(result.source_verses),
          sermon_type: result.sermon_type as any,
          target_audience: result.target_audience as any,
          language: result.language,
          ai_model_used: result.ai_model_used || undefined,
          tags: JSON.parse(result.tags),
          created_at: result.created_at,
          updated_at: result.updated_at,
        };
        set({ currentSermon: sermon });
        return sermon;
      }

      // If not in local DB, try API
      const aiService = getAIService();
      const sermon = await aiService.getSermon(sermonId);
      set({ currentSermon: sermon });
      return sermon;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get sermon' });
      return null;
    }
  },

  // Update sermon
  updateSermon: async (sermonId, updates) => {
    try {
      const aiService = getAIService();
      const updatedSermon = await aiService.updateSermon(sermonId, updates);

      // Update local database
      const db = await SQLite.openDatabaseAsync('bible_assistant.db');

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(updates.title);
      }
      if (updates.content !== undefined) {
        updateFields.push('content = ?');
        updateValues.push(JSON.stringify(updates.content));
      }
      if (updates.tags !== undefined) {
        updateFields.push('tags = ?');
        updateValues.push(JSON.stringify(updates.tags));
      }

      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(sermonId);

      await db.runAsync(
        `UPDATE sermons_local SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Update in state
      set((state) => ({
        sermons: state.sermons.map((s) =>
          s.id === sermonId ? updatedSermon : s
        ),
        currentSermon:
          state.currentSermon?.id === sermonId
            ? updatedSermon
            : state.currentSermon,
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update sermon' });
      return false;
    }
  },

  // Delete sermon
  deleteSermon: async (sermonId) => {
    try {
      const aiService = getAIService();
      await aiService.deleteSermon(sermonId);

      // Delete from local database
      const db = await SQLite.openDatabaseAsync('bible_assistant.db');
      await db.runAsync('DELETE FROM sermons_local WHERE id = ?', [sermonId]);

      // Remove from state
      set((state) => ({
        sermons: state.sermons.filter((s) => s.id !== sermonId),
        currentSermon:
          state.currentSermon?.id === sermonId ? null : state.currentSermon,
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete sermon' });
      return false;
    }
  },

  // Load user quota
  loadQuota: async () => {
    try {
      const aiService = getAIService();
      const quota = await aiService.getQuota();
      set({ quota });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load quota' });
    }
  },

  // Set current sermon
  setCurrentSermon: (sermon) => {
    set({ currentSermon: sermon });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
