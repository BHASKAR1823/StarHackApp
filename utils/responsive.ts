import React from 'react';
import { Dimensions, PixelRatio, Platform } from 'react-native';

export interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

export interface DeviceInfo {
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  screenType: 'small' | 'medium' | 'large' | 'tablet';
}

// Get current screen dimensions
export const getScreenDimensions = (): ScreenDimensions => {
  const { width, height } = Dimensions.get('window');
  const scale = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();
  
  return {
    width,
    height,
    scale,
    fontScale,
  };
};

// Get device information
export const getDeviceInfo = (): DeviceInfo => {
  const { width, height } = Dimensions.get('window');
  const screenData = Dimensions.get('screen');
  
  const isLandscape = width > height;
  const shortDimension = Math.min(width, height);
  const longDimension = Math.max(width, height);
  
  // Device classification based on shortest dimension
  const isSmallScreen = shortDimension < 375;
  const isMediumScreen = shortDimension >= 375 && shortDimension < 414;
  const isLargeScreen = shortDimension >= 414 && longDimension < 900;
  const isTablet = shortDimension >= 600 || longDimension >= 900;
  
  let screenType: 'small' | 'medium' | 'large' | 'tablet' = 'medium';
  if (isTablet) screenType = 'tablet';
  else if (isLargeScreen) screenType = 'large';
  else if (isSmallScreen) screenType = 'small';
  
  return {
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isTablet,
    isLandscape,
    screenType,
  };
};

// Responsive width function
export const wp = (percentage: number): number => {
  const { width } = getScreenDimensions();
  return (percentage * width) / 100;
};

// Responsive height function
export const hp = (percentage: number): number => {
  const { height } = getScreenDimensions();
  return (percentage * height) / 100;
};

// Responsive font size with accessibility support
export const rfs = (size: number): number => {
  const { fontScale } = getScreenDimensions();
  const { screenType } = getDeviceInfo();
  
  // Base scaling factors by device type
  const scaleFactors = {
    small: 0.9,
    medium: 1,
    large: 1.1,
    tablet: 1.2,
  };
  
  const scaledSize = size * scaleFactors[screenType];
  
  // Apply system font scale but cap it to prevent excessive scaling
  const maxFontScale = Platform.OS === 'ios' ? 1.3 : 1.2;
  const adjustedFontScale = Math.min(fontScale, maxFontScale);
  
  return Math.round(scaledSize * adjustedFontScale);
};

// Responsive spacing
export const rs = (spacing: number): number => {
  const { screenType } = getDeviceInfo();
  
  const scaleFactors = {
    small: 0.8,
    medium: 1,
    large: 1.1,
    tablet: 1.3,
  };
  
  return Math.round(spacing * scaleFactors[screenType]);
};

// Get responsive grid columns based on screen size
export const getGridColumns = (baseColumns: number = 2): number => {
  const { isTablet, isLandscape, screenType } = getDeviceInfo();
  
  if (isTablet) {
    return isLandscape ? Math.min(baseColumns + 2, 6) : Math.min(baseColumns + 1, 4);
  }
  
  if (isLandscape && screenType !== 'small') {
    return Math.min(baseColumns + 1, 4);
  }
  
  return baseColumns;
};

// Get responsive card width for grids
export const getCardWidth = (columns: number, margin: number = 16): number => {
  const { width } = getScreenDimensions();
  const totalMargin = margin * 2; // Left and right margins
  const columnGaps = margin * (columns - 1); // Gaps between columns
  
  return (width - totalMargin - columnGaps) / columns;
};

// Get safe area adjustments
export const getSafeAreaAdjustments = () => {
  const { height } = getScreenDimensions();
  
  // Estimate safe area based on device height (for devices without explicit safe area)
  const hasNotch = height >= 800; // Rough estimation for devices with notch/island
  
  return {
    top: hasNotch ? 44 : 20,
    bottom: hasNotch ? 34 : 0,
  };
};

// Responsive breakpoints
export const breakpoints = {
  xs: 0,     // Extra small devices
  sm: 375,   // Small devices (iPhone SE, etc)
  md: 414,   // Medium devices (iPhone 6+, etc)
  lg: 768,   // Large devices (iPad portrait, etc)
  xl: 1024,  // Extra large devices (iPad landscape, etc)
};

// Check if screen matches breakpoint
export const matchesBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  const { width } = getScreenDimensions();
  return width >= breakpoints[breakpoint];
};

// Get responsive layout configuration for AR interface
export const getARLayoutConfig = () => {
  const { width, height } = getScreenDimensions();
  const { isTablet, isLandscape, screenType } = getDeviceInfo();
  
  // Camera aspect ratio handling
  const cameraAspectRatio = isLandscape ? 16 / 9 : 4 / 3;
  
  // HUD positioning and sizing
  const hudConfig = {
    // Pose indicator
    poseIndicatorSize: isTablet ? 100 : screenType === 'small' ? 70 : 80,
    poseIndicatorTop: hp(isLandscape ? 15 : 12),
    
    // Confidence HUD
    confidenceHUDRight: rs(20),
    confidenceHUDTop: hp(isLandscape ? 20 : 15),
    confidenceHUDWidth: isTablet ? 180 : 150,
    
    // Timer display
    timerDisplayBottom: hp(isLandscape ? 15 : 20),
    timerDisplayWidth: isTablet ? 300 : wp(85),
    
    // Instructions panel
    instructionsPanelBottom: rs(20),
    instructionsPanelHeight: hp(isLandscape ? 20 : 15),
    
    // Grid overlay
    gridOpacity: isTablet ? 0.4 : 0.3,
    gridSpacing: isTablet ? 15 : 12,
  };
  
  return {
    cameraAspectRatio,
    ...hudConfig,
  };
};

// Responsive animation configurations
export const getAnimationConfig = () => {
  const { screenType } = getDeviceInfo();
  
  const configs = {
    small: {
      duration: 200,
      damping: 12,
      stiffness: 120,
    },
    medium: {
      duration: 250,
      damping: 15,
      stiffness: 150,
    },
    large: {
      duration: 300,
      damping: 18,
      stiffness: 180,
    },
    tablet: {
      duration: 350,
      damping: 20,
      stiffness: 200,
    },
  };
  
  return configs[screenType];
};

// Hook for responsive values that updates on dimension changes
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState(getScreenDimensions);
  const [deviceInfo, setDeviceInfo] = React.useState(getDeviceInfo);
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getScreenDimensions());
      setDeviceInfo(getDeviceInfo());
    });
    
    return () => subscription?.remove();
  }, []);
  
  return { dimensions, deviceInfo };
};

