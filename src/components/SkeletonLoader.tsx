/**
 * Skeleton Loader Component
 * Shows loading placeholders for better perceived performance
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  marginBottom = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create pulsing animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginBottom,
          opacity,
        },
      ]}
    />
  );
};

// Skeleton variants for common use cases

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={16}
          marginBottom={8}
        />
      ))}
    </View>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <SkeletonLoader width="60%" height={20} marginBottom={12} />
      <SkeletonLoader width="100%" height={16} marginBottom={8} />
      <SkeletonLoader width="100%" height={16} marginBottom={8} />
      <SkeletonLoader width="80%" height={16} marginBottom={12} />
      <View style={styles.row}>
        <SkeletonLoader width={80} height={24} borderRadius={12} />
        <SkeletonLoader width={100} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

export const SkeletonVerseList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.verseCard}>
          <SkeletonLoader width={60} height={16} marginBottom={8} />
          <SkeletonLoader width="100%" height={14} marginBottom={6} />
          <SkeletonLoader width="100%" height={14} marginBottom={6} />
          <SkeletonLoader width="85%" height={14} />
        </View>
      ))}
    </View>
  );
};

export const SkeletonSermonCard: React.FC = () => {
  return (
    <View style={styles.sermonCard}>
      <View style={styles.sermonHeader}>
        <SkeletonLoader width="70%" height={20} />
        <SkeletonLoader width={60} height={14} />
      </View>
      <SkeletonLoader width="100%" height={14} marginBottom={6} />
      <SkeletonLoader width="100%" height={14} marginBottom={6} />
      <SkeletonLoader width="90%" height={14} marginBottom={12} />
      <View style={styles.row}>
        <SkeletonLoader width={80} height={20} borderRadius={10} />
        <SkeletonLoader width={90} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  verseCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sermonCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sermonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
