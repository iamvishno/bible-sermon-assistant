/**
 * Sermon Config Screen
 * Configure sermon generation parameters before generating
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, SermonConfig, VerseReference } from '../types';
import { useSermonStore } from '../stores/sermonStore';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SermonConfig'
>;

interface SermonConfigScreenProps {
  route: {
    params: {
      verses: VerseReference[];
    };
  };
}

export const SermonConfigScreen: React.FC<SermonConfigScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { verses } = route.params;
  const { quota } = useSermonStore();

  // Configuration state
  const [sermonType, setSermonType] = useState<SermonConfig['sermon_type']>('expository');
  const [targetAudience, setTargetAudience] = useState<SermonConfig['target_audience']>('general');
  const [lengthMinutes, setLengthMinutes] = useState<number>(20);
  const [tone, setTone] = useState<SermonConfig['tone']>('formal');
  const [includeIllustrations, setIncludeIllustrations] = useState<boolean>(true);

  const handleGenerate = () => {
    // Check quota
    if (quota && !quota.unlimited && quota.quota_remaining <= 0) {
      Alert.alert(
        'Quota Exceeded',
        `You have used all ${quota.quota_monthly} AI generations for this month. Upgrade your subscription to generate more sermons.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Pricing'),
          },
        ]
      );
      return;
    }

    const config: SermonConfig = {
      sermon_type: sermonType,
      target_audience: targetAudience,
      length_minutes: lengthMinutes,
      tone,
      include_illustrations: includeIllustrations,
    };

    navigation.navigate('SermonGenerator', { verses, config });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Quota Display */}
        {quota && (
          <View style={styles.quotaCard}>
            <Text style={styles.quotaTitle}>AI Generations</Text>
            <Text style={styles.quotaText}>
              {quota.unlimited
                ? 'Unlimited'
                : `${quota.quota_remaining} / ${quota.quota_monthly} remaining`}
            </Text>
            {!quota.unlimited && quota.quota_remaining <= 3 && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate('Pricing')}
              >
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sermon Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sermon Type</Text>
          <View style={styles.optionsGrid}>
            {(['expository', 'topical', 'textual', 'narrative'] as const).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionCard,
                    sermonType === type && styles.optionCardSelected,
                  ]}
                  onPress={() => setSermonType(type)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      sermonType === type && styles.optionTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Target Audience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Audience</Text>
          <View style={styles.optionsGrid}>
            {(['general', 'youth', 'children', 'elderly', 'new_believers'] as const).map(
              (audience) => (
                <TouchableOpacity
                  key={audience}
                  style={[
                    styles.optionCard,
                    targetAudience === audience && styles.optionCardSelected,
                  ]}
                  onPress={() => setTargetAudience(audience)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      targetAudience === audience && styles.optionTextSelected,
                    ]}
                  >
                    {audience.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Length */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sermon Length</Text>
          <View style={styles.optionsGrid}>
            {[10, 15, 20, 30, 45].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.optionCard,
                  lengthMinutes === minutes && styles.optionCardSelected,
                ]}
                onPress={() => setLengthMinutes(minutes)}
              >
                <Text
                  style={[
                    styles.optionText,
                    lengthMinutes === minutes && styles.optionTextSelected,
                  ]}
                >
                  {minutes} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tone</Text>
          <View style={styles.optionsGrid}>
            {(['formal', 'conversational', 'pastoral', 'teaching'] as const).map(
              (toneOption) => (
                <TouchableOpacity
                  key={toneOption}
                  style={[
                    styles.optionCard,
                    tone === toneOption && styles.optionCardSelected,
                  ]}
                  onPress={() => setTone(toneOption)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      tone === toneOption && styles.optionTextSelected,
                    ]}
                  >
                    {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Include Illustrations */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIncludeIllustrations(!includeIllustrations)}
          >
            <View
              style={[
                styles.checkbox,
                includeIllustrations && styles.checkboxChecked,
              ]}
            >
              {includeIllustrations && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Include Illustrations</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Verses Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Verses</Text>
          <View style={styles.versesCard}>
            {verses.map((verse, index) => (
              <Text key={index} style={styles.verseText}>
                • Book {verse.book_id}, Chapter {verse.chapter}, Verse{' '}
                {verse.verse_start}
                {verse.verse_end && verse.verse_end !== verse.verse_start
                  ? `-${verse.verse_end}`
                  : ''}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Generate Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
        >
          <Text style={styles.generateButtonText}>Generate Sermon</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  quotaCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quotaTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quotaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  upgradeButton: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 100,
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  versesCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  verseText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
