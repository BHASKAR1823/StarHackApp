import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateWellnessResponse(userMessage: string, userContext?: {
    recentActivities?: string[];
    currentGoals?: string[];
    healthMetrics?: any;
  }): Promise<string> {
    try {
      // Create a wellness-focused prompt
      const systemPrompt = `You are a friendly AI wellness coach for the YouMatter app. Your role is to:
      - Provide personalized health and wellness advice
      - Encourage healthy habits and positive lifestyle changes
      - Give practical, actionable tips for physical and mental wellbeing
      - Be supportive, empathetic, and motivating
      - Focus on holistic wellness including exercise, nutrition, sleep, mental health, and stress management
      - Keep responses conversational and engaging
      - Use emojis and formatting to make responses visually appealing
      - Always prioritize user safety and suggest professional help when appropriate

      User context: ${userContext ? JSON.stringify(userContext) : 'No additional context available'}
      
      Respond to the following message in a helpful, encouraging way:`;

      const prompt = `${systemPrompt}\n\nUser: ${userMessage}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Gemini AI Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  async generateMotivationalMessage(): Promise<string> {
    try {
      const prompt = `Generate a short, motivational wellness message for someone using a health and wellness app. Include an emoji and keep it under 100 characters. Focus on daily wellness habits, self-care, or positive mindset.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Gemini AI Error:', error);
      return "🌟 Every small step counts toward a healthier, happier you! Keep going!";
    }
  }

  async generatePersonalizedTips(userProfile: {
    goals?: string[];
    preferences?: string[];
    challenges?: string[];
  }): Promise<string[]> {
    try {
      const prompt = `Based on this user profile: ${JSON.stringify(userProfile)}, generate 3 personalized wellness tips. Each tip should be:
      - Actionable and specific
      - Relevant to their goals and preferences  
      - Easy to implement in daily life
      - Include an emoji
      
      Format as a JSON array of strings.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const tips = JSON.parse(response.text());
      return Array.isArray(tips) ? tips : [];

    } catch (error) {
      console.error('Gemini AI Error:', error);
      return [
        "🚶‍♀️ Take a 10-minute walk after meals to boost digestion and energy",
        "💧 Start your day with a glass of water to kickstart your metabolism",
        "🧘‍♂️ Practice 5 minutes of deep breathing when you feel stressed"
      ];
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Wellness-focused fallback responses
    if (message.includes('stress') || message.includes('anxious')) {
      return `I understand you're feeling stressed. 🫂 Here are some quick techniques that can help:

🧘 **Deep Breathing**: Try the 4-7-8 technique - inhale for 4, hold for 7, exhale for 8
🚶‍♀️ **Take a Walk**: Even 5 minutes outdoors can help clear your mind
💆‍♂️ **Progressive Relaxation**: Tense and release each muscle group
🎵 **Calming Music**: Listen to something soothing

Remember, it's okay to feel stressed sometimes. You're doing great by reaching out! 💚`;
    }
    
    if (message.includes('exercise') || message.includes('workout')) {
      return `Great question about exercise! 💪 Here's what I recommend:

🏃‍♀️ **Start Small**: Even 10-15 minutes daily makes a difference
🎯 **Find What You Enjoy**: Dancing, yoga, walking, swimming - pick your favorite!
📅 **Be Consistent**: Same time each day helps build the habit
🏆 **Track Progress**: Use our app to log workouts and earn rewards!

What type of activities do you enjoy most? I can suggest a personalized routine! 🌟`;
    }
    
    if (message.includes('sleep') || message.includes('tired')) {
      return `Sleep is so important for wellness! 😴 Here are some tips for better rest:

🌙 **Sleep Schedule**: Go to bed and wake up at consistent times
📱 **Digital Detox**: No screens 1 hour before bed
🛏️ **Sleep Environment**: Cool, dark, and quiet room
☕ **Limit Caffeine**: Avoid after 2 PM
🧘‍♀️ **Relaxation**: Try gentle stretches or meditation before bed

Quality sleep helps with mood, focus, and physical health. Sweet dreams! ✨`;
    }
    
    if (message.includes('nutrition') || message.includes('food') || message.includes('eat')) {
      return `Nutrition is fuel for your wellness journey! 🥗 Here are some healthy eating tips:

🌈 **Eat the Rainbow**: Include colorful fruits and vegetables
💧 **Stay Hydrated**: Aim for 8 glasses of water daily  
🍽️ **Mindful Eating**: Eat slowly and listen to hunger cues
🥜 **Balanced Meals**: Include protein, healthy fats, and complex carbs
📝 **Meal Prep**: Plan ahead for healthier choices

What's your biggest nutrition challenge? I'm here to help! 💚`;
    }
    
    // General wellness response
    return `Thank you for reaching out! 🌟 I'm here to support your wellness journey. 

Whether you're looking for advice on:
• Exercise and fitness 💪
• Stress management 🧘‍♀️  
• Better sleep habits 😴
• Healthy nutrition 🥗
• Mental wellness 💚

Just let me know what's on your mind, and I'll provide personalized tips to help you thrive! 

What aspect of wellness would you like to focus on today?`;
  }

  // Check if API key is configured
  isConfigured(): boolean {
    return API_KEY !== '' && API_KEY !== undefined;
  }
}

export const geminiAIService = new GeminiAIService();