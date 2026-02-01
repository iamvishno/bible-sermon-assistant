/**
 * Authentication Service - Handles user authentication with Supabase
 */

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_CONFIG } from '../utils/constants';

class AuthService {
  private supabase: SupabaseClient;
  private sessionKey = 'supabase_session';

  constructor() {
    if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
      console.warn('⚠️ Supabase credentials not configured');
    }

    this.supabase = createClient(
      SUPABASE_CONFIG.URL,
      SUPABASE_CONFIG.ANON_KEY,
      {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );

    console.log('✅ AuthService initialized');
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log('✅ User signed up:', data.user?.id);
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('✅ User signed in:', data.user?.id);
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log('✅ User signed out');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return {
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        throw error;
      }

      return data.session;
    } catch (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return data.user;
    } catch (error) {
      console.error('❌ Get user error:', error);
      return null;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw error;
      }

      console.log('✅ Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return {
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Password updated');
      return { error: null };
    } catch (error) {
      console.error('❌ Update password error:', error);
      return {
        error: error instanceof Error ? error.message : 'Update password failed',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { display_name?: string; email?: string }) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Profile updated');
      return { error: null };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return {
        error: error instanceof Error ? error.message : 'Update profile failed',
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      callback(session?.user || null);
    });

    return data.subscription;
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return {
        profile: null,
        error: error instanceof Error ? error.message : 'Get profile failed',
      };
    }
  }

  /**
   * Update user profile in database
   */
  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return {
        profile: null,
        error:
          error instanceof Error ? error.message : 'Update profile failed',
      };
    }
  }

  /**
   * Sign in with Google (OAuth)
   * Note: Requires additional setup in Expo and Supabase
   */
  async signInWithGoogle() {
    try {
      // This requires expo-auth-session and additional configuration
      // See: https://supabase.com/docs/guides/auth/social-login/auth-google
      console.warn('⚠️ Google Sign-In requires additional setup');

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Google sign in failed',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Get Supabase client (for advanced usage)
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

// Export singleton instance
export const authService = new AuthService();
