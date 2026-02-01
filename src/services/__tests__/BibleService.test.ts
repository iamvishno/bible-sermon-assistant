/**
 * BibleService Tests
 * Unit tests for Bible data operations
 */

import { bibleService } from '../BibleService';
import * as SQLite from 'expo-sqlite';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('BibleService', () => {
  let mockDb: any;

  beforeEach(() => {
    // Create mock database
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
    };

    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should return all 66 books', async () => {
      const mockBooks = [
        { id: 1, name_telugu: 'ఆదికాండము', name_english: 'Genesis', testament: 'OT', chapter_count: 50, verse_count: 1533 },
        { id: 2, name_telugu: 'నిర్గమకాండము', name_english: 'Exodus', testament: 'OT', chapter_count: 40, verse_count: 1213 },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockBooks);

      const books = await bibleService.getAllBooks();

      expect(books).toEqual(mockBooks);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM books ORDER BY id');
    });

    it('should return empty array if no books found', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const books = await bibleService.getAllBooks();

      expect(books).toEqual([]);
    });
  });

  describe('getBooksByTestament', () => {
    it('should return Old Testament books', async () => {
      const mockOTBooks = [
        { id: 1, name_telugu: 'ఆదికాండము', name_english: 'Genesis', testament: 'OT', chapter_count: 50, verse_count: 1533 },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockOTBooks);

      const books = await bibleService.getBooksByTestament('OT');

      expect(books).toEqual(mockOTBooks);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM books WHERE testament = ? ORDER BY id',
        ['OT']
      );
    });

    it('should return New Testament books', async () => {
      const mockNTBooks = [
        { id: 40, name_telugu: 'మత్తయి', name_english: 'Matthew', testament: 'NT', chapter_count: 28, verse_count: 1071 },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockNTBooks);

      const books = await bibleService.getBooksByTestament('NT');

      expect(books).toEqual(mockNTBooks);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM books WHERE testament = ? ORDER BY id',
        ['NT']
      );
    });
  });

  describe('getVerses', () => {
    it('should return verses for a specific chapter', async () => {
      const mockVerses = [
        { id: 1, book_id: 43, chapter: 3, verse: 16, text: 'దేవుడు లోకమును ఎంతో ప్రేమించెను' },
        { id: 2, book_id: 43, chapter: 3, verse: 17, text: 'దేవుడు లోకమును తీర్పుకొరకు తన కుమారుని పంపలేదు' },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockVerses);

      const verses = await bibleService.getVerses(43, 3);

      expect(verses).toEqual(mockVerses);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse',
        [43, 3]
      );
    });

    it('should return empty array for non-existent chapter', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const verses = await bibleService.getVerses(43, 999);

      expect(verses).toEqual([]);
    });
  });

  describe('searchVerses', () => {
    it('should search verses using FTS5', async () => {
      const mockResults = [
        { id: 1, book_id: 43, chapter: 3, verse: 16, text: 'దేవుడు లోకమును ఎంతో ప్రేమించెను' },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockResults);

      const results = await bibleService.searchVerses('ప్రేమ', 50, 0);

      expect(results).toEqual(mockResults);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('verses_fts MATCH'),
        ['ప్రేమ', 50, 0]
      );
    });

    it('should limit search results', async () => {
      const mockResults = Array(10).fill({ id: 1, book_id: 1, chapter: 1, verse: 1, text: 'test' });

      mockDb.getAllAsync.mockResolvedValue(mockResults);

      const results = await bibleService.searchVerses('test', 10, 0);

      expect(results.length).toBe(10);
    });

    it('should handle offset for pagination', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await bibleService.searchVerses('test', 50, 100);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['test', 50, 100]
      );
    });
  });

  describe('getChapterCount', () => {
    it('should return chapter count for a book', async () => {
      const mockBook = {
        id: 1,
        name_telugu: 'ఆదికాండము',
        name_english: 'Genesis',
        testament: 'OT',
        chapter_count: 50,
        verse_count: 1533,
      };

      mockDb.getFirstAsync.mockResolvedValue(mockBook);

      const count = await bibleService.getChapterCount(1);

      expect(count).toBe(50);
    });

    it('should return 0 for non-existent book', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const count = await bibleService.getChapterCount(999);

      expect(count).toBe(0);
    });
  });

  describe('getVerseCount', () => {
    it('should return verse count for a chapter', async () => {
      const mockResult = { count: 31 };

      mockDb.getFirstAsync.mockResolvedValue(mockResult);

      const count = await bibleService.getVerseCount(1, 1);

      expect(count).toBe(31);
    });

    it('should return 0 for non-existent chapter', async () => {
      const mockResult = { count: 0 };

      mockDb.getFirstAsync.mockResolvedValue(mockResult);

      const count = await bibleService.getVerseCount(1, 999);

      expect(count).toBe(0);
    });
  });
});
