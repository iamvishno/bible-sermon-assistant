import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Bible Reader Screens
import { BibleBookListScreen } from '../screens/BibleBookListScreen';
import { BibleReaderScreen } from '../screens/BibleReaderScreen';
import { BibleSearchScreen } from '../screens/BibleSearchScreen';

// Auth Screens
import { AuthScreen } from '../screens/AuthScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Sermon Screens
import { SermonConfigScreen } from '../screens/SermonConfigScreen';
import { SermonGeneratorScreen } from '../screens/SermonGeneratorScreen';
import { SermonViewerScreen } from '../screens/SermonViewerScreen';
import { SermonsListScreen } from '../screens/SermonsListScreen';

// Subscription Screens
import { PricingScreen } from '../screens/PricingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BibleBookList"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1a365d',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ title: 'Sign In', headerShown: false }}
        />
        <Stack.Screen
          name="BibleBookList"
          component={BibleBookListScreen}
          options={{ title: 'బైబిల్ పుస్తకాలు' }}
        />
        <Stack.Screen
          name="BibleReader"
          component={BibleReaderScreen}
          options={{ title: 'బైబిల్ రీడర్' }}
        />
        <Stack.Screen
          name="BibleSearch"
          component={BibleSearchScreen}
          options={{ title: 'శోధన' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'ప్రొఫైల్' }}
        />
        <Stack.Screen
          name="SermonsList"
          component={SermonsListScreen}
          options={{ title: 'నా ప్రసంగాలు' }}
        />
        <Stack.Screen
          name="SermonConfig"
          component={SermonConfigScreen}
          options={{ title: 'ప్రసంగ సెట్టింగ్‌లు' }}
        />
        <Stack.Screen
          name="SermonGenerator"
          component={SermonGeneratorScreen}
          options={{ title: 'ప్రసంగం రూపొందించు' }}
        />
        <Stack.Screen
          name="SermonViewer"
          component={SermonViewerScreen}
          options={{ title: 'ప్రసంగం' }}
        />
        <Stack.Screen
          name="Pricing"
          component={PricingScreen}
          options={{ title: 'ప్లాన్‌లు & ధరలు' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
