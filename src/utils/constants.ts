import { SubscriptionTier } from '../types';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Subscription Configuration
export const SUBSCRIPTION_CONFIG: Record<
  SubscriptionTier,
  {
    quota: number;
    model: string;
    price_monthly?: number;
    features: string[];
  }
> = {
  free: {
    quota: 3,
    model: 'gpt-3.5-turbo',
    features: [
      '3 AI sermons per month',
      'Basic sermon style',
      'Telugu only',
      'Ads supported',
      'No cloud sync',
    ],
  },
  basic: {
    quota: 30,
    model: 'gpt-3.5-turbo',
    price_monthly: 4.99,
    features: [
      '30 AI sermons per month',
      '3 sermon styles',
      'Telugu + 2 languages',
      'Ad-free experience',
      'Cloud sync enabled',
      'Basic PDF export',
    ],
  },
  premium: {
    quota: 100,
    model: 'gpt-4',
    price_monthly: 9.99,
    features: [
      '100 AI sermons per month',
      '10+ sermon styles',
      'All languages',
      'Ad-free experience',
      'Cloud sync enabled',
      'Branded PDF export',
      'Priority support',
    ],
  },
  ministry: {
    quota: -1, // Unlimited
    model: 'gpt-4',
    price_monthly: 29.99,
    features: [
      'Unlimited AI sermons',
      '10+ sermon styles',
      'All languages',
      'Ad-free experience',
      'Cloud sync enabled',
      'Branded PDF export',
      '10 team seats',
      'Priority support',
      'Bulk generation',
    ],
  },
};

// Google Play Product IDs
export const PLAY_STORE_PRODUCTS = {
  BASIC: 'bible_sermon_basic_monthly',
  PREMIUM: 'bible_sermon_premium_monthly',
  MINISTRY: 'bible_sermon_ministry_monthly',
};

// Sync Configuration
export const SYNC_CONFIG = {
  INTERVAL_MS: 30000, // 30 seconds
  BATCH_SIZE: 50,
  MAX_RETRIES: 3,
};

// Bible Configuration
export const BIBLE_CONFIG = {
  DEFAULT_FONT_SIZE: 16,
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 24,
  VERSES_PER_PAGE: 20,
};

// Highlight Colors
export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Purple', value: '#9C27B0' },
];

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  AUTH_TOKEN: 'auth_token',
  BIBLE_PROGRESS: 'bible_progress',
  APP_SETTINGS: 'app_settings',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  QUOTA_EXCEEDED: 'You have reached your monthly AI generation limit. Upgrade to continue.',
  SYNC_FAILED: 'Failed to sync data. Will retry automatically.',
  SERMON_GENERATION_FAILED: 'Failed to generate sermon. Please try again.',
  SUBSCRIPTION_FAILED: 'Subscription purchase failed. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKMARK_ADDED: 'Bookmark added successfully',
  HIGHLIGHT_ADDED: 'Highlight added successfully',
  NOTE_SAVED: 'Note saved successfully',
  SERMON_SAVED: 'Sermon saved successfully',
  SUBSCRIPTION_SUCCESS: 'Subscription activated successfully',
};
