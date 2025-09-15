import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signUpWithInvite: (email: string, password: string, inviteToken: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  validateInvite: (token: string) => Promise<{ valid: boolean; invitation?: any; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: userData?.name || '',
          company: userData?.company || '',
          role: 'admin', // Admin signup
        }
      }
    });
    return { error };
  };

  const signUpWithInvite = async (email: string, password: string, inviteToken: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // First validate the invitation
    const { valid, invitation, error: inviteError } = await validateInvite(inviteToken);
    if (!valid || inviteError) {
      return { error: inviteError || new Error('Invalid invitation token') };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: userData?.name || '',
          company: userData?.company || '',
          role: 'member', // Team member signup
          invite_token: inviteToken,
          team_id: invitation?.team_id,
        }
      }
    });

    if (!error && invitation) {
      // Mark invitation as used
      await supabase
        .from('invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('token', inviteToken);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const validateInvite = async (token: string) => {
    try {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select(`
          *,
          teams:team_id (
            id,
            name,
            description
          )
        `)
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        return { valid: false, error };
      }

      return { valid: true, invitation };
    } catch (error) {
      return { valid: false, error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signUpWithInvite,
    signOut,
    validateInvite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};