// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'heart.fill': 'favorite',
  'message.fill': 'chat',
  'shield.fill': 'security',
  'chart.bar.fill': 'bar-chart',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  
  // Actions & Communication
  'paperplane.fill': 'send',
  'play.fill': 'play-arrow',
  'play.circle.fill': 'play-circle-filled',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'xmark': 'close',
  'hand.tap.fill': 'touch-app',
  
  // Wellness & Health
  'figure.walk': 'directions-walk',
  'figure.run': 'directions-run',
  'drop.fill': 'water-drop',
  'moon.fill': 'nights-stay',
  'star.fill': 'star',
  'flame.fill': 'local-fire-department',
  'timer': 'timer',
  'brain': 'psychology',
  'book.fill': 'book',
  'gamecontroller.fill': 'sports-esports',
  'body': 'accessibility',
  'heart': 'favorite-border',
  'trophy': 'emoji-events',
  'grid': 'apps',
  // Custom wellness icons
  'footsteps': 'directions-walk',
  'water': 'water-drop',
  'moon': 'nights-stay',
  'leaf': 'eco',
  
  // Technology & AR
  'arkit': 'view-in-ar',
  'camera.fill': 'camera-alt',
  'scope': 'center-focus-strong',
  'shield-checkmark': 'verified-user',
  
  // Finance & Rewards
  'dollarsign.circle': 'monetization-on',
  'dollarsign.circle.fill': 'monetization-on',
  'gift.fill': 'card-giftcard',
  'percent': 'percent',
  
  // Data & Analytics
  'chart.xyaxis.line': 'show-chart',
  'arrow.up': 'trending-up',
  'trending-up': 'trending-up',
  'clock': 'schedule',
  'repeat': 'refresh',
  'globe': 'public',
  'info.circle': 'info',
  
  // User & Settings
  'person.fill': 'person',
  'person.circle.fill': 'account-circle',
  'person.2.fill': 'people',
  'gear': 'settings',
  'envelope.fill': 'email',
  'calendar': 'calendar-today',
  'phone.fill': 'phone',
  'ruler': 'straighten',
  'scalemass.fill': 'fitness-center',
  'heart.text.square': 'favorite-border',
  'lock.fill': 'lock',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'checkmark.seal': 'verified',
  
  // Navigation & Actions
  // (removed duplicate)
  'arrow.right.square': 'logout',
  'arrow.right': 'arrow-forward',
} as any;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
