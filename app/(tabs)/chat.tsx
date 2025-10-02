import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence 
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyChatMessages } from '@/services/dummyData';
import { ChatMessage } from '@/types/app';
import { gamificationService } from '@/services/gamificationService';
import { triggerHapticFeedback, fadeIn } from '@/utils/animations';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<ChatMessage[]>(dummyChatMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const inputScale = useSharedValue(1);
  const sendButtonScale = useSharedValue(1);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      category: 'general',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Animate send button
    sendButtonScale.value = withSequence(
      withSpring(1.2, { damping: 15, stiffness: 150 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    triggerHapticFeedback('light');

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Award coins for chat interaction
      gamificationService.awardCoins(10, 'AI Chat interaction');
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    let response = '';
    let category: ChatMessage['category'] = 'general';

    // Wellness-related responses
    if (input.includes('stress') || input.includes('anxious') || input.includes('worried')) {
      response = `I understand you're feeling stressed. Here are some techniques that can help:\n\n🧘 **Deep Breathing**: Try the 4-7-8 technique - inhale for 4, hold for 7, exhale for 8.\n\n💆 **Progressive Muscle Relaxation**: Tense and release each muscle group for 5 seconds.\n\n🚶 **Take a Walk**: Even a 5-minute walk can help clear your mind.\n\n🎵 **Listen to Calming Music**: Try our meditation playlist in the wellness section.\n\nWould you like me to guide you through any of these techniques?`;
      category = 'wellness';
    } else if (input.includes('meditation') || input.includes('mindful')) {
      response = `Meditation is a wonderful practice! Here's what I recommend:\n\n🧘‍♀️ **Start Small**: Begin with just 5 minutes daily\n\n🎯 **Focus on Breathing**: Count your breaths from 1 to 10, then repeat\n\n📱 **Try Our Guided Sessions**: Check out the wellness tab for guided meditations\n\n⏰ **Consistency is Key**: Same time each day helps build the habit\n\n🏆 **Track Progress**: You'll earn coins for each session!\n\nWould you like me to start a quick 5-minute session now?`;
      category = 'meditation';
    } else if (input.includes('yoga') || input.includes('pose') || input.includes('stretch')) {
      response = `Yoga is excellent for both physical and mental health! 🧘‍♀️\n\n✨ **Try Our AR Yoga**: Experience poses with real-time feedback\n\n🌅 **Morning Routine**: Start with Mountain Pose and Sun Salutations\n\n🌙 **Evening Relaxation**: Try gentle stretches before bed\n\n💪 **Build Strength**: Warrior poses are great for building stamina\n\n🎯 **Perfect Your Form**: Our AR system gives instant feedback\n\nHead to the Wellness tab to try your first AR yoga session!`;
      category = 'wellness';
    } else if (input.includes('sleep') || input.includes('tired') || input.includes('insomnia')) {
      response = `Good sleep is crucial for wellness! Here are some tips:\n\n🌙 **Sleep Schedule**: Try to sleep and wake at the same time daily\n\n📱 **Screen Time**: Avoid screens 1 hour before bed\n\n🛁 **Bedtime Ritual**: Try a warm bath or reading\n\n🧘 **Relaxation**: Practice deep breathing or meditation\n\n☕ **Avoid Caffeine**: No caffeine after 2 PM\n\n🏆 **Track Your Sleep**: Log your hours to earn coins!\n\nConsistent sleep habits can improve your mood and energy levels!`;
      category = 'wellness';
    } else if (input.includes('insurance') || input.includes('premium') || input.includes('policy')) {
      response = `Great question about insurance! 🛡️\n\n💡 **Did You Know?**: Your wellness activities can impact your premiums!\n\n🏃 **Stay Active**: Regular exercise may qualify for discounts\n\n🚭 **Healthy Habits**: Non-smoking and wellness programs often reduce costs\n\n📋 **Regular Checkups**: Preventive care can lower long-term costs\n\n🎯 **Wellness Challenges**: Complete our insurance challenges for rewards\n\nCheck the Insurance tab to explore your benefits and active challenges!`;
      category = 'insurance';
    } else if (input.includes('water') || input.includes('hydration') || input.includes('drink')) {
      response = `Staying hydrated is super important! 💧\n\n🎯 **Daily Goal**: Aim for 8 glasses of water per day\n\n⏰ **Timing**: Drink a glass when you wake up and before meals\n\n🍋 **Add Flavor**: Try lemon, cucumber, or mint for variety\n\n📱 **Track Progress**: Log your water intake to earn coins\n\n💡 **Tip**: Keep a water bottle with you throughout the day\n\nYour current progress shows ${Math.floor(Math.random() * 6) + 2} glasses today. Keep it up!`;
      category = 'wellness';
    } else if (input.includes('coin') || input.includes('reward') || input.includes('level')) {
      response = `Love that you're engaged with the reward system! 🎮\n\n💰 **Earn Coins**: Complete daily tasks, workouts, and challenges\n\n⭐ **Level Up**: Every 200 coins = 1 level up\n\n🔥 **Streaks**: Maintain daily habits for bonus multipliers\n\n🏆 **Badges**: Unlock achievements for special milestones\n\n🛍️ **Reward Store**: Spend coins on premium content and perks\n\nYou're currently at ${Math.floor(Math.random() * 10) + 1} coins away from your next level!`;
      category = 'general';
    } else {
      // General responses
      const responses = [
        `That's interesting! I'm here to help with your wellness journey. Whether it's meditation, yoga, nutrition, or managing stress, I've got you covered! 🌟\n\nWhat specific area would you like to focus on today?`,
        `I'm your AI wellness companion! 🤖 I can help you with:\n\n🧘 Meditation & mindfulness\n🧘‍♀️ Yoga poses and techniques\n💪 Fitness motivation\n😴 Better sleep habits\n🛡️ Insurance wellness benefits\n\nWhat would you like to explore?`,
        `Thanks for chatting with me! Remember, small daily actions lead to big changes. Whether it's a 5-minute meditation or a short walk, every step counts! 💪\n\nHow can I support your wellness goals today?`
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      id: Date.now().toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      category,
    };
  };

  const quickPrompts = [
    { text: "I'm feeling stressed", icon: "face.smiling" as const },
    { text: "Help me meditate", icon: "brain" as const },
    { text: "Yoga recommendations", icon: "figure.walk" as const },
    { text: "Sleep better tips", icon: "moon.fill" as const },
    { text: "Insurance benefits", icon: "shield.fill" as const },
    { text: "Hydration reminders", icon: "drop.fill" as const },
  ];

  const MessageBubble = ({ message, index }: { message: ChatMessage; index: number }) => {
    const messageScale = useSharedValue(0);
    
    useEffect(() => {
      messageScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, []);

    const messageAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: messageScale.value }],
    }));

    return (
      <Animated.View 
        key={message.id} 
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.aiMessage,
          messageAnimatedStyle
        ]}
      >
        {!message.isUser && (
          <View style={styles.aiAvatar}>
            <IconSymbol name="brain" size={20} color="white" />
          </View>
        )}
        
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
          <View style={styles.userAvatar}>
            <IconSymbol name="person.fill" size={20} color="white" />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiHeaderAvatar}>
            <IconSymbol name="brain" size={24} color="white" />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="defaultSemiBold">AI Wellness Assistant</ThemedText>
            <ThemedText style={styles.headerSubtext}>
              {isTyping ? 'Typing...' : 'Here to help your wellness journey'}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.coinIndicator}>
            <IconSymbol name="dollarsign.circle.fill" size={20} color="#FFD700" />
            <ThemedText style={styles.coinText}>+10</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <MessageBubble key={message.id} message={message} index={index} />
        ))}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.aiAvatar}>
              <IconSymbol name="brain" size={20} color="white" />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      {messages.length <= 3 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickPrompts}
        >
          {quickPrompts.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickPrompt}
              onPress={() => {
                setInputText(prompt.text);
                inputScale.value = withSequence(
                  withSpring(1.05, { damping: 15, stiffness: 150 }),
                  withSpring(1, { damping: 15, stiffness: 150 })
                );
              }}
            >
              <IconSymbol name={prompt.icon} size={16} color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.quickPromptText}>{prompt.text}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Area */}
      <ThemedView style={styles.inputArea}>
        <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
          <TextInput
            style={[
              styles.textInput,
              { 
                color: Colors[colorScheme ?? 'light'].text,
                backgroundColor: Colors[colorScheme ?? 'light'].background 
              }
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me about wellness, meditation, yoga..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            multiline
            maxLength={500}
            onFocus={() => {
              inputScale.value = withSpring(1.02, { damping: 15, stiffness: 150 });
            }}
            onBlur={() => {
              inputScale.value = withSpring(1, { damping: 15, stiffness: 150 });
            }}
          />
          
          <Animated.View style={sendButtonAnimatedStyle}>
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: inputText.trim() ? Colors[colorScheme ?? 'light'].tint : '#E0E0E0'
                }
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <IconSymbol 
                name="paperplane.fill" 
                size={20} 
                color={inputText.trim() ? 'white' : '#999'} 
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
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
    marginLeft: 4,
    color: '#F57F17',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
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
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 2,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#999',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  quickPrompts: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickPromptText: {
    fontSize: 14,
    marginLeft: 6,
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
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});