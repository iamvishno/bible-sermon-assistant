/**
 * Bible Search Screen
 * Full-text search across the entire Bible using SQLite FTS5
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Verse, Book } from '../types';
import { bibleService } from '../services/BibleService';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BibleSearch'
>;

interface SearchResult extends Verse {
  book_name_telugu: string;
  book_name_english: string;
  snippet: string; // Highlighted search snippet
}

export const BibleSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ot' | 'nt'>('all');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilter]);

  const performSearch = async (query: string) => {
    if (!query) return;

    setIsSearching(true);

    try {
      const searchResults = await bibleService.searchVerses(query, 50);

      // Filter by testament if selected
      let filteredResults = searchResults;
      if (selectedFilter !== 'all') {
        filteredResults = searchResults.filter((verse) => {
          const isOldTestament = verse.book_id <= 39;
          return selectedFilter === 'ot' ? isOldTestament : !isOldTestament;
        });
      }

      // Get book names for results
      const books = await bibleService.getAllBooks();
      const booksMap = new Map(books.map((b) => [b.id, b]));

      const resultsWithBookNames: SearchResult[] = filteredResults.map((verse) => {
        const book = booksMap.get(verse.book_id);
        return {
          ...verse,
          book_name_telugu: book?.name_telugu || '',
          book_name_english: book?.name_english || '',
          snippet: highlightSearchTerms(verse.text, query),
        };
      });

      setResults(resultsWithBookNames);
    } catch (error: any) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const highlightSearchTerms = (text: string, query: string): string => {
    // Create snippet with search term highlighted
    const queryWords = query.toLowerCase().split(' ');
    let snippet = text;

    // Find first occurrence of any query word
    let firstIndex = -1;
    for (const word of queryWords) {
      const index = text.toLowerCase().indexOf(word);
      if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
        firstIndex = index;
      }
    }

    if (firstIndex !== -1) {
      // Create snippet around the match (50 chars before, 100 after)
      const start = Math.max(0, firstIndex - 50);
      const end = Math.min(text.length, firstIndex + 150);
      snippet = text.substring(start, end);

      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
    } else {
      // No match found, just show first 150 chars
      snippet = text.substring(0, 150);
      if (text.length > 150) snippet += '...';
    }

    return snippet;
  };

  const handleResultPress = (result: SearchResult) => {
    Keyboard.dismiss();
    navigation.navigate('BibleReader', {
      book_id: result.book_id,
      chapter: result.chapter,
    });
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => handleResultPress(item)}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultReference}>
            {item.book_name_english} {item.chapter}:{item.verse}
          </Text>
        </View>
        <Text style={styles.resultText}>{item.snippet}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (isSearching) return null;

    if (searchQuery.trim().length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search the Bible</Text>
          <Text style={styles.emptyText}>
            Search for any word or phrase in Telugu across the entire Bible
          </Text>
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Try searching for:</Text>
            <TouchableOpacity
              style={styles.exampleChip}
              onPress={() => setSearchQuery('ప్రేమ')}
            >
              <Text style={styles.exampleText}>ప్రేమ (Love)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exampleChip}
              onPress={() => setSearchQuery('దేవుడు')}
            >
              <Text style={styles.exampleText}>దేవుడు (God)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exampleChip}
              onPress={() => setSearchQuery('విశ్వాసము')}
            >
              <Text style={styles.exampleText}>విశ్వాసము (Faith)</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (searchQuery.trim().length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Enter at least 2 characters to search
          </Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            No verses found matching "{searchQuery}"
          </Text>
          <Text style={styles.emptyHint}>
            Try different words or check your spelling
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Bible verses..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Testament Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'ot' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter('ot')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'ot' && styles.filterTextActive,
              ]}
            >
              Old Testament
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'nt' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter('nt')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'nt' && styles.filterTextActive,
              ]}
            >
              New Testament
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) =>
            `${item.book_id}-${item.chapter}-${item.verse}-${index}`
          }
          contentContainerStyle={
            results.length === 0 ? styles.emptyListContent : styles.listContent
          }
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            results.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#999',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  examplesContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  examplesTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  exampleChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
