# 🚀 Supabase Quick Start

## ✅ What's Been Implemented

1. **Authentication Service** (`services/authService.ts`)
   - Phone number + password signup
   - Phone number + password login
   - Sign out
   - Session management

2. **User Service** (`services/supabaseUserService.ts`)
   - Get/Update user profile
   - Award/Spend coins
   - Complete tasks
   - Award badges
   - Track coin history
   - Manage streaks

3. **Login/Signup Screen** (`app/auth.tsx`)
   - Beautiful UI with form validation
   - Toggle between login and signup
   - Password visibility toggle
   - Phone number formatting
   - Loading states

4. **Database Schema** (SQL provided in SUPABASE_SETUP_GUIDE.md)
   - `user_profiles` table
   - `coin_transactions` table
   - `task_completions` table
   - `user_badges` table
   - Row Level Security (RLS) policies

## 📋 Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your **Project URL** and **anon key**

### 2. Add Environment Variables
Create `.env` file in `YouMatter/` folder:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

### 3. Run Database Setup
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the SQL from `SUPABASE_SETUP_GUIDE.md` (Step 4)
3. Click **Run** to create all tables

### 4. Enable Phone Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Phone** provider
3. For development: Enable "Skip phone verification"

### 5. Restart Your App
```bash
npx expo start --clear
```

## 🎯 How to Use

### Testing Authentication

1. **Sign Up**
   - Enter phone: `+1234567890`
   - Enter password: `test123456`
   - Confirm password: `test123456`
   - Click "Create Account"

2. **Sign In**
   - Enter same phone and password
   - Click "Sign In"
   - You'll be redirected to the app

### Using the Coin System

```typescript
import { supabaseUserService } from '@/services/supabaseUserService';
import { authService } from '@/services/authService';

// Get current user
const user = await authService.getCurrentUser();
if (!user) return;

// Award coins
const result = await supabaseUserService.awardCoins(
  user.id,
  50,
  'Completed daily task'
);

// Spend coins
await supabaseUserService.spendCoins(
  user.id,
  100,
  'Purchased premium feature'
);

// Complete task
await supabaseUserService.completeTask(
  user.id,
  'task-123',
  30 // coins earned
);

// Get profile
const profile = await supabaseUserService.getProfile(user.id);
console.log(profile.coins); // Current coin balance
```

## 🔧 Next Steps (TODO)

1. **Connect Profile Screen to Supabase**
   - Save profile data to database
   - Load from database instead of AsyncStorage

2. **Integrate Coins in Home Screen**
   - Show real coin balance from database
   - Award coins for task completion
   - Sync across devices

3. **Add Protected Routes**
   - Check if user is logged in
   - Redirect to auth screen if not
   - Show walkthrough after signup

4. **Implement Logout**
   - Add logout button in menu
   - Clear session
   - Redirect to login

## 🐛 Troubleshooting

**Error: "Invalid JWT"**
- Make sure your `.env` file has the correct `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Error: "Database error"**
- Check that you ran the SQL setup script in Supabase Dashboard

**Error: "Phone number already exists"**
- This phone is already registered. Try logging in instead.

**Can't login after signup**
- If using phone verification: Check your phone for OTP
- For development: Make sure "Skip phone verification" is enabled

## 📚 Learn More

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)

---

✅ **Setup Complete!** You now have a fully functional authentication and coin system powered by Supabase.

