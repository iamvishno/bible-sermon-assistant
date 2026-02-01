/**
 * Bible Book List Screen
 * Displays list of Bible books organized by testament
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useBibleStore } from '../stores/bibleStore';
import { Book } from '../types';

interface BibleBookListScreenProps {
  navigation: any;
}

export const BibleBookListScreen: React.FC<BibleBookListScreenProps> = ({
  navigation,
}) => {
  const { books, loadBooks, selectBook, isLoading, error } = useBibleStore();
  const [testament, setTestament] = useState<'OT' | 'NT'>('OT');

  useEffect(() => {
    loadBooks();
  }, []);

  const filteredBooks = books.filter((book) => book.testament === testament);

  const handleBookPress = async (book: Book) => {
    await selectBook(book.id);
    navigation.navigate('BibleReader', {
      book_id: book.id,
      chapter: 1,
    });
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => handleBookPress(item)}
    >
      <Text style={styles.bookNameTelugu}>{item.name_telugu}</Text>
      <Text style={styles.bookNameEnglish}>{item.name_english}</Text>
      <Text style={styles.bookStats}>
        {item.chapter_count} chapters • {item.verse_count} verses
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && books.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Bible...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Testament Selector */}
      <View style={styles.testamentSelector}>
        <TouchableOpacity
          style={[
            styles.testamentButton,
            testament === 'OT' && styles.testamentButtonActive,
          ]}
          onPress={() => setTestament('OT')}
        >
          <Text
            style={[
              styles.testamentButtonText,
              testament === 'OT' && styles.testamentButtonTextActive,
            ]}
          >
            Old Testament
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.testamentButton,
            testament === 'NT' && styles.testamentButtonActive,
          ]}
          onPress={() => setTestament('NT')}
        >
          <Text
            style={[
              styles.testamentButtonText,
              testament === 'NT' && styles.testamentButtonTextActive,
            ]}
          >
            New Testament
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  testamentSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  testamentButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  testamentButtonActive: {
    backgroundColor: '#007AFF',
  },
  testamentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  testamentButtonTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
  },
  bookItem: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookNameTelugu: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bookNameEnglish: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookStats: {
    fontSize: 12,
    color: '#999',
  },
});
