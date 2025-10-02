/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#4CAF50'; // Wellness green
const tintColorDark = '#66BB6A';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FAFAFA',
    tint: tintColorLight,
    icon: '#757575',
    tabIconDefault: '#BDBDBD',
    tabIconSelected: tintColorLight,
    primary: '#4CAF50',
    secondary: '#2196F3',
    accent: '#FF9800',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    outline: '#E0E0E0',
    shadow: '#00000020',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: tintColorDark,
    icon: '#FFFFFF',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    primary: '#66BB6A',
    secondary: '#42A5F5',
    accent: '#FFB74D',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    outline: '#333333',
    shadow: '#00000040',
  },
};

// Wellness-specific color palette
export const WellnessColors = {
  physical: '#4CAF50',    // Green for physical activities
  mental: '#9C27B0',      // Purple for mental wellness
  nutrition: '#FF9800',   // Orange for nutrition
  social: '#2196F3',      // Blue for social activities
  meditation: '#673AB7',  // Deep purple for meditation
  yoga: '#E91E63',        // Pink for yoga
  sleep: '#3F51B5',       // Indigo for sleep
  hydration: '#00BCD4',   // Cyan for water/hydration
  steps: '#4CAF50',       // Green for steps
  heart: '#F44336',       // Red for heart health
  streak: '#FF5722',      // Orange-red for streaks
  coins: '#FFD700',       // Gold for coins
  premium: '#7B1FA2',     // Purple for premium features
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
