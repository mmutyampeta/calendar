# Supabase Setup Guide

## 1. Install Node.js (if not already installed)
```bash
brew install node
```

## 2. Install Supabase Packages
```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 3. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project (choose a name, database password, and region)
4. Wait for the project to be provisioned (~2 minutes)

## 4. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 5. Configure Environment Variables

1. Open `.env.local` in your project
2. Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

## 6. Run Your Application
```bash
npm run dev
```

## 7. Test Authentication

1. Visit `http://localhost:3000/login`
2. Sign up with an email and password
3. Check your email for a confirmation link (if email confirmation is enabled)
4. Sign in and you'll be redirected to the home page
5. Visit `http://localhost:3000/protected` to see a protected page

## Database Setup (Optional)

To create tables for your calendar app, go to **SQL Editor** in Supabase and run:

\`\`\`sql
-- Enable Row Level Security
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);
\`\`\`

## File Structure Created

- `/lib/supabase/client.ts` - Client-side Supabase client (for Client Components)
- `/lib/supabase/server.ts` - Server-side Supabase client (for Server Components)
- `/lib/supabase/middleware.ts` - Middleware helper for session management
- `/middleware.ts` - Next.js middleware for auth protection
- `/app/login/page.tsx` - Login/signup page
- `/app/protected/page.tsx` - Example protected page
- `/app/auth/signout/route.ts` - Sign out API route

## Next Steps

- Customize the middleware to protect specific routes
- Create database tables for your calendar application
- Build calendar UI components
- Add real-time subscriptions for collaborative features

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Documentation](https://nextjs.org/docs)
