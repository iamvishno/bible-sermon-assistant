/**
 * Bible Service - Handles all Bible data operations
 * Web: Uses JSON data
 * Mobile: Uses SQLite for offline access
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Book, Verse } from '../types';

// Import Bible data for web
import bibleData from '../../assets/bible-data.json';

class BibleService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private books: Book[] = [];
  private verses: Verse[] = [];

  /**
   * Initialize the Bible database/data
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('📖 Initializing Bible database...');

      if (Platform.OS === 'web') {
        // On web, use JSON data
        this.books = bibleData.books as Book[];
        this.verses = bibleData.verses as Verse[];
        this.isInitialized = true;
        console.log('✅ Bible data loaded (web)', {
          books: this.books.length,
          verses: this.verses.length
        });
      } else {
        // On mobile, use SQLite
        await this.initializeSQLite();
        this.isInitialized = true;
        console.log('✅ Bible database initialized (mobile)');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Bible database:', error);
      throw error;
    }
  }

  /**
   * Initialize SQLite database for mobile
   */
  private async initializeSQLite(): Promise<void> {
    const dbName = 'bible.db';
    const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

    // Check if database exists
    const dbInfo = await FileSystem.getInfoAsync(dbPath);

    if (!dbInfo.exists) {
      // Copy database from assets
      console.log('📦 Copying Bible database from assets...');

      // Ensure SQLite directory exists
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}SQLite`,
        { intermediates: true }
      );

      // Load the asset
      const asset = Asset.fromModule(require('../../assets/bible.db'));
      await asset.downloadAsync();

      if (asset.localUri) {
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: dbPath,
        });
        console.log('✅ Bible database copied successfully');
      }
    }

    // Open the database
    this.db = await SQLite.openDatabaseAsync(dbName);
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get all books
   */
  async getAllBooks(): Promise<Book[]> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      return this.books;
    } else {
      const result = await this.db.getAllAsync<Book>(
        'SELECT * FROM books ORDER BY id'
      );
      return result;
    }
  }

  /**
   * Get books by testament
   */
  async getBooksByTestament(testament: 'OT' | 'NT'): Promise<Book[]> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      return this.books.filter(book => book.testament === testament);
    } else {
      const result = await this.db.getAllAsync<Book>(
        'SELECT * FROM books WHERE testament = ? ORDER BY id',
        [testament]
      );
      return result;
    }
  }

  /**
   * Get a single book by ID
   */
  async getBook(bookId: number): Promise<Book | null> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      return this.books.find(book => book.id === bookId) || null;
    } else {
      const result = await this.db.getFirstAsync<Book>(
        'SELECT * FROM books WHERE id = ?',
        [bookId]
      );
      return result || null;
    }
  }

  /**
   * Get verses for a specific chapter
   */
  async getVerses(bookId: number, chapter: number): Promise<Verse[]> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      return this.verses.filter(
        v => v.book_id === bookId && v.chapter === chapter
      ).sort((a, b) => a.verse - b.verse);
    } else {
      const result = await this.db.getAllAsync<Verse>(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse',
        [bookId, chapter]
      );
      return result;
    }
  }

  /**
   * Get a specific verse
   */
  async getVerse(
    bookId: number,
    chapter: number,
    verse: number
  ): Promise<Verse | null> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      return this.verses.find(
        v => v.book_id === bookId && v.chapter === chapter && v.verse === verse
      ) || null;
    } else {
      const result = await this.db.getFirstAsync<Verse>(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?',
        [bookId, chapter, verse]
      );
      return result || null;
    }
  }

  /**
   * Get verse range
   */
  async getVerseRange(
    bookId: number,
    chapter: number,
    verseStart: number,
    verseEnd: number
  ): Promise<Verse[]> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      return this.verses.filter(
        v => v.book_id === bookId &&
            v.chapter === chapter &&
            v.verse >= verseStart &&
            v.verse <= verseEnd
      ).sort((a, b) => a.verse - b.verse);
    } else {
      const result = await this.db.getAllAsync<Verse>(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ? AND verse >= ? AND verse <= ? ORDER BY verse',
        [bookId, chapter, verseStart, verseEnd]
      );
      return result;
    }
  }

  /**
   * Search verses
   */
  async searchVerses(
    query: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Verse[]> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      // Simple text search on web
      const results = this.verses.filter(v =>
        v.text.toLowerCase().includes(query.toLowerCase())
      );
      return results.slice(offset, offset + limit);
    } else {
      const result = await this.db.getAllAsync<Verse>(
        `SELECT v.* FROM verses v
         JOIN verses_fts fts ON v.id = fts.rowid
         WHERE verses_fts MATCH ?
         LIMIT ? OFFSET ?`,
        [query, limit, offset]
      );
      return result;
    }
  }

  /**
   * Get chapter count for a book
   */
  async getChapterCount(bookId: number): Promise<number> {
    const book = await this.getBook(bookId);
    return book?.chapter_count || 0;
  }

  /**
   * Get verse count for a chapter
   */
  async getVerseCount(bookId: number, chapter: number): Promise<number> {
    const verses = await this.getVerses(bookId, chapter);
    return verses.length;
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<{
    totalBooks: number;
    totalVerses: number;
    otBooks: number;
    ntBooks: number;
  }> {
    await this.ensureInitialized();

    if (Platform.OS === 'web') {
      return {
        totalBooks: this.books.length,
        totalVerses: this.verses.length,
        otBooks: this.books.filter(b => b.testament === 'OT').length,
        ntBooks: this.books.filter(b => b.testament === 'NT').length,
      };
    } else {
      const totalBooks = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM books'
      );

      const totalVerses = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM verses'
      );

      const otBooks = await this.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM books WHERE testament = 'OT'"
      );

      const ntBooks = await this.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM books WHERE testament = 'NT'"
      );

      return {
        totalBooks: totalBooks?.count || 0,
        totalVerses: totalVerses?.count || 0,
        otBooks: otBooks?.count || 0,
        ntBooks: ntBooks?.count || 0,
      };
    }
  }

  /**
   * Close database connection (mobile only)
   */
  async close(): Promise<void> {
    if (this.db && Platform.OS !== 'web') {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('📖 Bible database closed');
    }
  }
}

// Export singleton instance
export const bibleService = new BibleService();
