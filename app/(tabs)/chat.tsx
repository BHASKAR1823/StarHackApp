import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyChatMessages } from '@/services/dummyData';
import { gamificationService } from '@/services/gamificationService';
import { geminiAIService } from '@/services/geminiAIService';
import { UserProfile, userService } from '@/services/userService';
import { ChatMessage } from '@/types/app';
import { triggerHapticFeedback } from '@/utils/animations';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
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
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [latestAIMessageId, setLatestAIMessageId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Keep animations simple to prevent blinking
  const inputScale = useSharedValue(1);
  const sendButtonScale = useSharedValue(1);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }), []);

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }), []);

  const quickPrompts = [
    { text: "How can I reduce stress?", icon: "heart.fill" as const },
    { text: "Meditation tips", icon: "brain" as const },
    { text: "Healthy eating advice", icon: "leaf.fill" as const },
    { text: "Sleep better", icon: "moon.fill" as const },
    { text: "Exercise routine", icon: "figure.run" as const },
  ];

  // Enhanced Typing Animation Component
  const TypingAnimation = () => {
    const dot1Opacity = useSharedValue(0.3);
    const dot2Opacity = useSharedValue(0.3);
    const dot3Opacity = useSharedValue(0.3);
    const dot1Scale = useSharedValue(1);
    const dot2Scale = useSharedValue(1);
    const dot3Scale = useSharedValue(1);

    React.useEffect(() => {
      // Staggered pulsing animation for dots
      dot1Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        false
      );
      
      dot2Opacity.value = withDelay(200, 
        withRepeat(
          withSequence(
            withTiming(1, { duration: 500 }),
            withTiming(0.3, { duration: 500 })
          ),
          -1,
          false
        )
      );
      
      dot3Opacity.value = withDelay(400, 
        withRepeat(
          withSequence(
            withTiming(1, { duration: 500 }),
            withTiming(0.3, { duration: 500 })
          ),
          -1,
          false
        )
      );

      // Scale animation for breathing effect
      dot1Scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
      
      dot2Scale.value = withDelay(200,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 600 }),
            withTiming(1, { duration: 600 })
          ),
          -1,
          true
        )
      );
      
      dot3Scale.value = withDelay(400,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 600 }),
            withTiming(1, { duration: 600 })
          ),
          -1,
          true
        )
      );
    }, []);

    const dot1Style = useAnimatedStyle(() => ({
      opacity: dot1Opacity.value,
      transform: [{ scale: dot1Scale.value }],
    }));

    const dot2Style = useAnimatedStyle(() => ({
      opacity: dot2Opacity.value,
      transform: [{ scale: dot2Scale.value }],
    }));

    const dot3Style = useAnimatedStyle(() => ({
      opacity: dot3Opacity.value,
      transform: [{ scale: dot3Scale.value }],
    }));

    return (
      <View style={styles.typingAnimationContainer}>
        <Animated.View style={[styles.typingDotAnimated, dot1Style]} />
        <Animated.View style={[styles.typingDotAnimated, dot2Style]} />
        <Animated.View style={[styles.typingDotAnimated, dot3Style]} />
      </View>
    );
  };

  // Load user profile and initial messages when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
      if (isInitialLoad) {
        // Load dummy messages only on first load
        setMessages(dummyChatMessages);
        setIsInitialLoad(false);
      }
    }, [])
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserProfile = async () => {
    const profile = await userService.getProfile();
    setUserProfile(profile);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    // Clear the latest AI message ID immediately when user sends a message
    setLatestAIMessageId(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
      category: 'general',
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = textToSend;
    if (!messageText) setInputText(''); // Only clear input if not from suggestion
    setIsTyping(true);

    // Simple send button feedback
    sendButtonScale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
    setTimeout(() => {
      sendButtonScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }, 100);

    triggerHapticFeedback('light');

    // Get AI response from Gemini with user context
    try {
      const userContext = userProfile ? {
        userName: userProfile.name,
        userAge: userProfile.age,
        userGender: userProfile.gender,
        userHeight: userProfile.height,
        userWeight: userProfile.weight,
      } : undefined;

      const aiResponseText = await geminiAIService.generateWellnessResponse(currentInput, userContext);
      const aiResponseId = (Date.now() + 1).toString();
      const aiResponse: ChatMessage = {
        id: aiResponseId,
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
        category: 'wellness',
      };
      
      // Set this as the latest AI message to trigger typewriter effect
      setLatestAIMessageId(aiResponseId);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Award coins for chat interaction
      gamificationService.awardCoins(10, 'AI Chat interaction');
    } catch (error) {
      console.error('AI Response Error:', error);
      const fallbackResponse = generateFallbackResponse(currentInput);
      setLatestAIMessageId(fallbackResponse.id);
      setMessages(prev => [...prev, fallbackResponse]);
      setIsTyping(false);
    }
  };

  const generateFallbackResponse = (userInput: string): ChatMessage => {
    return {
      id: (Date.now() + 1).toString(),
      text: `Thank you for your message! 🌟 I'm here to help with your wellness journey. Whether you need advice on exercise, nutrition, meditation, or stress management, just let me know what's on your mind!`,
      isUser: false,
      timestamp: new Date(),
      category: 'wellness',
    };
  };

  // Typewriter Effect Component with unique key to force remount
  const TypewriterText = ({ text, messageId, speed = 30 }: { text: string; messageId: string; speed?: number }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const cursorOpacity = useSharedValue(1);

    // Blinking cursor animation
    const cursorAnimatedStyle = useAnimatedStyle(() => ({
      opacity: cursorOpacity.value,
    }));

    useEffect(() => {
      // Start blinking animation
      cursorOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }, []);

    useEffect(() => {
      // Reset everything when messageId changes (new message)
      setDisplayText('');
      setCurrentIndex(0);
    }, [messageId]);

    useEffect(() => {
      if (currentIndex < text.length) {
        // Variable typing speed for more realistic effect
        const char = text[currentIndex];
        const isEndOfSentence = char === '.' || char === '!' || char === '?';
        const isComma = char === ',';
        const isSpace = char === ' ';
        
        let dynamicSpeed = speed;
        if (isEndOfSentence) dynamicSpeed = speed * 4; // Pause at sentence end
        else if (isComma) dynamicSpeed = speed * 2; // Slight pause at comma
        else if (isSpace) dynamicSpeed = speed * 0.5; // Faster through spaces
        else dynamicSpeed = speed + (Math.random() * 20 - 10); // Add randomness

        const timer = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
          
          // Subtle haptic feedback every few characters
          if (currentIndex % 12 === 0) {
            triggerHapticFeedback('light');
          }
        }, Math.max(10, dynamicSpeed)); // Minimum 10ms

        return () => clearTimeout(timer);
      }
    }, [currentIndex, text, speed, messageId]);

    return (
      <ThemedText style={styles.aiMessageText}>
        {displayText}
        {currentIndex < text.length && (
          <Animated.Text style={[styles.cursor, cursorAnimatedStyle]}>|</Animated.Text>
        )}
      </ThemedText>
    );
  };

  const MessageBubble = ({ message, index, isLatest }: { message: ChatMessage; index: number; isLatest: boolean }) => {
    return (
      <View 
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.aiMessage
        ]}
      >

        
        <View style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble
        ]}>
          {message.isUser ? (
            <ThemedText style={[styles.messageText, styles.userMessageText]}>
              {message.text}
            </ThemedText>
          ) : (
            // Only use typewriter effect for the latest AI message
            isLatest && !message.isUser ? (
              <TypewriterText text={message.text} messageId={message.id} speed={25} />
            ) : (
              <ThemedText style={styles.aiMessageText}>
                {message.text}
              </ThemedText>
            )
          )}
          <ThemedText style={[
            styles.timestamp,
            message.isUser ? styles.userTimestamp : styles.aiTimestamp
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        </View>

        {message.isUser && (
          <View style={[styles.userAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '80' }]}>
            <IconSymbol name="person.fill" size={20} color="white" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].surfaceVariant || '#F5F5F5' }]}>
      {/* Modern Chat Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface || '#FFFFFF' }]}>
        <View style={styles.headerContent}>
          <View style={styles.aiAvatarContainer}>
            <View style={[styles.aiHeaderAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <IconSymbol name="brain" size={24} color="white" />
            </View>
            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="defaultSemiBold" style={styles.headerTitle}>AI Wellness Coach</ThemedText>
            <ThemedText style={[styles.statusText, { color: isTyping ? Colors[colorScheme ?? 'light'].primary : '#4CAF50' }]}>
              {isTyping ? '🤖 Typing...' : '● Online'}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.coinIndicator}>
              <IconSymbol name="dollarsign.circle.fill" size={20} color="#FFD700" />
              <ThemedText style={styles.coinText}>+10</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            index={index}
            isLatest={message.id === latestAIMessageId}
          />
        ))}
        
        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.aiAvatarTyping}>
              <View style={[styles.aiAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <IconSymbol name="brain" size={16} color="white" />
              </View>
            </View>
            <View style={styles.typingIndicatorEnhanced}>
              <TypingAnimation />
              <ThemedText style={styles.typingText}>AI is thinking...</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Quick Prompts */}
      {messages.length <= 3 && (
        <View style={styles.quickPromptsContainer}>
          <ThemedText style={styles.quickPromptsTitle}>💬 Try asking about...</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickPrompts}
          >
            {quickPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickPrompt, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: Colors[colorScheme ?? 'light'].primary + '30'
                }]}
                onPress={() => {
                  triggerHapticFeedback('light');
                  // Directly send the suggestion
                  sendMessage(prompt.text);
                }}
              >
                <IconSymbol name={prompt.icon} size={16} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={[styles.quickPromptText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {prompt.text}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputArea, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: Colors[colorScheme ?? 'light'].text,
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  borderColor: Colors[colorScheme ?? 'light'].outline 
                }
              ]}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                // Clear typewriter effect when user starts typing a new message
                if (text.length === 1 && latestAIMessageId) {
                  setLatestAIMessageId(null);
                }
              }}
              placeholder="Ask me about wellness, meditation, yoga..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              multiline
              maxLength={500}
              onFocus={() => {
                inputScale.value = withSpring(1.01, { damping: 20, stiffness: 300 });
              }}
              onBlur={() => {
                inputScale.value = withSpring(1, { damping: 20, stiffness: 300 });
              }}
            />
            
            <Animated.View style={sendButtonAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { 
                    backgroundColor: inputText.trim() 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].outline,
                    opacity: inputText.trim() ? 1 : 0.5 
                  }
                ]}
                onPress={() => sendMessage()}
                disabled={!inputText.trim() || isTyping}
              >
                <IconSymbol name="paperplane.fill" size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatarContainer: {
    position: 'relative',
  },
  aiHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    marginLeft: 'auto',
  },
  coinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7.5,
    marginVertical: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.13,
    shadowRadius: 1,
    elevation: 1,
  },
  userBubble: {
    borderBottomRightRadius: 2,
    backgroundColor: '#DCF8C6', // WhatsApp green
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000000', // Dark text on light green background
  },
  aiMessageText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.5,
  },
  userTimestamp: {
    color: '#666666', // Dark timestamp on light background
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666666',
  },
  typingIndicator: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7.5,
    borderBottomLeftRadius: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.13,
    shadowRadius: 1,
    elevation: 1,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  quickPrompts: {
    paddingVertical: 8,
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickPromptText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Enhanced Typing Animation Styles
  aiAvatarTyping: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  
  typingIndicatorEnhanced: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.13,
    shadowRadius: 1,
    elevation: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  
  typingAnimationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  
  typingDotAnimated: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 2,
  },
  
  typingText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  
  cursor: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
    opacity: 0.8,
  },
});