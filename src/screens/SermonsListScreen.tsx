/**
 * Sermons List Screen
 * Display all user-generated sermons with search and filter
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Sermon } from '../types';
import { useSermonStore } from '../stores/sermonStore';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SermonsList'
>;

export const SermonsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { sermons, loadSermons, quota, loadQuota } = useSermonStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadSermons(), loadQuota()]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderSermonCard = ({ item }: { item: Sermon }) => {
    const date = new Date(item.created_at).toLocaleDateString();
    const preview = item.content.introduction
      ? item.content.introduction.substring(0, 100) + '...'
      : 'No preview available';

    return (
      <TouchableOpacity
        style={styles.sermonCard}
        onPress={() => navigation.navigate('SermonViewer', { sermonId: item.id })}
      >
        <View style={styles.sermonHeader}>
          <Text style={styles.sermonTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.sermonDate}>{date}</Text>
        </View>
        <Text style={styles.sermonPreview} numberOfLines={3}>
          {preview}
        </Text>
        <View style={styles.sermonMeta}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {item.sermon_type.charAt(0).toUpperCase() + item.sermon_type.slice(1)}
            </Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {item.target_audience.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📖</Text>
        <Text style={styles.emptyTitle}>No Sermons Yet</Text>
        <Text style={styles.emptyText}>
          Generate your first AI-powered sermon from Bible verses
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('BibleBookList')}
        >
          <Text style={styles.emptyButtonText}>Browse Bible</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Quota Header */}
      {quota && (
        <View style={styles.quotaHeader}>
          <View>
            <Text style={styles.quotaLabel}>AI Generations</Text>
            <Text style={styles.quotaValue}>
              {quota.unlimited
                ? 'Unlimited'
                : `${quota.quota_remaining} / ${quota.quota_monthly} remaining`}
            </Text>
          </View>
          {!quota.unlimited && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Pricing')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sermons List */}
      <FlatList
        data={sermons}
        renderItem={renderSermonCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          sermons.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quotaLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  quotaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  sermonCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sermonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sermonTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  sermonDate: {
    fontSize: 12,
    color: '#999',
  },
  sermonPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  sermonMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
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
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
