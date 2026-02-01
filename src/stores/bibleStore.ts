/**
 * Bible Store - Zustand state management for Bible reading
 */

import { create } from 'zustand';
import { Book, Verse } from '../types';
import { bibleService } from '../services/BibleService';

interface BibleState {
  // Books
  books: Book[];
  selectedBook: Book | null;
  selectedChapter: number;
  selectedVerse: number | null;

  // Verses
  currentVerses: Verse[];
  selectedVerses: Set<number>; // Set of verse IDs for multi-selection

  // Reading settings
  fontSize: number;
  theme: 'light' | 'dark';

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBooks: () => Promise<void>;
  selectBook: (bookId: number) => Promise<void>;
  selectChapter: (chapter: number) => Promise<void>;
  selectVerse: (verseId: number) => void;
  toggleVerseSelection: (verseId: number) => void;
  clearVerseSelection: () => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  searchVerses: (query: string) => Promise<Verse[]>;
}

export const useBibleStore = create<BibleState>((set, get) => ({
  // Initial state
  books: [],
  selectedBook: null,
  selectedChapter: 1,
  selectedVerse: null,
  currentVerses: [],
  selectedVerses: new Set<number>(),
  fontSize: 16,
  theme: 'light',
  isLoading: false,
  error: null,

  // Load all books
  loadBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await bibleService.getAllBooks();
      set({ books, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load books',
        isLoading: false,
      });
    }
  },

  // Select a book and load first chapter
  selectBook: async (bookId: number) => {
    set({ isLoading: true, error: null });
    try {
      const book = await bibleService.getBook(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      const verses = await bibleService.getVerses(bookId, 1);

      set({
        selectedBook: book,
        selectedChapter: 1,
        selectedVerse: null,
        currentVerses: verses,
        selectedVerses: new Set<number>(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to select book',
        isLoading: false,
      });
    }
  },

  // Select a chapter and load verses
  selectChapter: async (chapter: number) => {
    const { selectedBook } = get();
    if (!selectedBook) return;

    set({ isLoading: true, error: null });
    try {
      const verses = await bibleService.getVerses(selectedBook.id, chapter);

      set({
        selectedChapter: chapter,
        selectedVerse: null,
        currentVerses: verses,
        selectedVerses: new Set<number>(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load chapter',
        isLoading: false,
      });
    }
  },

  // Select a single verse (replace selection)
  selectVerse: (verseId: number) => {
    set({
      selectedVerse: verseId,
      selectedVerses: new Set([verseId]),
    });
  },

  // Toggle verse in multi-selection
  toggleVerseSelection: (verseId: number) => {
    const { selectedVerses } = get();
    const newSelection = new Set(selectedVerses);

    if (newSelection.has(verseId)) {
      newSelection.delete(verseId);
    } else {
      newSelection.add(verseId);
    }

    set({
      selectedVerses: newSelection,
      selectedVerse: newSelection.size === 1 ? Array.from(newSelection)[0] : null,
    });
  },

  // Clear all verse selections
  clearVerseSelection: () => {
    set({
      selectedVerse: null,
      selectedVerses: new Set<number>(),
    });
  },

  // Update font size
  setFontSize: (size: number) => {
    const clampedSize = Math.max(12, Math.min(24, size));
    set({ fontSize: clampedSize });
  },

  // Update theme
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
  },

  // Search verses
  searchVerses: async (query: string): Promise<Verse[]> => {
    if (!query.trim()) return [];

    set({ isLoading: true, error: null });
    try {
      const results = await bibleService.searchVerses(query, 50, 0);
      set({ isLoading: false });
      return results;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
      });
      return [];
    }
  },
}));
