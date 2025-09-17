-- Create audit logs table for tracking user actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit logs - only admins can view all logs, users can view their own
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for system to insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Update profiles table RLS policies for proper RBAC
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- New RBAC policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles in their teams" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.teams 
      WHERE teams.admin_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.team_id = teams.id 
        AND team_members.user_id = profiles.user_id
      )
    )
  )
);

CREATE POLICY "Team members can view profiles in their teams" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid() 
    AND tm2.user_id = profiles.user_id
  )
);

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  action_type TEXT,
  event_details JSONB DEFAULT NULL,
  target_user_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    COALESCE(target_user_id, auth.uid()),
    action_type,
    event_details
  );
END;
$$;

-- Update handle_new_user function to log signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email, company, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
  );
  
  -- Log the signup event
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.id,
    'user_signup',
    jsonb_build_object(
      'email', NEW.email,
      'role', COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
      'company', COALESCE(NEW.raw_user_meta_data->>'company', ''),
      'signup_method', CASE 
        WHEN NEW.raw_user_meta_data->>'invite_token' IS NOT NULL THEN 'invite'
        ELSE 'direct'
      END
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to log invitations
CREATE OR REPLACE FUNCTION public.log_invitation_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.invited_by,
    'invitation_created',
    jsonb_build_object(
      'invited_email', NEW.email,
      'team_id', NEW.team_id,
      'expires_at', NEW.expires_at
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_invitation_trigger
  AFTER INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_invitation_created();

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Add email verification requirement by updating auth policies
-- Note: Email verification will be enforced in the application logic