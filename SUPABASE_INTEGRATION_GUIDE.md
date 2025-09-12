# 🚀 Supabase Integration Guide for Smart Time Tracker

## Overview
This guide will help you integrate Supabase for authentication, database, and backend functionality with your Smart Time Tracker frontend.

---

## 📋 Step 1: Connect Supabase to Lovable

### 1.1 Enable Supabase Integration
1. **Click the green "Supabase" button** in the top-right of your Lovable interface
2. **Sign in to Supabase** (or create account if needed) 
3. **Create new project** or select existing one
4. **Connect your Lovable project** to Supabase

### 1.2 Automatic Configuration
Once connected, Lovable automatically configures:
- `SUPABASE_URL` environment variable
- `SUPABASE_ANON_KEY` environment variable  
- Authentication context and providers

---

## 🗄️ Step 2: Database Schema Setup

### 2.1 Create Database Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    role TEXT DEFAULT 'member',
    department TEXT,
    bio TEXT,
    working_hours TEXT DEFAULT '9:00 AM - 5:00 PM',
    timezone TEXT DEFAULT 'UTC',
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'base64'),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team memberships
CREATE TABLE public.team_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Time logs
CREATE TABLE public.time_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    team_id UUID REFERENCES public.teams(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    activity_type TEXT DEFAULT 'work',
    productivity_score INTEGER DEFAULT 0 CHECK (productivity_score >= 0 AND productivity_score <= 100),
    description TEXT,
    tags TEXT[],
    is_manual BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screenshots
CREATE TABLE public.screenshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    time_log_id UUID REFERENCES public.time_logs(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    activity_level TEXT DEFAULT 'medium' CHECK (activity_level IN ('low', 'medium', 'high')),
    metadata JSONB DEFAULT '{}',
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team invitations
CREATE TABLE public.team_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity tracking
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    team_id UUID REFERENCES public.teams(id),
    action TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Create Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_time_logs_user_date ON public.time_logs(user_id, DATE(start_time));
CREATE INDEX idx_time_logs_team_date ON public.time_logs(team_id, DATE(start_time));
CREATE INDEX idx_screenshots_user_date ON public.screenshots(user_id, DATE(captured_at));
CREATE INDEX idx_activity_logs_user_date ON public.activity_logs(user_id, DATE(timestamp));
CREATE INDEX idx_team_memberships_user ON public.team_memberships(user_id);
CREATE INDEX idx_team_memberships_team ON public.team_memberships(team_id);
```

---

## 🔐 Step 3: Row Level Security (RLS) Policies

### 3.1 Enable RLS on All Tables
```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
```

### 3.2 Create Security Policies
```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view team members profiles" ON public.profiles
    FOR SELECT USING (
        id IN (
            SELECT tm.user_id FROM public.team_memberships tm
            WHERE tm.team_id IN (
                SELECT team_id FROM public.team_memberships
                WHERE user_id = auth.uid()
            )
        )
    );

-- Teams policies
CREATE POLICY "Team members can view their teams" ON public.teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM public.team_memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Team owners can update teams" ON public.teams
    FOR UPDATE USING (owner_id = auth.uid());

-- Team memberships policies
CREATE POLICY "Users can view team memberships for their teams" ON public.team_memberships
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_memberships
            WHERE user_id = auth.uid()
        )
    );

-- Time logs policies
CREATE POLICY "Users can view own time logs" ON public.time_logs
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Team admins can view team time logs" ON public.time_logs
    FOR SELECT USING (
        team_id IN (
            SELECT tm.team_id FROM public.team_memberships tm
            WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

-- Screenshots policies
CREATE POLICY "Users can manage own screenshots" ON public.screenshots
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Team admins can view team screenshots" ON public.screenshots
    FOR SELECT USING (
        user_id IN (
            SELECT tm.user_id FROM public.team_memberships tm
            WHERE tm.team_id IN (
                SELECT team_id FROM public.team_memberships
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
            )
        )
    );
```

---

## 🔧 Step 4: Database Functions & Triggers

### 4.1 Auto-Update Triggers
```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_time_logs_updated_at
    BEFORE UPDATE ON public.time_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 4.2 Profile Creation Function
```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🔌 Step 5: API Integration in Frontend

### 5.1 Install Supabase Client (if not auto-installed)
```bash
npm install @supabase/supabase-js
```

### 5.2 Create Supabase Client
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 5.3 Update Authentication Components
Replace the TODO comments in `Login.tsx` and `Signup.tsx`:

**Login.tsx:**
```typescript
// Replace the TODO section with:
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  setError(error.message);
  return;
}

onLogin();
```

**Signup.tsx:**
```typescript
// Replace the TODO section with:
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      name: formData.name,
      company: formData.company,
    }
  }
});

if (error) {
  setError(error.message);
  return;
}

setSuccess("Account created! Please check your email to verify your account.");
```

### 5.4 Add Auth Context
Create `src/contexts/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🎯 Step 6: API Hooks for Data Fetching

### 6.1 Time Tracking Hooks
Create `src/hooks/useTimeTracking.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useTimeLog = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['timeLogs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useStartTimeTracking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { description?: string; team_id?: string }) => {
      const { data: result, error } = await supabase
        .from('time_logs')
        .insert({
          user_id: user?.id,
          start_time: new Date().toISOString(),
          description: data.description,
          team_id: data.team_id
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
    }
  });
};
```

### 6.2 Team Management Hooks
Create `src/hooks/useTeam.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useTeamMembers = (teamId?: string) => {
  return useQuery({
    queryKey: ['teamMembers', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_memberships')
        .select(`
          *,
          profiles:user_id (
            id, name, email, role, avatar_url
          )
        `)
        .eq('team_id', teamId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!teamId
  });
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { email: string; teamId: string; role?: string }) => {
      const { data: result, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: data.teamId,
          inviter_id: user?.id,
          email: data.email,
          role: data.role || 'member'
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    }
  });
};
```

---

## 📊 Step 7: Real-time Features

### 7.1 Real-time Subscriptions
Create `src/hooks/useRealtime.ts`:
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeTimeTracking = () => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('time_tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_logs',
          filter: `team_id=in.(${user.id})` // Adjust filter based on team
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Handle real-time updates
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { activeUsers };
};
```

---

## 🔧 Step 8: Environment Variables

### 8.1 Automatic Configuration
When you connect Supabase through Lovable, these are automatically set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 8.2 Additional Configuration (Optional)
For additional services, you can add secrets in Lovable:
- `STRIPE_SECRET_KEY` (for payments)
- `OPENAI_API_KEY` (for AI features)
- `SENDGRID_API_KEY` (for emails)

---

## 🚀 Step 9: Deployment

### 9.1 Deploy via Lovable
1. Click **"Publish"** in the top-right of Lovable
2. Your app deploys automatically with Supabase integration
3. Get your production URL

### 9.2 Custom Domain (Optional)
1. Go to **Project Settings > Domains** in Lovable
2. Connect your custom domain
3. Update Supabase redirect URLs accordingly

---

## ✅ Step 10: Testing the Integration

### 10.1 Test Authentication
1. Visit `/signup` and create a new account
2. Check your email for verification
3. Sign in at `/login`
4. Verify you're redirected to dashboard

### 10.2 Test Database Integration
1. Check if profile was created in Supabase
2. Test time tracking functionality
3. Verify team invitations work
4. Test real-time updates

---

## 🛠️ Troubleshooting

### Common Issues:
1. **RLS Policies**: Ensure all tables have proper RLS policies
2. **CORS**: Supabase should auto-configure CORS for Lovable domains
3. **Environment Variables**: Verify they're set correctly in Lovable
4. **Email Verification**: Configure email templates in Supabase Auth settings

### Support Resources:
- [Supabase Documentation](https://supabase.com/docs)
- [Lovable Supabase Integration Docs](https://docs.lovable.dev/integrations/supabase/)
- Lovable Discord Community

---

## 🎉 You're Ready!

Your Smart Time Tracker is now fully integrated with Supabase for:
- ✅ User authentication & profiles  
- ✅ Team management & invitations
- ✅ Time tracking & productivity analytics
- ✅ Real-time collaboration features
- ✅ Secure data storage & access control

Start tracking time and managing your team productivity! 🚀