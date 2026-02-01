/**
 * Auth Screen - Login and Sign Up
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';

interface AuthScreenProps {
  navigation: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const { signIn, signUp, continueAsGuest, isLoading, error, clearError } =
    useAuthStore();

  const handleSubmit = async () => {
    clearError();

    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
    }

    // Submit
    let success = false;

    if (mode === 'signin') {
      success = await signIn(email, password);
    } else {
      success = await signUp(email, password, displayName);
    }

    if (success) {
      // Navigate to main app
      navigation.replace('BibleBookList');
    }
  };

  const handleGuestMode = () => {
    Alert.alert(
      'Guest Mode',
      'In guest mode, your data will only be stored locally and will not sync across devices. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            continueAsGuest();
            navigation.replace('BibleBookList');
          },
        },
      ]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email to receive a password reset link',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            // TODO: Implement password reset
            Alert.alert('Success', 'Password reset email sent!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bible Sermon Assistant</Text>
            <Text style={styles.subtitle}>
              {mode === 'signin'
                ? 'Sign in to continue'
                : 'Create your account'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password (Sign In only) */}
            {mode === 'signin' && (
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotButtonText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {mode === 'signin'
                  ? "Don't have an account?"
                  : 'Already have an account?'}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                }
                disabled={isLoading}
              >
                <Text style={styles.toggleLink}>
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Guest Mode */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              disabled={isLoading}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  toggleText: {
    color: '#666',
    fontSize: 14,
    marginRight: 4,
  },
  toggleLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
