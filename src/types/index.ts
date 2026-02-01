// Core domain types
export interface Book {
  id: number;
  name_telugu: string;
  name_english: string;
  testament: 'OT' | 'NT';
  chapter_count: number;
  verse_count: number;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface VerseReference {
  book_id: number;
  chapter: number;
  verse_start: number;
  verse_end?: number;
}

// User data types
export interface Bookmark {
  id: string;
  user_id: string;
  book_id: number;
  chapter: number;
  verse: number;
  note?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

export interface Highlight {
  id: string;
  user_id: string;
  book_id: number;
  chapter: number;
  verse_start: number;
  verse_end: number;
  color: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

export interface VerseNote {
  id: string;
  user_id: string;
  book_id: number;
  chapter: number;
  verse: number;
  content: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}

// Sermon types
export type SermonType = 'expository' | 'topical' | 'narrative' | 'devotional';
export type TargetAudience = 'general' | 'youth' | 'children' | 'adults' | 'seniors';
export type SermonLength = 10 | 15 | 20 | 30 | 45;

export interface SermonConfig {
  sermon_type: SermonType;
  target_audience: TargetAudience;
  length_minutes: SermonLength;
  tone?: 'formal' | 'casual' | 'passionate' | 'gentle';
  include_illustrations?: boolean;
}

export interface SermonPoint {
  point: string;
  explanation: string;
  illustration?: string;
}

export interface SermonContent {
  title: string;
  introduction: string;
  main_points: SermonPoint[];
  application: string;
  conclusion: string;
  prayer_points: string[];
}

export interface Sermon {
  id: string;
  user_id: string;
  title: string;
  content: SermonContent;
  source_verses: VerseReference[];
  sermon_type: SermonType;
  target_audience: TargetAudience;
  language: string;
  ai_model_used?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  sync_status?: SyncStatus;
}

// Subscription types
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'ministry';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface UserProfile {
  id: string;
  display_name: string;
  email?: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  ai_quota_monthly: number;
  ai_quota_used: number;
  ai_quota_reset_at: string;
  preferences: UserPreferences;
  created_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  font_size: number;
  language: string;
  default_sermon_type?: SermonType;
  default_audience?: TargetAudience;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  platform: 'google_play' | 'razorpay';
  platform_subscription_id: string;
  amount_cents: number;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string;
}

// Sync types
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'error';

export interface SyncOperation {
  id: string;
  user_id: string;
  entity_type: 'sermon' | 'bookmark' | 'highlight' | 'note';
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  client_timestamp: string;
  processed: boolean;
}

export interface SyncMetadata {
  entity_type: string;
  last_sync_at?: string;
  last_sync_token?: string;
}

// API types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface GenerateSermonRequest {
  verses: VerseReference[];
  config: SermonConfig;
}

export interface GenerateSermonResponse {
  sermon: Sermon;
  quota_remaining: number;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  BibleBookList: undefined;
  BibleReader: {
    book_id?: number;
    chapter?: number;
  };
  BibleSearch: undefined;
  SermonsList: undefined;
  SermonConfig: {
    verses: VerseReference[];
  };
  SermonGenerator: {
    verses: VerseReference[];
    config: SermonConfig;
  };
  SermonViewer: {
    sermonId: string;
  };
  Bookmarks: undefined;
  Notes: undefined;
  Profile: undefined;
  Pricing: undefined;
};
