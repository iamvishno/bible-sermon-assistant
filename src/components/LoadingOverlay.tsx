/**
 * Loading Overlay Component
 * Full-screen loading indicator
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    minWidth: 150,
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
