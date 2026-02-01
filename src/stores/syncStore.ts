/**
 * Sync Store - Zustand state management for data synchronization
 */

import { create } from 'zustand';
import { syncService } from '../services/SyncService';

interface SyncState {
  // Sync status
  isSyncing: boolean;
  lastSyncAt: Date | null;
  syncError: string | null;

  // Sync statistics
  pendingCount: number;
  syncedCount: number;
  errorCount: number;

  // Network status
  isOnline: boolean;
  autoSyncEnabled: boolean;

  // Actions
  initialize: () => Promise<void>;
  startSync: () => Promise<void>;
  stopSync: () => void;
  forceSyncNow: () => Promise<void>;
  updateSyncStats: () => Promise<void>;
  setAutoSync: (enabled: boolean) => void;
  setOnlineStatus: (online: boolean) => void;
  clearError: () => void;
  clearAllData: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  // Initial state
  isSyncing: false,
  lastSyncAt: null,
  syncError: null,
  pendingCount: 0,
  syncedCount: 0,
  errorCount: 0,
  isOnline: true,
  autoSyncEnabled: true,

  // Initialize sync service
  initialize: async () => {
    try {
      await syncService.initialize();
      await get().updateSyncStats();
      console.log('✅ Sync initialized');
    } catch (error) {
      console.error('❌ Sync initialization error:', error);
      set({
        syncError:
          error instanceof Error
            ? error.message
            : 'Failed to initialize sync',
      });
    }
  },

  // Start automatic sync
  startSync: async () => {
    try {
      await syncService.startPeriodicSync();
      set({ autoSyncEnabled: true });
      console.log('🔄 Auto-sync started');
    } catch (error) {
      console.error('❌ Start sync error:', error);
      set({
        syncError:
          error instanceof Error ? error.message : 'Failed to start sync',
      });
    }
  },

  // Stop automatic sync
  stopSync: () => {
    syncService.stopPeriodicSync();
    set({ autoSyncEnabled: false });
    console.log('⏹️ Auto-sync stopped');
  },

  // Force immediate sync
  forceSyncNow: async () => {
    const { isOnline, isSyncing } = get();

    if (!isOnline) {
      set({ syncError: 'Cannot sync: No internet connection' });
      return;
    }

    if (isSyncing) {
      console.log('⏭️ Sync already in progress');
      return;
    }

    set({ isSyncing: true, syncError: null });

    try {
      await syncService.forceSyncNow();

      set({
        isSyncing: false,
        lastSyncAt: new Date(),
        syncError: null,
      });

      await get().updateSyncStats();
      console.log('✅ Force sync completed');
    } catch (error) {
      console.error('❌ Force sync error:', error);
      set({
        isSyncing: false,
        syncError:
          error instanceof Error ? error.message : 'Sync failed',
      });
    }
  },

  // Update sync statistics
  updateSyncStats: async () => {
    try {
      const stats = await syncService.getSyncStats();

      set({
        pendingCount: stats.pendingSync,
        syncedCount:
          stats.sermons +
          stats.bookmarks +
          stats.highlights +
          stats.notes -
          stats.pendingSync,
      });
    } catch (error) {
      console.error('❌ Update stats error:', error);
    }
  },

  // Enable/disable auto-sync
  setAutoSync: (enabled: boolean) => {
    if (enabled) {
      get().startSync();
    } else {
      get().stopSync();
    }
  },

  // Update online status
  setOnlineStatus: (online: boolean) => {
    set({ isOnline: online });

    if (online && get().autoSyncEnabled) {
      // Trigger sync when coming online
      setTimeout(() => {
        get().forceSyncNow();
      }, 1000);
    }
  },

  // Clear error message
  clearError: () => {
    set({ syncError: null });
  },

  // Clear all local data
  clearAllData: async () => {
    try {
      await syncService.clearAllData();
      await get().updateSyncStats();
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Clear data error:', error);
      set({
        syncError:
          error instanceof Error ? error.message : 'Failed to clear data',
      });
    }
  },
}));
