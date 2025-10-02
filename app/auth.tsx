import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { triggerHapticFeedback } from '@/utils/animations';

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const buttonScale = useSharedValue(1);
  const switchScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const switchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: switchScale.value }],
  }));

  const validateInputs = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Required', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!confirmPassword.trim()) {
        Alert.alert('Required', 'Please confirm your password');
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    triggerHapticFeedback('medium');

    try {
      let result;

      if (isLogin) {
        result = await authService.signInWithEmail(email, password);
      } else {
        result = await authService.signUpWithEmail(email, password);
      }

      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });

      if (result.success) {
        triggerHapticFeedback('success');

        if (isLogin) {
          // Navigate to main app
          router.replace('/(tabs)');
        } else {
          Alert.alert(
            'Success! 🎉',
            'Account created successfully. Please check your email for verification.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsLogin(true);
                  setPassword('');
                  setConfirmPassword('');
                },
              },
            ]
          );
        }
      } else {
        triggerHapticFeedback('error');
        Alert.alert(
          isLogin ? 'Login Failed' : 'Signup Failed',
          result.error || 'An unexpected error occurred. Please try again.'
        );
      }
    } catch (error: any) {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      triggerHapticFeedback('error');
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    switchScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      switchScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }, 100);
    
    triggerHapticFeedback('light');
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <IconSymbol name="heart.fill" size={48} color="white" />
          </View>
          <ThemedText type="title" style={styles.appName}>
            YouMatter
          </ThemedText>
          <ThemedText style={styles.tagline}>
            Your wellness journey starts here
          </ThemedText>
        </View>

        {/* Auth Form */}
        <ThemedView style={styles.formContainer}>
          <ThemedText type="subtitle" style={styles.formTitle}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </ThemedText>
          <ThemedText style={styles.formSubtitle}>
            {isLogin
              ? 'Sign in to continue your wellness journey'
              : 'Start your personalized wellness experience'}
          </ThemedText>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <IconSymbol name="envelope.fill" size={20} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.label}>Email Address</ThemedText>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: Colors[colorScheme ?? 'light'].outline,
                },
              ]}
              value={email}
              onChangeText={(text) => setEmail(text.toLowerCase())}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <IconSymbol name="lock.fill" size={20} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.label}>Password</ThemedText>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    color: Colors[colorScheme ?? 'light'].text,
                    backgroundColor: Colors[colorScheme ?? 'light'].surface,
                    borderColor: Colors[colorScheme ?? 'light'].outline,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <IconSymbol
                  name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color={Colors[colorScheme ?? 'light'].text + '60'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password (Signup only) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <IconSymbol name="lock.fill" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? 'light'].text,
                    backgroundColor: Colors[colorScheme ?? 'light'].surface,
                    borderColor: Colors[colorScheme ?? 'light'].outline,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {/* Submit Button */}
          <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <ThemedText style={styles.buttonText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </ThemedText>
                  <IconSymbol name="arrow.right" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Toggle Mode */}
          <Animated.View style={[styles.toggleContainer, switchAnimatedStyle]}>
            <ThemedText style={styles.toggleText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </ThemedText>
            <TouchableOpacity onPress={toggleMode}>
              <ThemedText style={[styles.toggleLink, { color: Colors[colorScheme ?? 'light'].primary }]}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ThemedView>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
  },
  formTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  toggleText: {
    fontSize: 14,
    opacity: 0.7,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});

