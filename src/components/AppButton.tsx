/**
 * App Button Component
 * Consistent button styling across the app
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.5;
    }

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, ...styles.secondaryButton };
      case 'outline':
        return { ...baseStyle, ...styles.outlineButton };
      case 'ghost':
        return { ...baseStyle, ...styles.ghostButton };
      case 'danger':
        return { ...baseStyle, ...styles.dangerButton };
      case 'primary':
      default:
        return { ...baseStyle, ...styles.primaryButton };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, ...styles.secondaryText };
      case 'outline':
        return { ...baseStyle, ...styles.outlineText };
      case 'ghost':
        return { ...baseStyle, ...styles.ghostText };
      case 'danger':
        return { ...baseStyle, ...styles.dangerText };
      case 'primary':
      default:
        return { ...baseStyle, ...styles.primaryText };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#007AFF' : '#fff'}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base button
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  // Size variants
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  largeButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // Primary variant
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Secondary variant
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  secondaryText: {
    color: '#333',
    fontWeight: '600',
  },

  // Outline variant
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  outlineText: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Ghost variant
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Danger variant
  dangerButton: {
    backgroundColor: '#F44336',
  },
  dangerText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Base text
  text: {
    fontSize: 16,
  },

  // Text size variants
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
