/**
 * Auth Store - Zustand state management for authentication
 */

import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/AuthService';
import { UserProfile } from '../types';

interface AuthState {
  // User data
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;

  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  // Initialize auth state on app start
  initialize: async () => {
    set({ isInitializing: true, error: null });
    try {
      // Get current session
      const session = await authService.getSession();

      if (session?.user) {
        // Get user profile
        const { profile, error } = await authService.getUserProfile(
          session.user.id
        );

        if (error) {
          console.warn('⚠️ Failed to load profile:', error);
        }

        set({
          user: session.user,
          profile: profile || null,
          isAuthenticated: true,
          isGuest: false,
          isInitializing: false,
        });

        // Set up auth state listener
        authService.onAuthStateChange(async (user) => {
          if (user) {
            const { profile } = await authService.getUserProfile(user.id);
            set({
              user,
              profile: profile || null,
              isAuthenticated: true,
              isGuest: false,
            });
          } else {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isGuest: false,
            });
          }
        });
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isGuest: false,
          isInitializing: false,
        });
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Initialization failed',
        isInitializing: false,
      });
    }
  },

  // Sign up new user
  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, session, error } = await authService.signUp(
        email,
        password,
        displayName
      );

      if (error) {
        set({ error, isLoading: false });
        return false;
      }

      if (user) {
        // Get profile (created automatically by trigger)
        const { profile } = await authService.getUserProfile(user.id);

        set({
          user,
          profile: profile || null,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign up failed',
        isLoading: false,
      });
      return false;
    }
  },

  // Sign in existing user
  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, session, error } = await authService.signIn(email, password);

      if (error) {
        set({ error, isLoading: false });
        return false;
      }

      if (user) {
        // Get profile
        const { profile } = await authService.getUserProfile(user.id);

        set({
          user,
          profile: profile || null,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign in failed',
        isLoading: false,
      });
      return false;
    }
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await authService.signOut();

      if (error) {
        set({ error, isLoading: false });
        return;
      }

      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign out failed',
        isLoading: false,
      });
    }
  },

  // Continue as guest (local only, no cloud sync)
  continueAsGuest: () => {
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isGuest: true,
      error: null,
    });
  },

  // Request password reset
  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await authService.resetPassword(email);

      if (error) {
        set({ error, isLoading: false });
        return false;
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Password reset failed',
        isLoading: false,
      });
      return false;
    }
  },

  // Update user profile
  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user, profile } = get();
    if (!user || !profile) return false;

    set({ isLoading: true, error: null });
    try {
      const { profile: updatedProfile, error } = await authService.updateUserProfile(
        user.id,
        updates
      );

      if (error) {
        set({ error, isLoading: false });
        return false;
      }

      set({
        profile: updatedProfile || profile,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Update failed',
        isLoading: false,
      });
      return false;
    }
  },

  // Refresh user profile from database
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { profile, error } = await authService.getUserProfile(user.id);

      if (error) {
        console.warn('⚠️ Failed to refresh profile:', error);
        return;
      }

      set({ profile: profile || null });
    } catch (error) {
      console.error('❌ Refresh profile error:', error);
    }
  },

  // Clear error message
  clearError: () => {
    set({ error: null });
  },
}));
