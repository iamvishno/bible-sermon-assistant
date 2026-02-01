/**
 * SermonStore Tests
 * Unit tests for sermon state management
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useSermonStore } from '../sermonStore';
import * as AIService from '../../services/AIService';
import * as SQLite from 'expo-sqlite';

// Mock dependencies
jest.mock('../../services/AIService');
jest.mock('expo-sqlite');

describe('SermonStore', () => {
  let mockAIService: any;
  let mockDb: any;

  beforeEach(() => {
    // Reset store state
    useSermonStore.setState({
      sermons: [],
      currentSermon: null,
      isGenerating: false,
      generationProgress: 0,
      generationStatus: '',
      quota: null,
      error: null,
    });

    // Mock AI Service
    mockAIService = {
      generateSermon: jest.fn(),
      getSermon: jest.fn(),
      listSermons: jest.fn(),
      updateSermon: jest.fn(),
      deleteSermon: jest.fn(),
      getQuota: jest.fn(),
    };

    (AIService.getAIService as jest.Mock).mockReturnValue(mockAIService);

    // Mock SQLite
    mockDb = {
      runAsync: jest.fn(),
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
    };

    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSermon', () => {
    it('should generate sermon successfully', async () => {
      const mockQuota = {
        quota_monthly: 100,
        quota_used: 5,
        quota_remaining: 95,
        quota_reset_at: '2026-03-01',
        subscription_tier: 'premium',
        unlimited: false,
      };

      const mockSermon = {
        id: 'sermon-123',
        user_id: 'user-456',
        title: 'Test Sermon',
        content: {
          title: 'Test Sermon',
          introduction: 'Intro',
          main_points: [],
          application: 'App',
          conclusion: 'Conclusion',
          prayer_points: [],
        },
        source_verses: [],
        sermon_type: 'expository',
        target_audience: 'general',
        language: 'telugu',
        created_at: '2026-02-01',
        updated_at: '2026-02-01',
      };

      const mockResponse = {
        sermon: mockSermon,
        quota_remaining: 94,
      };

      mockAIService.getQuota.mockResolvedValue(mockQuota);
      mockAIService.generateSermon.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSermonStore());

      await act(async () => {
        await result.current.generateSermon(
          [{ book_id: 43, chapter: 3, verse_start: 16 }],
          {
            sermon_type: 'expository',
            target_audience: 'general',
            length_minutes: 20,
            tone: 'formal',
            include_illustrations: true,
          }
        );
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.currentSermon).toEqual(mockSermon);
      expect(result.current.generationProgress).toBe(100);
      expect(result.current.error).toBeNull();
    });

    it('should handle quota exceeded error', async () => {
      const mockQuota = {
        quota_monthly: 3,
        quota_used: 3,
        quota_remaining: 0,
        quota_reset_at: '2026-03-01',
        subscription_tier: 'free',
        unlimited: false,
      };

      mockAIService.getQuota.mockResolvedValue(mockQuota);

      const { result } = renderHook(() => useSermonStore());

      await act(async () => {
        await result.current.generateSermon(
          [{ book_id: 43, chapter: 3, verse_start: 16 }],
          {
            sermon_type: 'expository',
            target_audience: 'general',
            length_minutes: 20,
            tone: 'formal',
            include_illustrations: true,
          }
        );
      });

      expect(result.current.error).toContain('quota exceeded');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should update progress during generation', async () => {
      const mockQuota = {
        quota_monthly: 100,
        quota_used: 5,
        quota_remaining: 95,
        unlimited: false,
      };

      mockAIService.getQuota.mockResolvedValue(mockQuota);
      mockAIService.generateSermon.mockImplementation(async () => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100));
        return { sermon: {}, quota_remaining: 94 };
      });

      const { result } = renderHook(() => useSermonStore());

      let progressUpdates: number[] = [];

      act(() => {
        result.current.generateSermon([], {
          sermon_type: 'expository',
          target_audience: 'general',
          length_minutes: 20,
          tone: 'formal',
          include_illustrations: true,
        });
      });

      // Check initial state
      expect(result.current.isGenerating).toBe(true);
      expect(result.current.generationProgress).toBeGreaterThan(0);
    });
  });

  describe('loadSermons', () => {
    it('should load sermons from local database', async () => {
      const mockSermons = [
        {
          id: 'sermon-1',
          user_id: 'user-1',
          title: 'Sermon 1',
          content: '{}',
          source_verses: '[]',
          sermon_type: 'expository',
          target_audience: 'general',
          language: 'telugu',
          ai_model_used: 'gpt-4',
          tags: '[]',
          created_at: '2026-02-01',
          updated_at: '2026-02-01',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockSermons);

      const { result } = renderHook(() => useSermonStore());

      await act(async () => {
        await result.current.loadSermons();
      });

      expect(result.current.sermons.length).toBe(1);
      expect(result.current.sermons[0].id).toBe('sermon-1');
    });

    it('should handle empty sermon list', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const { result } = renderHook(() => useSermonStore());

      await act(async () => {
        await result.current.loadSermons();
      });

      expect(result.current.sermons).toEqual([]);
    });
  });

  describe('updateSermon', () => {
    it('should update sermon successfully', async () => {
      const updatedSermon = {
        id: 'sermon-123',
        title: 'Updated Title',
      };

      mockAIService.updateSermon.mockResolvedValue({
        ...updatedSermon,
        content: {},
        source_verses: [],
      });

      const { result } = renderHook(() => useSermonStore());

      // Set initial sermon
      act(() => {
        result.current.sermons = [
          {
            id: 'sermon-123',
            title: 'Original Title',
          } as any,
        ];
      });

      await act(async () => {
        const success = await result.current.updateSermon('sermon-123', {
          title: 'Updated Title',
        });
        expect(success).toBe(true);
      });

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('deleteSermon', () => {
    it('should delete sermon successfully', async () => {
      mockAIService.deleteSermon.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSermonStore());

      // Set initial sermons
      act(() => {
        result.current.sermons = [
          { id: 'sermon-1' } as any,
          { id: 'sermon-2' } as any,
        ];
      });

      await act(async () => {
        const success = await result.current.deleteSermon('sermon-1');
        expect(success).toBe(true);
      });

      expect(result.current.sermons.length).toBe(1);
      expect(result.current.sermons[0].id).toBe('sermon-2');
    });
  });

  describe('loadQuota', () => {
    it('should load user quota', async () => {
      const mockQuota = {
        quota_monthly: 100,
        quota_used: 10,
        quota_remaining: 90,
        quota_reset_at: '2026-03-01',
        subscription_tier: 'premium',
        unlimited: false,
      };

      mockAIService.getQuota.mockResolvedValue(mockQuota);

      const { result } = renderHook(() => useSermonStore());

      await act(async () => {
        await result.current.loadQuota();
      });

      expect(result.current.quota).toEqual(mockQuota);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useSermonStore());

      act(() => {
        result.current.error = 'Test error';
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
