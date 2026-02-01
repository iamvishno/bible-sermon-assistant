/**
 * Sermon Generator Screen
 * Displays real-time generation progress and streams sermon content
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  RootStackParamList,
  SermonConfig,
  VerseReference,
} from '../types';
import { useSermonStore } from '../stores/sermonStore';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SermonGenerator'
>;

interface SermonGeneratorScreenProps {
  route: {
    params: {
      verses: VerseReference[];
      config: SermonConfig;
    };
  };
}

export const SermonGeneratorScreen: React.FC<SermonGeneratorScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { verses, config } = route.params;

  const {
    generateSermon,
    isGenerating,
    generationProgress,
    generationStatus,
    currentSermon,
    error,
    clearError,
  } = useSermonStore();

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      startGeneration();
    }
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Generation Failed', error, [
        {
          text: 'Retry',
          onPress: () => {
            clearError();
            startGeneration();
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            clearError();
            navigation.goBack();
          },
        },
      ]);
    }
  }, [error]);

  useEffect(() => {
    // Navigate to viewer when generation is complete
    if (currentSermon && !isGenerating && generationProgress === 100) {
      setTimeout(() => {
        navigation.replace('SermonViewer', { sermonId: currentSermon.id });
      }, 500);
    }
  }, [currentSermon, isGenerating, generationProgress]);

  const startGeneration = async () => {
    await generateSermon(verses, config);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Generating Sermon</Text>
          <Text style={styles.subtitle}>
            Using AI to create your sermon...
          </Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{generationProgress}%</Text>
          </View>
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.spinner}
          />
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{generationStatus}</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          <ProgressStep
            label="Checking quota"
            isComplete={generationProgress > 10}
            isActive={generationProgress <= 10}
          />
          <ProgressStep
            label="Generating sermon"
            isComplete={generationProgress > 80}
            isActive={generationProgress > 10 && generationProgress <= 80}
          />
          <ProgressStep
            label="Saving sermon"
            isComplete={generationProgress > 90}
            isActive={generationProgress > 80 && generationProgress <= 90}
          />
          <ProgressStep
            label="Finalizing"
            isComplete={generationProgress === 100}
            isActive={generationProgress > 90 && generationProgress < 100}
          />
        </View>

        {/* Configuration Summary */}
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Configuration</Text>
          <Text style={styles.configItem}>
            Type: {config.sermon_type.charAt(0).toUpperCase() + config.sermon_type.slice(1)}
          </Text>
          <Text style={styles.configItem}>
            Audience: {config.target_audience.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Text>
          <Text style={styles.configItem}>
            Length: {config.length_minutes} minutes
          </Text>
          <Text style={styles.configItem}>
            Tone: {config.tone.charAt(0).toUpperCase() + config.tone.slice(1)}
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tip</Text>
          <Text style={styles.tipsText}>
            This usually takes 10-20 seconds. The generated sermon will be saved
            automatically and synced to your account.
          </Text>
        </View>
      </ScrollView>

      {/* Cancel Button */}
      {isGenerating && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Cancel Generation',
                'Are you sure you want to cancel? You will not be charged if you cancel.',
                [
                  { text: 'Continue', style: 'cancel' },
                  {
                    text: 'Cancel',
                    style: 'destructive',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

interface ProgressStepProps {
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({
  label,
  isComplete,
  isActive,
}) => {
  return (
    <View style={styles.step}>
      <View
        style={[
          styles.stepIndicator,
          isComplete && styles.stepIndicatorComplete,
          isActive && styles.stepIndicatorActive,
        ]}
      >
        {isComplete && <Text style={styles.stepCheckmark}>✓</Text>}
      </View>
      <Text
        style={[
          styles.stepLabel,
          (isComplete || isActive) && styles.stepLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  progressText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  spinner: {
    position: 'absolute',
  },
  statusContainer: {
    marginBottom: 32,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  stepIndicatorComplete: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 14,
    color: '#999',
  },
  stepLabelActive: {
    color: '#333',
    fontWeight: '500',
  },
  configCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  configItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tipsCard: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
