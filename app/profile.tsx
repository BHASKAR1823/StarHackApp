import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { triggerHapticFeedback } from '@/utils/animations';
import { supabaseUserService } from '@/services/supabaseUserService';
import { supabase } from '@/services/supabase';
import { authService } from '@/services/authService';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    email: '',
    height: '',
    weight: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const saveButtonScale = useSharedValue(1);

  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const saved = await userService.getProfile();
      if (saved) {
        setProfile(saved);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateProfile = (): boolean => {
    // Required fields
    if (!profile.name.trim()) {
      Alert.alert('Required Field', 'Please enter your name');
      return false;
    }
    if (!profile.age.trim()) {
      Alert.alert('Required Field', 'Please enter your age');
      return false;
    }
    if (!profile.gender.trim()) {
      Alert.alert('Required Field', 'Please select your gender');
      return false;
    }
    if (!profile.email.trim()) {
      Alert.alert('Required Field', 'Please enter your email');
      return false;
    }

    // Age validation
    const ageNum = parseInt(profile.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 120');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    // Optional fields validation (if provided)
    if (profile.height.trim()) {
      const heightNum = parseFloat(profile.height);
      if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
        Alert.alert('Invalid Height', 'Please enter a valid height between 50 and 300 cm');
        return false;
      }
    }

    if (profile.weight.trim()) {
      const weightNum = parseFloat(profile.weight);
      if (isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
        Alert.alert('Invalid Weight', 'Please enter a valid weight between 20 and 500 kg');
        return false;
      }
    }

    return true;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;

    setIsSaving(true);
    saveButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    triggerHapticFeedback('success');

    try {
      await userService.saveProfile(profile);
      
      setTimeout(() => {
        saveButtonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
        Alert.alert(
          'Success! 🎉',
          'Your profile has been saved successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }, 200);
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
      saveButtonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <IconSymbol name="chevron.left" size={28} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Your Profile
          </ThemedText>
          <View style={styles.backButton} />
        </ThemedView>

        {/* Profile Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.profileIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <IconSymbol name="person.fill" size={48} color="white" />
          </View>
        </View>

        {/* Required Fields Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Required Information
          </ThemedText>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>
              Name <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: Colors[colorScheme ?? 'light'].outline,
                },
              ]}
              value={profile.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter your full name"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              autoCapitalize="words"
            />
          </View>

          {/* Age */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>
              Age <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: Colors[colorScheme ?? 'light'].outline,
                },
              ]}
              value={profile.age}
              onChangeText={(text) => updateField('age', text.replace(/[^0-9]/g, ''))}
              placeholder="Enter your age"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>
              Gender <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.genderOptions}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor:
                        profile.gender === option
                          ? Colors[colorScheme ?? 'light'].primary
                          : Colors[colorScheme ?? 'light'].surface,
                      borderColor: Colors[colorScheme ?? 'light'].outline,
                    },
                  ]}
                  onPress={() => {
                    updateField('gender', option);
                    triggerHapticFeedback('light');
                  }}
                >
                  <ThemedText
                    style={[
                      styles.genderOptionText,
                      { color: profile.gender === option ? 'white' : Colors[colorScheme ?? 'light'].text },
                    ]}
                  >
                    {option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>
              Email <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: Colors[colorScheme ?? 'light'].outline,
                },
              ]}
              value={profile.email}
              onChangeText={(text) => updateField('email', text.toLowerCase())}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </ThemedView>

        {/* Wellness Fields Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Wellness Information
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Optional - helps us provide personalized recommendations
          </ThemedText>

          {/* Height */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Height (cm)</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: Colors[colorScheme ?? 'light'].outline,
                },
              ]}
              value={profile.height}
              onChangeText={(text) => updateField('height', text.replace(/[^0-9.]/g, ''))}
              placeholder="e.g., 175"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Weight */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Weight (kg)</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: Colors[colorScheme ?? 'light'].outline,
                },
              ]}
              value={profile.weight}
              onChangeText={(text) => updateField('weight', text.replace(/[^0-9.]/g, ''))}
              placeholder="e.g., 70"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              keyboardType="decimal-pad"
            />
          </View>
        </ThemedView>

        {/* Save Button */}
        <Animated.View style={[styles.saveButtonContainer, saveButtonAnimatedStyle]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={saveProfile}
            disabled={isSaving}
            accessibilityLabel="Save profile"
          >
            <IconSymbol name="checkmark" size={20} color="white" />
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  genderOptions: {
    gap: 8,
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

