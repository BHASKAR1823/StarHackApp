# 🔑 Environment Setup Guide

## Setting up Gemini AI Integration

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

1. Open the `.env` file in the root directory of the project
2. Replace `your_gemini_api_key_here` with your actual API key:

```
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Security Notes

⚠️ **Important Security Information:**

- The `.env` file is already added to `.gitignore` to prevent accidental commits
- Never share your API key publicly or commit it to version control
- The `EXPO_PUBLIC_` prefix makes the variable available in the Expo app
- For production apps, use more secure environment variable management

### 4. Testing the Integration

1. Save the `.env` file with your API key
2. Restart the Expo development server:
   ```bash
   npx expo start --clear
   ```
3. Open the AI Chat tab in the app
4. Try asking a wellness question like "How can I reduce stress?"

### 5. Fallback Behavior

If the API key is not configured or there's an error:
- The app will fall back to predefined wellness responses
- Users will still get helpful advice, just not from Gemini AI
- Check the console for any API errors

### 6. API Usage Limits

- Google Gemini has generous free tier limits
- Monitor your usage in the Google AI Studio console
- Consider implementing rate limiting for production use

## Environment File Structure

Your `.env` file should look like this:

```bash
# Google Gemini AI API Key
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here

# Add other environment variables as needed
# EXPO_PUBLIC_OTHER_SERVICE_KEY=your_other_key
```

## Troubleshooting

### Common Issues:

1. **"API key not configured" error**
   - Make sure your `.env` file is in the root directory
   - Restart the Expo server after adding the key
   - Check that the variable name is exactly `EXPO_PUBLIC_GEMINI_API_KEY`

2. **API requests failing**
   - Verify your API key is valid in Google AI Studio
   - Check your internet connection
   - Look for error messages in the console

3. **Environment variable not found**
   - Ensure you're using `EXPO_PUBLIC_` prefix
   - Restart the development server
   - Clear Metro cache with `--clear` flag

### Getting Help:

- Check the [Google AI Studio documentation](https://ai.google.dev/)
- Review [Expo environment variables guide](https://docs.expo.dev/guides/environment-variables/)
- Look at the console logs for specific error messages