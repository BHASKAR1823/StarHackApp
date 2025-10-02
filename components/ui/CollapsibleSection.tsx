import { Colors } from '@/constants/theme';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
}

export default function CollapsibleSection({
  title,
  subtitle,
  icon,
  children,
  defaultExpanded = true,
  badge,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [animation] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const animatedStyle = {
    opacity: animation,
    maxHeight: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1000], // Adjust max height as needed
    }),
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerContent}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={wp(5)} color={Colors.light.tint} />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={wp(5)}
            color={Colors.light.tabIconDefault}
          />
        </View>
      </TouchableOpacity>

      {/* Section Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    borderRadius: wp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    marginTop: hp(0.2),
  },
  badgeContainer: {
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
    marginLeft: wp(2),
  },
  badgeText: {
    fontSize: rfs(11),
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  chevronContainer: {
    padding: wp(1),
  },
  content: {
    overflow: 'hidden',
  },
});