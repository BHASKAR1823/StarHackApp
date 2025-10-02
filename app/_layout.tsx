import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { StartupWalkthrough } from '@/components/ui/startup-walkthrough';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dailyLoginService } from '@/services/dailyLoginService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window === 'undefined') {
      return;
    }
    
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('youmatter.hasSeenWalkthrough');
        const hasSeenBefore = seen === 'true';
        
        // Initialize daily login service with 3-day streak
        await dailyLoginService.simulateLogin(1); // Set last login to yesterday
        
        // For development/demo purposes, always show walkthrough for now
        // Remove this line for production to respect user's choice
        setShowWalkthrough(true);
        
        // In production, use this instead:
        // setShowWalkthrough(!hasSeenBefore);
        
        console.log('Walkthrough seen before:', hasSeenBefore);
        console.log('Will show walkthrough:', true); // Change to !hasSeenBefore for production
      } catch (e) {
        console.error('Error checking walkthrough status:', e);
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
