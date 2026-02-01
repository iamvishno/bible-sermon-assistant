/**
 * Sermon Viewer Screen
 * View, edit, and share generated sermons
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Sermon } from '../types';
import { useSermonStore } from '../stores/sermonStore';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SermonViewer'
>;

interface SermonViewerScreenProps {
  route: {
    params: {
      sermonId: string;
    };
  };
}

export const SermonViewerScreen: React.FC<SermonViewerScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { sermonId } = route.params;

  const { getSermon, updateSermon, deleteSermon, currentSermon } =
    useSermonStore();

  const [isLoading, setIsLoading] = useState(true);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    loadSermon();
  }, [sermonId]);

  const loadSermon = async () => {
    setIsLoading(true);
    const loadedSermon = await getSermon(sermonId);
    if (loadedSermon) {
      setSermon(loadedSermon);
      setEditedTitle(loadedSermon.title);
    } else {
      Alert.alert('Error', 'Sermon not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
    setIsLoading(false);
  };

  const handleShare = async () => {
    if (!sermon) return;

    const shareText = formatSermonForSharing(sermon);

    try {
      await Share.share({
        message: shareText,
        title: sermon.title,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share sermon');
    }
  };

  const formatSermonForSharing = (sermon: Sermon): string => {
    let text = `${sermon.title}\n\n`;

    if (sermon.content.introduction) {
      text += `Introduction:\n${sermon.content.introduction}\n\n`;
    }

    if (sermon.content.main_points && sermon.content.main_points.length > 0) {
      text += 'Main Points:\n';
      sermon.content.main_points.forEach((point, index) => {
        text += `\n${index + 1}. ${point.point}\n`;
        if (point.explanation) {
          text += `   ${point.explanation}\n`;
        }
      });
      text += '\n';
    }

    if (sermon.content.application) {
      text += `Application:\n${sermon.content.application}\n\n`;
    }

    if (sermon.content.conclusion) {
      text += `Conclusion:\n${sermon.content.conclusion}\n\n`;
    }

    if (sermon.content.prayer_points && sermon.content.prayer_points.length > 0) {
      text += 'Prayer Points:\n';
      sermon.content.prayer_points.forEach((point, index) => {
        text += `${index + 1}. ${point}\n`;
      });
    }

    text += '\n---\nGenerated with Bible Sermon Assistant';

    return text;
  };

  const handleSaveTitle = async () => {
    if (!sermon || editedTitle === sermon.title) {
      setIsEditingTitle(false);
      return;
    }

    const success = await updateSermon(sermon.id, { title: editedTitle });
    if (success) {
      setSermon({ ...sermon, title: editedTitle });
      setIsEditingTitle(false);
    } else {
      Alert.alert('Error', 'Failed to update title');
    }
  };

  const handleDelete = () => {
    if (!sermon) return;

    Alert.alert(
      'Delete Sermon',
      'Are you sure you want to delete this sermon? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSermon(sermon.id);
            if (success) {
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete sermon');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading sermon...</Text>
      </View>
    );
  }

  if (!sermon) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Sermon not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          {isEditingTitle ? (
            <View>
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                autoFocus
                multiline
              />
              <View style={styles.titleActions}>
                <TouchableOpacity
                  style={styles.titleButton}
                  onPress={() => {
                    setEditedTitle(sermon.title);
                    setIsEditingTitle(false);
                  }}
                >
                  <Text style={styles.titleButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.titleButton, styles.titleButtonSave]}
                  onPress={handleSaveTitle}
                >
                  <Text style={[styles.titleButtonText, styles.titleButtonTextSave]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text style={styles.title}>{sermon.title}</Text>
              <Text style={styles.editHint}>Tap to edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Metadata */}
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataText}>
            {sermon.sermon_type.charAt(0).toUpperCase() + sermon.sermon_type.slice(1)} •{' '}
            {sermon.target_audience.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Text>
          <Text style={styles.metadataText}>
            {new Date(sermon.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Introduction */}
        {sermon.content.introduction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.sectionText}>{sermon.content.introduction}</Text>
          </View>
        )}

        {/* Main Points */}
        {sermon.content.main_points && sermon.content.main_points.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Main Points</Text>
            {sermon.content.main_points.map((point, index) => (
              <View key={index} style={styles.pointContainer}>
                <Text style={styles.pointNumber}>{index + 1}.</Text>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>{point.point}</Text>
                  {point.explanation && (
                    <Text style={styles.pointText}>{point.explanation}</Text>
                  )}
                  {point.illustration && (
                    <View style={styles.illustrationBox}>
                      <Text style={styles.illustrationLabel}>💡 Illustration:</Text>
                      <Text style={styles.illustrationText}>
                        {point.illustration}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Application */}
        {sermon.content.application && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application</Text>
            <Text style={styles.sectionText}>{sermon.content.application}</Text>
          </View>
        )}

        {/* Conclusion */}
        {sermon.content.conclusion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conclusion</Text>
            <Text style={styles.sectionText}>{sermon.content.conclusion}</Text>
          </View>
        )}

        {/* Prayer Points */}
        {sermon.content.prayer_points && sermon.content.prayer_points.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer Points</Text>
            {sermon.content.prayer_points.map((point, index) => (
              <Text key={index} style={styles.prayerPoint}>
                • {point}
              </Text>
            ))}
          </View>
        )}

        {/* Source Verses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Source Verses</Text>
          {sermon.source_verses.map((verse, index) => (
            <Text key={index} style={styles.verseText}>
              • Book {verse.book_id}, Chapter {verse.chapter}, Verse{' '}
              {verse.verse_start}
              {verse.verse_end && verse.verse_end !== verse.verse_start
                ? `-${verse.verse_end}`
                : ''}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  editHint: {
    fontSize: 12,
    color: '#999',
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  titleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  titleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  titleButtonSave: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  titleButtonText: {
    fontSize: 14,
    color: '#666',
  },
  titleButtonTextSave: {
    color: '#fff',
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  pointContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pointNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  pointContent: {
    flex: 1,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  pointText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  illustrationBox: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  illustrationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  illustrationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  prayerPoint: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '500',
  },
});
