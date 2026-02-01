/**
 * Bookmark Service - Handles bookmarks, highlights, and notes
 * All operations are offline-first with automatic sync
 */

import { syncService } from './SyncService';
import { authService } from './AuthService';
import { v4 as uuidv4 } from 'uuid';

interface CreateBookmarkParams {
  book_id: number;
  chapter: number;
  verse: number;
  note?: string;
  tags?: string[];
}

interface CreateHighlightParams {
  book_id: number;
  chapter: number;
  verse_start: number;
  verse_end: number;
  color: string;
}

interface CreateNoteParams {
  book_id: number;
  chapter: number;
  verse: number;
  content: string;
}

class BookmarkService {
  /**
   * Get current user ID
   */
  private async getUserId(): Promise<string> {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user');
    }
    return user.id;
  }

  // ==================== BOOKMARKS ====================

  /**
   * Create a bookmark
   */
  async createBookmark(params: CreateBookmarkParams) {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    const bookmark = {
      id: uuidv4(),
      user_id: userId,
      book_id: params.book_id,
      chapter: params.chapter,
      verse: params.verse,
      note: params.note || null,
      tags: params.tags ? JSON.stringify(params.tags) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
    };

    try {
      await db.runAsync(
        `INSERT INTO bookmarks_local (id, user_id, book_id, chapter, verse, note, tags, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookmark.id,
          bookmark.user_id,
          bookmark.book_id,
          bookmark.chapter,
          bookmark.verse,
          bookmark.note,
          bookmark.tags,
          bookmark.created_at,
          bookmark.updated_at,
          bookmark.sync_status,
        ]
      );

      console.log('✅ Bookmark created:', bookmark.id);
      return { bookmark, error: null };
    } catch (error) {
      console.error('❌ Create bookmark error:', error);
      return {
        bookmark: null,
        error:
          error instanceof Error ? error.message : 'Failed to create bookmark',
      };
    }
  }

  /**
   * Get all bookmarks for user
   */
  async getBookmarks() {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    try {
      const bookmarks = await db.getAllAsync<any>(
        'SELECT * FROM bookmarks_local WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      // Parse JSON fields
      const parsedBookmarks = bookmarks.map((b) => ({
        ...b,
        tags: b.tags ? JSON.parse(b.tags) : [],
      }));

      return { bookmarks: parsedBookmarks, error: null };
    } catch (error) {
      console.error('❌ Get bookmarks error:', error);
      return {
        bookmarks: [],
        error: error instanceof Error ? error.message : 'Failed to get bookmarks',
      };
    }
  }

  /**
   * Get bookmarks for specific chapter
   */
  async getBookmarksForChapter(book_id: number, chapter: number) {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    try {
      const bookmarks = await db.getAllAsync<any>(
        'SELECT * FROM bookmarks_local WHERE user_id = ? AND book_id = ? AND chapter = ?',
        [userId, book_id, chapter]
      );

      const parsedBookmarks = bookmarks.map((b) => ({
        ...b,
        tags: b.tags ? JSON.parse(b.tags) : [],
      }));

      return { bookmarks: parsedBookmarks, error: null };
    } catch (error) {
      console.error('❌ Get chapter bookmarks error:', error);
      return {
        bookmarks: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get bookmarks',
      };
    }
  }

  /**
   * Update bookmark
   */
  async updateBookmark(id: string, updates: Partial<CreateBookmarkParams>) {
    const db = await syncService.getDatabase();

    try {
      const setFields: string[] = [];
      const values: any[] = [];

      if (updates.note !== undefined) {
        setFields.push('note = ?');
        values.push(updates.note);
      }

      if (updates.tags !== undefined) {
        setFields.push('tags = ?');
        values.push(JSON.stringify(updates.tags));
      }

      setFields.push('updated_at = ?', 'sync_status = ?');
      values.push(new Date().toISOString(), 'pending');
      values.push(id);

      await db.runAsync(
        `UPDATE bookmarks_local SET ${setFields.join(', ')} WHERE id = ?`,
        values
      );

      console.log('✅ Bookmark updated:', id);
      return { error: null };
    } catch (error) {
      console.error('❌ Update bookmark error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Failed to update bookmark',
      };
    }
  }

  /**
   * Delete bookmark
   */
  async deleteBookmark(id: string) {
    const db = await syncService.getDatabase();

    try {
      // Add to sync queue for deletion on server
      await db.runAsync(
        `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at)
         VALUES (?, 'bookmarks', ?, 'delete', '{}', ?)`,
        [uuidv4(), id, new Date().toISOString()]
      );

      // Delete locally
      await db.runAsync('DELETE FROM bookmarks_local WHERE id = ?', [id]);

      console.log('✅ Bookmark deleted:', id);
      return { error: null };
    } catch (error) {
      console.error('❌ Delete bookmark error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Failed to delete bookmark',
      };
    }
  }

  /**
   * Check if verse is bookmarked
   */
  async isBookmarked(book_id: number, chapter: number, verse: number): Promise<boolean> {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    try {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM bookmarks_local WHERE user_id = ? AND book_id = ? AND chapter = ? AND verse = ?',
        [userId, book_id, chapter, verse]
      );

      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('❌ Check bookmark error:', error);
      return false;
    }
  }

  // ==================== HIGHLIGHTS ====================

  /**
   * Create a highlight
   */
  async createHighlight(params: CreateHighlightParams) {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    const highlight = {
      id: uuidv4(),
      user_id: userId,
      book_id: params.book_id,
      chapter: params.chapter,
      verse_start: params.verse_start,
      verse_end: params.verse_end,
      color: params.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
    };

    try {
      await db.runAsync(
        `INSERT INTO highlights_local (id, user_id, book_id, chapter, verse_start, verse_end, color, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          highlight.id,
          highlight.user_id,
          highlight.book_id,
          highlight.chapter,
          highlight.verse_start,
          highlight.verse_end,
          highlight.color,
          highlight.created_at,
          highlight.updated_at,
          highlight.sync_status,
        ]
      );

      console.log('✅ Highlight created:', highlight.id);
      return { highlight, error: null };
    } catch (error) {
      console.error('❌ Create highlight error:', error);
      return {
        highlight: null,
        error:
          error instanceof Error ? error.message : 'Failed to create highlight',
      };
    }
  }

  /**
   * Get highlights for chapter
   */
  async getHighlightsForChapter(book_id: number, chapter: number) {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    try {
      const highlights = await db.getAllAsync<any>(
        'SELECT * FROM highlights_local WHERE user_id = ? AND book_id = ? AND chapter = ?',
        [userId, book_id, chapter]
      );

      return { highlights, error: null };
    } catch (error) {
      console.error('❌ Get highlights error:', error);
      return {
        highlights: [],
        error:
          error instanceof Error ? error.message : 'Failed to get highlights',
      };
    }
  }

  /**
   * Delete highlight
   */
  async deleteHighlight(id: string) {
    const db = await syncService.getDatabase();

    try {
      await db.runAsync(
        `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at)
         VALUES (?, 'highlights', ?, 'delete', '{}', ?)`,
        [uuidv4(), id, new Date().toISOString()]
      );

      await db.runAsync('DELETE FROM highlights_local WHERE id = ?', [id]);

      console.log('✅ Highlight deleted:', id);
      return { error: null };
    } catch (error) {
      console.error('❌ Delete highlight error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Failed to delete highlight',
      };
    }
  }

  // ==================== NOTES ====================

  /**
   * Create a note
   */
  async createNote(params: CreateNoteParams) {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    const note = {
      id: uuidv4(),
      user_id: userId,
      book_id: params.book_id,
      chapter: params.chapter,
      verse: params.verse,
      content: params.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
    };

    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO notes_local (id, user_id, book_id, chapter, verse, content, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.user_id,
          note.book_id,
          note.chapter,
          note.verse,
          note.content,
          note.created_at,
          note.updated_at,
          note.sync_status,
        ]
      );

      console.log('✅ Note created:', note.id);
      return { note, error: null };
    } catch (error) {
      console.error('❌ Create note error:', error);
      return {
        note: null,
        error: error instanceof Error ? error.message : 'Failed to create note',
      };
    }
  }

  /**
   * Get note for verse
   */
  async getNoteForVerse(book_id: number, chapter: number, verse: number) {
    const db = await syncService.getDatabase();
    const userId = await this.getUserId();

    try {
      const note = await db.getFirstAsync<any>(
        'SELECT * FROM notes_local WHERE user_id = ? AND book_id = ? AND chapter = ? AND verse = ?',
        [userId, book_id, chapter, verse]
      );

      return { note, error: null };
    } catch (error) {
      console.error('❌ Get note error:', error);
      return {
        note: null,
        error: error instanceof Error ? error.message : 'Failed to get note',
      };
    }
  }

  /**
   * Update note
   */
  async updateNote(id: string, content: string) {
    const db = await syncService.getDatabase();

    try {
      await db.runAsync(
        `UPDATE notes_local SET content = ?, updated_at = ?, sync_status = 'pending' WHERE id = ?`,
        [content, new Date().toISOString(), id]
      );

      console.log('✅ Note updated:', id);
      return { error: null };
    } catch (error) {
      console.error('❌ Update note error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update note',
      };
    }
  }

  /**
   * Delete note
   */
  async deleteNote(id: string) {
    const db = await syncService.getDatabase();

    try {
      await db.runAsync(
        `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at)
         VALUES (?, 'verse_notes', ?, 'delete', '{}', ?)`,
        [uuidv4(), id, new Date().toISOString()]
      );

      await db.runAsync('DELETE FROM notes_local WHERE id = ?', [id]);

      console.log('✅ Note deleted:', id);
      return { error: null };
    } catch (error) {
      console.error('❌ Delete note error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to delete note',
      };
    }
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();
