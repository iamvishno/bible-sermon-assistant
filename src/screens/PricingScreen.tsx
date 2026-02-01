/**
 * Pricing Screen
 * Display subscription tiers and handle purchases
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, SubscriptionTier } from '../types';
import { getSubscriptionService } from '../services/SubscriptionService';
import { useAuthStore } from '../stores/authStore';
import type { SubscriptionPurchase } from 'react-native-iap';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pricing'>;

interface SubscriptionTierInfo {
  tier: SubscriptionTier;
  name: string;
  price: string;
  pricePerMonth?: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const TIERS: SubscriptionTierInfo[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '₹0',
    features: [
      '3 AI sermon generations per month',
      'Basic sermon types',
      'Telugu language only',
      'Ads supported',
      'Local storage only',
    ],
    color: '#9E9E9E',
  },
  {
    tier: 'basic',
    name: 'Basic',
    price: '$4.99',
    pricePerMonth: '/month',
    features: [
      '30 AI sermon generations per month',
      '3 sermon types',
      'Telugu + 2 languages',
      'No ads',
      'Cloud sync',
      'Basic PDF export',
    ],
    color: '#2196F3',
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: '$9.99',
    pricePerMonth: '/month',
    features: [
      '100 AI sermon generations per month',
      'All sermon types (10+)',
      'All languages',
      'No ads',
      'Cloud sync',
      'Premium PDF export with branding',
      'Priority support',
    ],
    popular: true,
    color: '#4CAF50',
  },
  {
    tier: 'ministry',
    name: 'Ministry',
    price: '$29.99',
    pricePerMonth: '/month',
    features: [
      'Unlimited AI sermon generations',
      'All sermon types',
      'All languages',
      'No ads',
      'Cloud sync',
      'Premium PDF export',
      'Priority support',
      '10 user seats',
      'Ministry dashboard',
      'Bulk generation',
    ],
    color: '#9C27B0',
  },
];

export const PricingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, profile, refreshProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    setIsLoading(true);

    try {
      // Initialize IAP
      const subscriptionService = getSubscriptionService();
      await subscriptionService.initialize();

      // Get current tier
      const tier = await subscriptionService.getCurrentTier();
      setCurrentTier(tier);

      // Load user profile
      await refreshProfile();
    } catch (error: any) {
      console.error('Failed to initialize pricing screen:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (tier: SubscriptionTier) => {
    if (tier === 'free') {
      Alert.alert('Info', 'You are currently on the free tier');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to purchase a subscription', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign In',
          onPress: () => navigation.navigate('Auth'),
        },
      ]);
      return;
    }

    setIsPurchasing(true);
    setSelectedTier(tier);

    try {
      const subscriptionService = getSubscriptionService();

      await subscriptionService.purchaseSubscription(
        tier,
        // Success callback
        async (purchase: SubscriptionPurchase) => {
          console.log('Purchase successful:', purchase);

          Alert.alert(
            'Success!',
            `You are now subscribed to ${TIERS.find((t) => t.tier === tier)?.name} tier`,
            [
              {
                text: 'OK',
                onPress: async () => {
                  // Reload profile to get updated subscription
                  await refreshProfile();
                  setIsPurchasing(false);
                  setSelectedTier(null);
                  navigation.goBack();
                },
              },
            ]
          );
        },
        // Error callback
        (error) => {
          console.error('Purchase failed:', error);

          let errorMessage = 'Failed to complete purchase. Please try again.';

          if (error.code === 'E_USER_CANCELLED') {
            errorMessage = 'Purchase cancelled';
          } else if (error.code === 'E_ALREADY_OWNED') {
            errorMessage = 'You already own this subscription';
          }

          Alert.alert('Purchase Failed', errorMessage);
          setIsPurchasing(false);
          setSelectedTier(null);
        }
      );
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.message || 'Failed to start purchase');
      setIsPurchasing(false);
      setSelectedTier(null);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);

    try {
      const subscriptionService = getSubscriptionService();
      const purchases = await subscriptionService.restorePurchases();

      if (purchases.length === 0) {
        Alert.alert('No Purchases', 'No previous purchases found');
      } else {
        Alert.alert(
          'Success',
          `Restored ${purchases.length} purchase(s). Your subscription has been restored.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                await refreshProfile();
                const tier = await subscriptionService.getCurrentTier();
                setCurrentTier(tier);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTierCard = (tierInfo: SubscriptionTierInfo) => {
    const isCurrent = tierInfo.tier === currentTier;
    const isSelected = tierInfo.tier === selectedTier;

    return (
      <View
        key={tierInfo.tier}
        style={[
          styles.tierCard,
          isCurrent && styles.tierCardCurrent,
          tierInfo.popular && styles.tierCardPopular,
        ]}
      >
        {tierInfo.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={styles.tierHeader}>
          <Text style={styles.tierName}>{tierInfo.name}</Text>
          {isCurrent && <Text style={styles.currentBadge}>Current Plan</Text>}
        </View>

        <View style={styles.tierPricing}>
          <Text style={styles.tierPrice}>{tierInfo.price}</Text>
          {tierInfo.pricePerMonth && (
            <Text style={styles.tierPriceMonth}>{tierInfo.pricePerMonth}</Text>
          )}
        </View>

        <View style={styles.tierFeatures}>
          {tierInfo.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.tierButton,
            { backgroundColor: tierInfo.color },
            isCurrent && styles.tierButtonCurrent,
            (isPurchasing && isSelected) && styles.tierButtonLoading,
          ]}
          onPress={() => handlePurchase(tierInfo.tier)}
          disabled={isCurrent || isPurchasing}
        >
          {isPurchasing && isSelected ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.tierButtonText}>
              {isCurrent ? 'Current Plan' : `Choose ${tierInfo.name}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock powerful AI sermon generation tools
          </Text>
        </View>

        {/* Current Tier Info */}
        {profile && (
          <View style={styles.currentTierCard}>
            <Text style={styles.currentTierLabel}>Your Current Plan</Text>
            <Text style={styles.currentTierName}>
              {TIERS.find((t) => t.tier === currentTier)?.name || 'Free'}
            </Text>
            {profile.ai_quota_monthly > 0 && (
              <Text style={styles.currentTierQuota}>
                {profile.ai_quota_monthly === -1
                  ? 'Unlimited'
                  : `${profile.ai_quota_monthly} generations/month`}
              </Text>
            )}
          </View>
        )}

        {/* Tier Cards */}
        <View style={styles.tiersContainer}>
          {TIERS.map((tier) => renderTierCard(tier))}
        </View>

        {/* Restore Button */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <View style={styles.terms}>
          <Text style={styles.termsText}>
            Subscriptions auto-renew monthly. Cancel anytime in Google Play Store.
          </Text>
          <Text style={styles.termsText}>
            By purchasing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  currentTierCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentTierLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentTierName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  currentTierQuota: {
    fontSize: 14,
    color: '#666',
  },
  tiersContainer: {
    padding: 16,
  },
  tierCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  tierCardCurrent: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  tierCardPopular: {
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  popularText: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  currentBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  tierPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  tierPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
  },
  tierPriceMonth: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  tierFeatures: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureCheck: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 12,
    width: 24,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tierButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tierButtonCurrent: {
    backgroundColor: '#9E9E9E',
  },
  tierButtonLoading: {
    opacity: 0.7,
  },
  tierButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  restoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    padding: 24,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
});
