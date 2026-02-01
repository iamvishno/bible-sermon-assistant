/**
 * Local SQLite Schema for User Data
 * Handles sermons, bookmarks, highlights, notes with sync support
 */

import type { SQLiteDatabase } from 'expo-sqlite';

export const SCHEMA_VERSION = 1;

/**
 * Create all local database tables
 */
export const createUserDataSchema = async (db: any) => {
  console.log('📦 Creating local user data schema...');

  try {
    // Sermons table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sermons_local (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source_verses TEXT NOT NULL,
        sermon_type TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        language TEXT DEFAULT 'telugu',
        ai_model_used TEXT,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT
      );
    `);

    // Bookmarks table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookmarks_local (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        note TEXT,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        UNIQUE(user_id, book_id, chapter, verse)
      );
    `);

    // Highlights table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS highlights_local (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse_start INTEGER NOT NULL,
        verse_end INTEGER NOT NULL,
        color TEXT DEFAULT '#FFEB3B',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT
      );
    `);

    // Notes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes_local (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        last_synced_at TEXT,
        UNIQUE(user_id, book_id, chapter, verse)
      );
    `);

    // Sync queue table (for operations waiting to sync)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT
      );
    `);

    // Sync metadata table (tracks last sync times)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        entity_type TEXT PRIMARY KEY,
        last_sync_at TEXT,
        last_sync_token TEXT
      );
    `);

    // App settings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create indexes for performance
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_sermons_user ON sermons_local(user_id);
      CREATE INDEX IF NOT EXISTS idx_sermons_sync ON sermons_local(sync_status);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks_local(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_location ON bookmarks_local(book_id, chapter);
      CREATE INDEX IF NOT EXISTS idx_highlights_user ON highlights_local(user_id);
      CREATE INDEX IF NOT EXISTS idx_highlights_location ON highlights_local(book_id, chapter);
      CREATE INDEX IF NOT EXISTS idx_notes_user ON notes_local(user_id);
      CREATE INDEX IF NOT EXISTS idx_notes_location ON notes_local(book_id, chapter);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
    `);

    // Store schema version
    await db.execAsync(`
      INSERT OR REPLACE INTO app_settings (key, value, updated_at)
      VALUES ('schema_version', '${SCHEMA_VERSION}', datetime('now'));
    `);

    console.log('✅ Local user data schema created successfully');
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  }
};

/**
 * Check if schema needs migration
 */
export const checkSchemaMigration = async (db: SQLiteDatabase): Promise<boolean> => {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      ['schema_version']
    );

    const currentVersion = result ? parseInt(result.value, 10) : 0;

    if (currentVersion < SCHEMA_VERSION) {
      console.log(`📦 Schema migration needed: v${currentVersion} → v${SCHEMA_VERSION}`);
      return true;
    }

    return false;
  } catch (error) {
    // Table doesn't exist yet
    return true;
  }
};

/**
 * Drop all tables (for testing/reset)
 */
export const dropAllTables = async (db: SQLiteDatabase) => {
  console.log('⚠️ Dropping all local tables...');

  await db.execAsync(`
    DROP TABLE IF EXISTS sermons_local;
    DROP TABLE IF EXISTS bookmarks_local;
    DROP TABLE IF EXISTS highlights_local;
    DROP TABLE IF EXISTS notes_local;
    DROP TABLE IF EXISTS sync_queue;
    DROP TABLE IF EXISTS sync_metadata;
    DROP TABLE IF EXISTS app_settings;
  `);

  console.log('✅ All tables dropped');
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (db: SQLiteDatabase) => {
  const sermons = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sermons_local'
  );

  const bookmarks = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks_local'
  );

  const highlights = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM highlights_local'
  );

  const notes = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM notes_local'
  );

  const syncQueue = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sync_queue'
  );

  const pendingSync = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM (
      SELECT id FROM sermons_local WHERE sync_status = 'pending'
      UNION ALL
      SELECT id FROM bookmarks_local WHERE sync_status = 'pending'
      UNION ALL
      SELECT id FROM highlights_local WHERE sync_status = 'pending'
      UNION ALL
      SELECT id FROM notes_local WHERE sync_status = 'pending'
    )`
  );

  return {
    sermons: sermons?.count || 0,
    bookmarks: bookmarks?.count || 0,
    highlights: highlights?.count || 0,
    notes: notes?.count || 0,
    syncQueue: syncQueue?.count || 0,
    pendingSync: pendingSync?.count || 0,
  };
};
