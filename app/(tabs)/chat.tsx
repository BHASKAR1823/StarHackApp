import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyChatMessages } from '@/services/dummyData';
import { gamificationService } from '@/services/gamificationService';
import { geminiAIService } from '@/services/geminiAIService';
import { ChatMessage } from '@/types/app';
import { triggerHapticFeedback } from '@/utils/animations';
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
  withSpring
} from 'react-native-reanimated';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<ChatMessage[]>(dummyChatMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

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

    // Get AI response from Gemini
    try {
      const aiResponseText = await geminiAIService.generateWellnessResponse(currentInput);
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
        category: 'wellness',
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Award coins for chat interaction
      gamificationService.awardCoins(10, 'AI Chat interaction');
    } catch (error) {
      console.error('AI Response Error:', error);
      const fallbackResponse = generateFallbackResponse(currentInput);
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

  const MessageBubble = ({ message, index }: { message: ChatMessage; index: number }) => {
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
          <ThemedText style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.text}
          </ThemedText>
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
          <MessageBubble key={message.id} message={message} index={index} />
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
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
              onChangeText={setInputText}
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
});