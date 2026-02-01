/**
 * Profile Screen - User profile and settings
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { SUBSCRIPTION_CONFIG } from '../utils/constants';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const {
    user,
    profile,
    isGuest,
    signOut,
    refreshProfile,
  } = useAuthStore();

  useEffect(() => {
    if (user && !isGuest) {
      refreshProfile();
    }
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.replace('Auth');
        },
      },
    ]);
  };

  const handleUpgrade = () => {
    navigation.navigate('Pricing');
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestText}>
            Sign in to sync your data across devices and unlock premium features.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Profile not loaded</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshProfile}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tierConfig = SUBSCRIPTION_CONFIG[profile.subscription_tier];
  const quotaRemaining = profile.ai_quota_monthly - profile.ai_quota_used;
  const quotaPercent =
    profile.ai_quota_monthly > 0
      ? (profile.ai_quota_used / profile.ai_quota_monthly) * 100
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile.display_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Subscription Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Subscription</Text>
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: getTierColor(profile.subscription_tier) },
              ]}
            >
              <Text style={styles.tierText}>
                {profile.subscription_tier.toUpperCase()}
              </Text>
            </View>
          </View>

          {tierConfig.price_monthly && (
            <Text style={styles.cardPrice}>
              ${tierConfig.price_monthly}/month
            </Text>
          )}

          <View style={styles.featuresContainer}>
            {tierConfig.features.slice(0, 3).map((feature, index) => (
              <Text key={index} style={styles.feature}>
                • {feature}
              </Text>
            ))}
          </View>

          {profile.subscription_tier === 'free' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AI Quota Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Sermon Quota</Text>

          <View style={styles.quotaContainer}>
            <Text style={styles.quotaText}>
              {profile.ai_quota_monthly === -1
                ? 'Unlimited'
                : `${quotaRemaining} of ${profile.ai_quota_monthly} remaining`}
            </Text>

            {profile.ai_quota_monthly > 0 && (
              <View style={styles.quotaBar}>
                <View
                  style={[
                    styles.quotaBarFill,
                    {
                      width: `${quotaPercent}%`,
                      backgroundColor:
                        quotaPercent > 90
                          ? '#FF3B30'
                          : quotaPercent > 70
                          ? '#FF9500'
                          : '#34C759',
                    },
                  ]}
                />
              </View>
            )}

            <Text style={styles.quotaReset}>
              Resets: {new Date(profile.ai_quota_reset_at).toLocaleDateString()}
            </Text>
          </View>

          {quotaRemaining === 0 && profile.subscription_tier === 'free' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>
                Upgrade for More Quota
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Theme</Text>
            <Text style={styles.settingValue}>
              {profile.preferences.theme}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Font Size</Text>
            <Text style={styles.settingValue}>
              {profile.preferences.font_size}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Language</Text>
            <Text style={styles.settingValue}>
              {profile.preferences.language}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'free':
      return '#8E8E93';
    case 'basic':
      return '#007AFF';
    case 'premium':
      return '#FF9500';
    case 'ministry':
      return '#5856D6';
    default:
      return '#8E8E93';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  featuresContainer: {
    marginBottom: 12,
  },
  feature: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quotaContainer: {
    marginBottom: 12,
  },
  quotaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  quotaBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  quotaBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  quotaReset: {
    fontSize: 12,
    color: '#999',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontSize: 16,
    color: '#000',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  guestText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
