/**
 * Theme System
 * Centralized colors, typography, and spacing
 */

export const lightTheme = {
  colors: {
    // Primary
    primary: '#007AFF',
    primaryLight: '#E3F2FD',
    primaryDark: '#0056B3',

    // Accent
    accent: '#4CAF50',
    accentLight: '#C8E6C9',

    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#E0E0E0',

    // Text
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',

    // Status
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',

    // Border
    border: '#E0E0E0',
    borderLight: '#F0F0F0',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },

  typography: {
    // Font families
    fontRegular: 'System',
    fontMedium: 'System',
    fontBold: 'System',

    // Font sizes
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,

    // Line heights
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export const darkTheme = {
  colors: {
    // Primary
    primary: '#0A84FF',
    primaryLight: '#1E3A5F',
    primaryDark: '#0066CC',

    // Accent
    accent: '#66BB6A',
    accentLight: '#2E4A2E',

    // Background
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',

    // Text
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    textInverse: '#000000',

    // Status
    success: '#66BB6A',
    error: '#FF453A',
    warning: '#FFB340',
    info: '#0A84FF',

    // Border
    border: '#38383A',
    borderLight: '#2C2C2E',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
  },

  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: lightTheme.shadows,
};

export type Theme = typeof lightTheme;
export type ThemeMode = 'light' | 'dark' | 'auto';

// Theme selector hook (to be implemented in theme store)
export const getTheme = (mode: ThemeMode, systemColorScheme?: 'light' | 'dark'): Theme => {
  if (mode === 'auto') {
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};
