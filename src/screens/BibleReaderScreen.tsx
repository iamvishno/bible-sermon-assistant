/**
 * Bible Reader Screen
 * Displays Bible verses with navigation and selection capabilities
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useBibleStore } from '../stores/bibleStore';
import { Verse } from '../types';

interface BibleReaderScreenProps {
  navigation: any;
  route: {
    params?: {
      book_id?: number;
      chapter?: number;
    };
  };
}

export const BibleReaderScreen: React.FC<BibleReaderScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    selectedBook,
    selectedChapter,
    currentVerses,
    selectedVerses,
    fontSize,
    isLoading,
    selectBook,
    selectChapter,
    toggleVerseSelection,
  } = useBibleStore();

  const bookId = route.params?.book_id;
  const chapter = route.params?.chapter;

  useEffect(() => {
    if (bookId && bookId !== selectedBook?.id) {
      selectBook(bookId);
    }
  }, [bookId]);

  useEffect(() => {
    if (chapter && chapter !== selectedChapter && selectedBook) {
      selectChapter(chapter);
    }
  }, [chapter, selectedBook]);

  const handleVersePress = (verse: Verse) => {
    toggleVerseSelection(verse.id);
  };

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      selectChapter(selectedChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (selectedBook && selectedChapter < selectedBook.chapter_count) {
      selectChapter(selectedChapter + 1);
    }
  };

  const renderVerse = ({ item }: { item: Verse }) => {
    const isSelected = selectedVerses.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.verseContainer, isSelected && styles.verseSelected]}
        onPress={() => handleVersePress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.verseNumber}>{item.verse}</Text>
        <Text style={[styles.verseText, { fontSize }]}>{item.text}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading chapter...</Text>
      </SafeAreaView>
    );
  }

  if (!selectedBook) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>No book selected</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BibleBookList')}
        >
          <Text style={styles.buttonText}>Select a Book</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedBook.name_telugu} {selectedChapter}
        </Text>
        <Text style={styles.headerSubtitle}>
          {selectedBook.name_english} {selectedChapter}
        </Text>
      </View>

      {/* Verses */}
      <FlatList
        data={currentVerses}
        renderItem={renderVerse}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.versesContainer}
      />

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            selectedChapter === 1 && styles.navButtonDisabled,
          ]}
          onPress={handlePreviousChapter}
          disabled={selectedChapter === 1}
        >
          <Text
            style={[
              styles.navButtonText,
              selectedChapter === 1 && styles.navButtonTextDisabled,
            ]}
          >
            ← Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.chapterIndicator}>
          Chapter {selectedChapter} of {selectedBook.chapter_count}
        </Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            selectedChapter === selectedBook.chapter_count &&
              styles.navButtonDisabled,
          ]}
          onPress={handleNextChapter}
          disabled={selectedChapter === selectedBook.chapter_count}
        >
          <Text
            style={[
              styles.navButtonText,
              selectedChapter === selectedBook.chapter_count &&
                styles.navButtonTextDisabled,
            ]}
          >
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Bar (when verses selected) */}
      {selectedVerses.size > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.actionBarText}>
            {selectedVerses.size} verse{selectedVerses.size !== 1 ? 's' : ''}{' '}
            selected
          </Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Generate Sermon</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  versesContainer: {
    padding: 16,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  verseSelected: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 12,
    minWidth: 24,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  chapterIndicator: {
    fontSize: 14,
    color: '#666',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  actionBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});
