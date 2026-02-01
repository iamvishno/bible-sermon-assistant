/**
 * Sync Service - Handles background synchronization
 * Syncs user data between local SQLite and Supabase
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { authService } from './AuthService';
import { createUserDataSchema, checkSchemaMigration, getDatabaseStats } from '../db/schema';
import { SYNC_CONFIG } from '../utils/constants';

const BACKGROUND_SYNC_TASK = 'background-sync-task';

interface SyncQueueItem {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  created_at: string;
  retry_count: number;
  last_error?: string;
}

class SyncService {
  private db: any | null = null;
  private isInitialized = false;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize sync service and local database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔄 Initializing Sync Service...');

      // Open user data database
      this.db = await SQLite.openDatabaseAsync('userdata.db');

      // Check if migration needed
      const needsMigration = await checkSchemaMigration(this.db);

      if (needsMigration) {
        await createUserDataSchema(this.db);
      }

      this.isInitialized = true;
      console.log('✅ Sync Service initialized');

      // Start periodic sync
      await this.startPeriodicSync();

      // Register background task
      await this.registerBackgroundSync();
    } catch (error) {
      console.error('❌ Failed to initialize Sync Service:', error);
      throw error;
    }
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<SQLite.SQLiteDatabase> {
    if (!this.isInitialized || !this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  /**
   * Start periodic sync (every 30 seconds)
   */
  async startPeriodicSync(): Promise<void> {
    if (this.syncInterval) {
      return; // Already running
    }

    console.log('🔄 Starting periodic sync...');

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncAll();
      } catch (error) {
        console.error('❌ Periodic sync error:', error);
      }
    }, SYNC_CONFIG.INTERVAL_MS);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Periodic sync stopped');
    }
  }

  /**
   * Register background sync task
   */
  async registerBackgroundSync(): Promise<void> {
    try {
      // Define background task
      TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
        try {
          await this.syncAll();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('❌ Background sync error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // Register background fetch
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: SYNC_CONFIG.INTERVAL_MS / 1000, // Convert to seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('✅ Background sync registered');
    } catch (error) {
      console.error('❌ Failed to register background sync:', error);
    }
  }

  /**
   * Sync all pending changes
   */
  async syncAll(): Promise<void> {
    // Check if user is authenticated
    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      console.log('⏭️ Skipping sync: User not authenticated');
      return;
    }

    if (this.isSyncing) {
      console.log('⏭️ Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;

    try {
      const db = await this.ensureInitialized();

      console.log('🔄 Starting sync...');

      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Sync each entity type
      await this.syncSermons(db, user.id);
      await this.syncBookmarks(db, user.id);
      await this.syncHighlights(db, user.id);
      await this.syncNotes(db, user.id);

      // Process sync queue (operations that need to be sent to server)
      await this.processSyncQueue(db);

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync sermons
   */
  private async syncSermons(db: SQLite.SQLiteDatabase, userId: string): Promise<void> {
    try {
      // Get pending sermons
      const pending = await db.getAllAsync<any>(
        `SELECT * FROM sermons_local WHERE user_id = ? AND sync_status = 'pending'`,
        [userId]
      );

      if (pending.length === 0) {
        return;
      }

      console.log(`📝 Syncing ${pending.length} sermons...`);

      for (const sermon of pending) {
        try {
          // Parse JSON fields
          const content = JSON.parse(sermon.content);
          const source_verses = JSON.parse(sermon.source_verses);
          const tags = sermon.tags ? JSON.parse(sermon.tags) : null;

          // Send to Supabase
          const supabase = authService.getClient();
          const { error } = await supabase.from('sermons').upsert({
            id: sermon.id,
            user_id: sermon.user_id,
            title: sermon.title,
            content,
            source_verses,
            sermon_type: sermon.sermon_type,
            target_audience: sermon.target_audience,
            language: sermon.language,
            ai_model_used: sermon.ai_model_used,
            tags,
            created_at: sermon.created_at,
            updated_at: sermon.updated_at,
          });

          if (error) {
            throw error;
          }

          // Mark as synced
          await db.runAsync(
            `UPDATE sermons_local SET sync_status = 'synced', last_synced_at = datetime('now') WHERE id = ?`,
            [sermon.id]
          );
        } catch (error) {
          console.error(`❌ Failed to sync sermon ${sermon.id}:`, error);
          await db.runAsync(
            `UPDATE sermons_local SET sync_status = 'error' WHERE id = ?`,
            [sermon.id]
          );
        }
      }
    } catch (error) {
      console.error('❌ Sermon sync error:', error);
    }
  }

  /**
   * Sync bookmarks
   */
  private async syncBookmarks(db: SQLite.SQLiteDatabase, userId: string): Promise<void> {
    try {
      const pending = await db.getAllAsync<any>(
        `SELECT * FROM bookmarks_local WHERE user_id = ? AND sync_status = 'pending'`,
        [userId]
      );

      if (pending.length === 0) {
        return;
      }

      console.log(`🔖 Syncing ${pending.length} bookmarks...`);

      for (const bookmark of pending) {
        try {
          const tags = bookmark.tags ? JSON.parse(bookmark.tags) : null;

          const supabase = authService.getClient();
          const { error } = await supabase.from('bookmarks').upsert({
            id: bookmark.id,
            user_id: bookmark.user_id,
            book_id: bookmark.book_id,
            chapter: bookmark.chapter,
            verse: bookmark.verse,
            note: bookmark.note,
            tags,
            created_at: bookmark.created_at,
            updated_at: bookmark.updated_at,
          });

          if (error) {
            throw error;
          }

          await db.runAsync(
            `UPDATE bookmarks_local SET sync_status = 'synced', last_synced_at = datetime('now') WHERE id = ?`,
            [bookmark.id]
          );
        } catch (error) {
          console.error(`❌ Failed to sync bookmark ${bookmark.id}:`, error);
          await db.runAsync(
            `UPDATE bookmarks_local SET sync_status = 'error' WHERE id = ?`,
            [bookmark.id]
          );
        }
      }
    } catch (error) {
      console.error('❌ Bookmark sync error:', error);
    }
  }

  /**
   * Sync highlights
   */
  private async syncHighlights(db: SQLite.SQLiteDatabase, userId: string): Promise<void> {
    try {
      const pending = await db.getAllAsync<any>(
        `SELECT * FROM highlights_local WHERE user_id = ? AND sync_status = 'pending'`,
        [userId]
      );

      if (pending.length === 0) {
        return;
      }

      console.log(`✨ Syncing ${pending.length} highlights...`);

      for (const highlight of pending) {
        try {
          const supabase = authService.getClient();
          const { error } = await supabase.from('highlights').upsert({
            id: highlight.id,
            user_id: highlight.user_id,
            book_id: highlight.book_id,
            chapter: highlight.chapter,
            verse_start: highlight.verse_start,
            verse_end: highlight.verse_end,
            color: highlight.color,
            created_at: highlight.created_at,
            updated_at: highlight.updated_at,
          });

          if (error) {
            throw error;
          }

          await db.runAsync(
            `UPDATE highlights_local SET sync_status = 'synced', last_synced_at = datetime('now') WHERE id = ?`,
            [highlight.id]
          );
        } catch (error) {
          console.error(`❌ Failed to sync highlight ${highlight.id}:`, error);
          await db.runAsync(
            `UPDATE highlights_local SET sync_status = 'error' WHERE id = ?`,
            [highlight.id]
          );
        }
      }
    } catch (error) {
      console.error('❌ Highlight sync error:', error);
    }
  }

  /**
   * Sync notes
   */
  private async syncNotes(db: SQLite.SQLiteDatabase, userId: string): Promise<void> {
    try {
      const pending = await db.getAllAsync<any>(
        `SELECT * FROM notes_local WHERE user_id = ? AND sync_status = 'pending'`,
        [userId]
      );

      if (pending.length === 0) {
        return;
      }

      console.log(`📝 Syncing ${pending.length} notes...`);

      for (const note of pending) {
        try {
          const supabase = authService.getClient();
          const { error } = await supabase.from('verse_notes').upsert({
            id: note.id,
            user_id: note.user_id,
            book_id: note.book_id,
            chapter: note.chapter,
            verse: note.verse,
            content: note.content,
            created_at: note.created_at,
            updated_at: note.updated_at,
          });

          if (error) {
            throw error;
          }

          await db.runAsync(
            `UPDATE notes_local SET sync_status = 'synced', last_synced_at = datetime('now') WHERE id = ?`,
            [note.id]
          );
        } catch (error) {
          console.error(`❌ Failed to sync note ${note.id}:`, error);
          await db.runAsync(
            `UPDATE notes_local SET sync_status = 'error' WHERE id = ?`,
            [note.id]
          );
        }
      }
    } catch (error) {
      console.error('❌ Note sync error:', error);
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      const queue = await db.getAllAsync<SyncQueueItem>(
        'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT ?',
        [SYNC_CONFIG.BATCH_SIZE]
      );

      if (queue.length === 0) {
        return;
      }

      console.log(`📤 Processing ${queue.length} sync queue items...`);

      for (const item of queue) {
        try {
          const payload = JSON.parse(item.payload);

          // Send to server based on operation
          const supabase = authService.getClient();

          let error;
          if (item.operation === 'delete') {
            ({ error } = await supabase
              .from(item.entity_type)
              .delete()
              .eq('id', item.entity_id));
          } else {
            ({ error } = await supabase.from(item.entity_type).upsert(payload));
          }

          if (error) {
            throw error;
          }

          // Remove from queue
          await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
        } catch (error) {
          console.error(`❌ Failed to process queue item ${item.id}:`, error);

          // Increment retry count
          if (item.retry_count < SYNC_CONFIG.MAX_RETRIES) {
            await db.runAsync(
              'UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
              [error instanceof Error ? error.message : 'Unknown error', item.id]
            );
          } else {
            // Max retries reached, remove from queue
            await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
            console.error(`❌ Max retries reached for queue item ${item.id}, removed`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Sync queue processing error:', error);
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats() {
    const db = await this.ensureInitialized();
    return await getDatabaseStats(db);
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<void> {
    console.log('🔄 Force syncing now...');
    await this.syncAll();
  }

  /**
   * Clear all local data (for sign out)
   */
  async clearAllData(): Promise<void> {
    const db = await this.ensureInitialized();

    console.log('🗑️ Clearing all local data...');

    await db.execAsync(`
      DELETE FROM sermons_local;
      DELETE FROM bookmarks_local;
      DELETE FROM highlights_local;
      DELETE FROM notes_local;
      DELETE FROM sync_queue;
      DELETE FROM sync_metadata;
    `);

    console.log('✅ All local data cleared');
  }

  /**
   * Get database instance (for direct queries)
   */
  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    return await this.ensureInitialized();
  }

  /**
   * Close database and cleanup
   */
  async close(): Promise<void> {
    this.stopPeriodicSync();

    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('🔄 Sync Service closed');
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();
