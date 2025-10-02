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
    userName?: string;
    userAge?: string;
    userGender?: string;
    userHeight?: string;
    userWeight?: string;
    recentActivities?: string[];
    currentGoals?: string[];
    healthMetrics?: any;
  }): Promise<string> {
    try {
      // Build personalized context
      let contextString = 'No additional user information available.';
      if (userContext) {
        const parts = [];
        if (userContext.userName) parts.push(`Name: ${userContext.userName}`);
        if (userContext.userAge) parts.push(`Age: ${userContext.userAge}`);
        if (userContext.userGender) parts.push(`Gender: ${userContext.userGender}`);
        if (userContext.userHeight) parts.push(`Height: ${userContext.userHeight} cm`);
        if (userContext.userWeight) parts.push(`Weight: ${userContext.userWeight} kg`);
        if (parts.length > 0) {
          contextString = parts.join(', ');
        }
      }

      // Create a wellness-focused prompt
      const systemPrompt = `You are a friendly AI wellness coach for YouMatter app. Keep responses:
      - CONCISE: 2-3 sentences max, no long paragraphs
      - ACTIONABLE: Give 1-2 specific tips, not general advice
      - PERSONAL: Use their name if known
      - POSITIVE: Encouraging but brief
      - PRACTICAL: Focus on what they can do today
      - Use 1-2 emojis, avoid excessive formatting

      User info: ${contextString}
      
      Give a short, helpful response:`;

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
      return `Try the 4-7-8 breathing technique: inhale 4, hold 7, exhale 8. 🧘‍♀️ A quick 5-minute walk can also help clear your mind!`;
    }
    
    if (message.includes('exercise') || message.includes('workout')) {
      return `Start with 10-15 minutes daily of any activity you enjoy! 💪 Consistency beats intensity - same time each day works best.`;
    }
    
    if (message.includes('sleep') || message.includes('tired')) {
      return `Try a consistent bedtime and no screens 1 hour before sleep. � Keep your room cool and dark for better rest!`;
    }
    
    if (message.includes('nutrition') || message.includes('food') || message.includes('eat')) {
      return `Focus on colorful fruits and vegetables, drink 8 glasses of water daily. 🥗 Eat slowly and listen to your hunger cues!`;
    }
    
    // General wellness response
    return `I'm here to help with exercise, nutrition, sleep, or stress management! 🌟 What would you like to focus on today?`;
  }

  // Check if API key is configured
  isConfigured(): boolean {
    return API_KEY !== '' && API_KEY !== undefined;
  }
}

export const geminiAIService = new GeminiAIService();