# Supabase Setup Guide for YouMatter

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the details:
   - **Name**: YouMatter
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project" and wait for it to initialize (1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long JWT token)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root (`YouMatter/.env`):

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Gemini AI Key (if you have it)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

**Important**: Add `.env` to your `.gitignore` to keep credentials secret!

## Step 4: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INTEGER,
  gender TEXT,
  phone_number TEXT,
  height DECIMAL(5,2), -- in cm
  weight DECIMAL(5,2), -- in kg
  coins INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  daily_streak INTEGER DEFAULT 0,
  weekly_streak INTEGER DEFAULT 0,
  monthly_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coin transactions table (for tracking coin history)
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('earn', 'spend')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks completion tracking
CREATE TABLE public.task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  coins_earned INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_date DATE DEFAULT CURRENT_DATE
);

-- Create unique constraint on user_id, task_id, and completed_date
ALTER TABLE public.task_completions
ADD CONSTRAINT unique_user_task_date
UNIQUE (user_id, task_id, completed_date);

-- Badges earned
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for coin_transactions
CREATE POLICY "Users can view own transactions"
  ON public.coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.coin_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for task_completions
CREATE POLICY "Users can view own completions"
  ON public.task_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if needed (optional)
4. Email verification is enabled by default

## Step 6: Install Dependencies

Run this command in your project:

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

## Step 7: Restart Development Server

```bash
npx expo start --clear
```

## Verification

After setup, verify:
- ✅ `.env` file created with Supabase credentials
- ✅ All SQL tables created successfully
- ✅ Phone authentication enabled
- ✅ Dependencies installed
- ✅ Server restarted

## Next Steps

The app will now:
1. Allow users to sign up with phone + password
2. Automatically create user profiles
3. Track coins and rewards in database
4. Sync data across devices
5. Enable secure authentication

## Troubleshooting

**Issue**: "supabase is not defined"
- **Solution**: Make sure `.env` file is in the root directory and restart Expo

**Issue**: "Row Level Security" errors
- **Solution**: Check that RLS policies are created correctly in SQL Editor

**Issue**: Phone verification not working
- **Solution**: For development, enable "Skip phone verification" in Supabase dashboard

---

🎉 **Setup Complete!** Your app is now connected to Supabase.

