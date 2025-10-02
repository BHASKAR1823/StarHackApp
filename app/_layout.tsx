import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import 'react-native-reanimated';

import { StartupWalkthrough } from '@/components/ui/startup-walkthrough';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showWalkthrough, setShowWalkthrough] = useState(true); // Set to true for demo

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
