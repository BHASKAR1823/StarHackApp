import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { StartupWalkthrough } from '@/components/ui/startup-walkthrough';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('youmatter.hasSeenWalkthrough');
        setShowWalkthrough(!seen);
      } catch (e) {
        setShowWalkthrough(true);
      }
    })();
  }, []);

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    AsyncStorage.setItem('youmatter.hasSeenWalkthrough', 'true').catch(() => {});
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="profile" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>
      <StatusBar style="auto" />
      
      {/* Startup Walkthrough */}
      <StartupWalkthrough
        visible={showWalkthrough}
        onComplete={handleWalkthroughComplete}
      />
    </ThemeProvider>
  );
}
