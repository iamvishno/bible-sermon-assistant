/**
 * Subscription Service - Handles in-app purchases and subscriptions
 * Integrates with Google Play Billing via react-native-iap
 */

import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  type ProductPurchase,
  type SubscriptionPurchase,
  type PurchaseError,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import { PLAY_STORE_PRODUCTS } from '../utils/constants';
import type { SubscriptionTier } from '../types';

// Product IDs for Google Play
const PRODUCT_IDS = {
  basic: PLAY_STORE_PRODUCTS.BASIC,
  premium: PLAY_STORE_PRODUCTS.PREMIUM,
  ministry: PLAY_STORE_PRODUCTS.MINISTRY,
};

interface SubscriptionProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  tier: SubscriptionTier;
}

class SubscriptionService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private onPurchaseSuccess: ((purchase: SubscriptionPurchase) => void) | null = null;
  private onPurchaseError: ((error: PurchaseError) => void) | null = null;

  /**
   * Initialize IAP connection
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing IAP connection...');
      await initConnection();
      console.log('IAP connection initialized');

      // Set up purchase listeners
      this.setupListeners();
    } catch (error: any) {
      console.error('Failed to initialize IAP:', error);
      throw new Error('Failed to initialize in-app purchases');
    }
  }

  /**
   * Set up purchase update and error listeners
   */
  private setupListeners(): void {
    // Purchase success listener
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: SubscriptionPurchase | ProductPurchase) => {
        console.log('Purchase updated:', purchase);

        try {
          // Verify receipt with backend
          const isValid = await this.verifyReceipt(purchase);

          if (isValid) {
            // Finish transaction
            await finishTransaction({ purchase, isConsumable: false });

            // Notify success callback
            if (this.onPurchaseSuccess) {
              this.onPurchaseSuccess(purchase as SubscriptionPurchase);
            }
          } else {
            throw new Error('Receipt verification failed');
          }
        } catch (error: any) {
          console.error('Error processing purchase:', error);
          if (this.onPurchaseError) {
            this.onPurchaseError({
              code: 'PROCESSING_ERROR',
              message: error.message,
            } as PurchaseError);
          }
        }
      }
    );

    // Purchase error listener
    this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.error('Purchase error:', error);
      if (this.onPurchaseError) {
        this.onPurchaseError(error);
      }
    });
  }

  /**
   * Get available subscription products
   */
  async getProducts(): Promise<SubscriptionProduct[]> {
    try {
      const products = await getSubscriptions({
        skus: Object.values(PRODUCT_IDS),
      });

      return products.map((product) => ({
        productId: product.productId,
        title: product.title,
        description: product.description,
        price: product.localizedPrice,
        currency: product.currency,
        tier: this.getTierFromProductId(product.productId),
      }));
    } catch (error: any) {
      console.error('Failed to get products:', error);
      throw new Error('Failed to load subscription plans');
    }
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(
    tier: SubscriptionTier,
    onSuccess: (purchase: SubscriptionPurchase) => void,
    onError: (error: PurchaseError) => void
  ): Promise<void> {
    try {
      // Set callbacks
      this.onPurchaseSuccess = onSuccess;
      this.onPurchaseError = onError;

      // Get product ID for tier
      const productId = this.getProductIdForTier(tier);

      if (!productId) {
        throw new Error('Invalid subscription tier');
      }

      console.log('Requesting subscription:', productId);

      // Request purchase
      await requestSubscription({
        sku: productId,
        ...(Platform.OS === 'android' && {
          subscriptionOffers: [
            {
              sku: productId,
              offerToken: '', // Will be populated by Google Play
            },
          ],
        }),
      });
    } catch (error: any) {
      console.error('Failed to purchase subscription:', error);
      onError({
        code: 'PURCHASE_FAILED',
        message: error.message,
      } as PurchaseError);
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<SubscriptionPurchase[]> {
    try {
      console.log('Restoring purchases...');
      const purchases = await getAvailablePurchases();

      // Filter to only subscriptions
      const subscriptions = purchases.filter(
        (p) => Object.values(PRODUCT_IDS).includes(p.productId)
      ) as SubscriptionPurchase[];

      console.log('Restored purchases:', subscriptions.length);
      return subscriptions;
    } catch (error: any) {
      console.error('Failed to restore purchases:', error);
      throw new Error('Failed to restore purchases');
    }
  }

  /**
   * Verify receipt with backend
   */
  private async verifyReceipt(purchase: SubscriptionPurchase | ProductPurchase): Promise<boolean> {
    try {
      // TODO: Call backend API to verify receipt
      // For now, return true (will implement backend endpoint)
      console.log('Verifying receipt:', purchase.transactionReceipt);

      // Backend endpoint: POST /api/v1/subscriptions/verify
      // Body: { receipt: purchase.transactionReceipt, platform: 'android' }
      // Response: { valid: true, tier: 'premium', expires_at: '...' }

      return true;
    } catch (error: any) {
      console.error('Receipt verification failed:', error);
      return false;
    }
  }

  /**
   * Get tier from product ID
   */
  private getTierFromProductId(productId: string): SubscriptionTier {
    switch (productId) {
      case PRODUCT_IDS.basic:
        return 'basic';
      case PRODUCT_IDS.premium:
        return 'premium';
      case PRODUCT_IDS.ministry:
        return 'ministry';
      default:
        return 'free';
    }
  }

  /**
   * Get product ID for tier
   */
  private getProductIdForTier(tier: SubscriptionTier): string | null {
    switch (tier) {
      case 'basic':
        return PRODUCT_IDS.basic;
      case 'premium':
        return PRODUCT_IDS.premium;
      case 'ministry':
        return PRODUCT_IDS.ministry;
      default:
        return null;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const purchases = await this.restorePurchases();
      return purchases.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current subscription tier
   */
  async getCurrentTier(): Promise<SubscriptionTier> {
    try {
      const purchases = await this.restorePurchases();

      if (purchases.length === 0) {
        return 'free';
      }

      // Get highest tier from active purchases
      const tiers = purchases.map((p) => this.getTierFromProductId(p.productId));

      if (tiers.includes('ministry')) return 'ministry';
      if (tiers.includes('premium')) return 'premium';
      if (tiers.includes('basic')) return 'basic';

      return 'free';
    } catch (error) {
      return 'free';
    }
  }

  /**
   * Cleanup IAP connection
   */
  async cleanup(): Promise<void> {
    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }

      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      await endConnection();
      console.log('IAP connection closed');
    } catch (error: any) {
      console.error('Failed to cleanup IAP:', error);
    }
  }
}

// Singleton instance
let subscriptionServiceInstance: SubscriptionService | null = null;

export const getSubscriptionService = (): SubscriptionService => {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new SubscriptionService();
  }
  return subscriptionServiceInstance;
};

export default SubscriptionService;
