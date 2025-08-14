-- Database dump created: 2025-01-14
-- Hockey SportTeams Application
-- Supabase Project: mxmviqrtmtuhhlxohwpd

-- =============================================
-- FULL DATABASE DUMP INCLUDING SCHEMA & RLS
-- =============================================

-- Drop all existing tables (clean slate)
DROP TABLE IF EXISTS public.user_privacy_settings CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.translations CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.team_coaches CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.profile_access_logs CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.player_goals CASCADE;
DROP TABLE IF EXISTS public.player_feedback CASCADE;
DROP TABLE IF EXISTS public.player_evaluations CASCADE;
DROP TABLE IF EXISTS public.languages CASCADE;
DROP TABLE IF EXISTS public.demo_requests CASCADE;
DROP TABLE IF EXISTS public.at_codes CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- =============================================
-- TABLE DEFINITIONS
-- =============================================

-- App Settings Table
CREATE TABLE public.app_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- AT Codes Table
CREATE TABLE public.at_codes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL,
    description text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    extended_description text
);

-- Demo Requests Table
CREATE TABLE public.demo_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    club text NOT NULL,
    role text NOT NULL,
    message text,
    status text NOT NULL DEFAULT 'new'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Languages Table
CREATE TABLE public.languages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code character varying NOT NULL,
    name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Profiles Table (User profiles)
CREATE TABLE public.profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    photo text,
    selected_team_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Teams Table
CREATE TABLE public.teams (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Players Table
CREATE TABLE public.players (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid,
    team_id uuid,
    jersey_number integer,
    position text,
    date_of_birth date,
    action_type text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Team Coaches Table
CREATE TABLE public.team_coaches (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_profile_id uuid,
    team_id uuid,
    coach_name text,
    team_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone
);

-- Tests Table
CREATE TABLE public.tests (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    test_type text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_by_profile_id uuid,
    created_by_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Test Results Table
CREATE TABLE public.test_results (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id uuid NOT NULL,
    player_profile_id uuid NOT NULL,
    coach_profile_id uuid,
    score numeric,
    notes text,
    visible_to_player boolean DEFAULT true,
    visible_to_coach boolean DEFAULT true,
    test_date timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    player_name text NOT NULL,
    coach_name text,
    test_name text NOT NULL,
    test_type text NOT NULL
);

-- Player Evaluations Table
CREATE TABLE public.player_evaluations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id uuid NOT NULL,
    test_id uuid,
    strong_points text NOT NULL,
    improvement_points text NOT NULL,
    coach_notes text NOT NULL,
    self_assessment integer,
    team_contribution integer,
    motivation integer,
    goals_achievement integer,
    season_goals text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Player Goals Table
CREATE TABLE public.player_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id uuid NOT NULL,
    player_name text NOT NULL,
    skills jsonb NOT NULL,
    team_goals text NOT NULL,
    improvement_goals text NOT NULL,
    team_importance text NOT NULL,
    teammate_help text NOT NULL,
    teammates_perspective text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Player Feedback Table
CREATE TABLE public.player_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id uuid NOT NULL,
    created_by_coach_id uuid NOT NULL,
    game_principle text NOT NULL,
    category_skill_id text NOT NULL,
    gp_text text NOT NULL,
    video1_url text,
    video1_text text,
    video2_url text,
    video2_text text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Translations Table
CREATE TABLE public.translations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    language_code character varying NOT NULL,
    value text NOT NULL,
    category text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Preferences Table
CREATE TABLE public.user_preferences (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    language_code character varying NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Privacy Settings Table
CREATE TABLE public.user_privacy_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    profile_visibility text NOT NULL DEFAULT 'team'::text,
    show_email_to_teammates boolean NOT NULL DEFAULT true,
    show_photo_to_others boolean NOT NULL DEFAULT true,
    allow_cross_team_view boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Profile Access Logs Table
CREATE TABLE public.profile_access_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    viewer_id uuid NOT NULL,
    target_profile_id uuid NOT NULL,
    access_type text NOT NULL,
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    ip_address inet,
    user_agent text,
    context jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.at_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DATABASE FUNCTIONS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Security functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'coach' 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_player()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'player' 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_coach_for_team(team_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.team_coaches tc
    JOIN public.profiles p ON p.id = tc.coach_profile_id
    WHERE p.user_id = auth.uid() 
    AND tc.team_id = team_id_param
    AND p.role = 'coach'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Profile management functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    INSERT INTO public.profiles (
      user_id, 
      name, 
      email, 
      role, 
      is_active,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      'general',
      true,
      now(),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Role validation and management
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- App Settings Policies
CREATE POLICY "App settings are viewable by authenticated users" ON public.app_settings
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage app settings" ON public.app_settings
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- AT Codes Policies
CREATE POLICY "AT codes are viewable by authenticated users" ON public.at_codes
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage AT codes" ON public.at_codes
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Demo Requests Policies
CREATE POLICY "Admins can view all demo requests" ON public.demo_requests
FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage demo requests" ON public.demo_requests
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Languages Policies
CREATE POLICY "Languages are viewable by authenticated users" ON public.languages
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage languages" ON public.languages
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Profiles Policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Teams Policies
CREATE POLICY "All authenticated users can view teams" ON public.teams
FOR SELECT USING (true);

CREATE POLICY "Admins can manage teams" ON public.teams
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Players Policies
CREATE POLICY "Players are viewable by authenticated users" ON public.players
FOR SELECT USING (true);

CREATE POLICY "Admins can manage all players" ON public.players
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Team Coaches Policies
CREATE POLICY "Team coaches viewable by authenticated users" ON public.team_coaches
FOR SELECT USING (true);

CREATE POLICY "Coaches can view their own assignments" ON public.team_coaches
FOR SELECT USING (coach_profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Admins can manage team coaches" ON public.team_coaches
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Tests Policies
CREATE POLICY "Active tests are viewable by authenticated users" ON public.tests
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all tests" ON public.tests
FOR ALL USING (true) WITH CHECK (true);

-- Test Results Policies
CREATE POLICY "Admins can manage all test results" ON public.test_results
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Coaches can view team test results" ON public.test_results
FOR SELECT USING (is_coach() AND visible_to_coach = true AND player_profile_id IN (
  SELECT p.id FROM players p
  JOIN team_coaches tc ON tc.team_id = p.team_id
  JOIN profiles prof ON prof.id = tc.coach_profile_id
  WHERE prof.user_id = auth.uid()
));

CREATE POLICY "Players can view their own test results" ON public.test_results
FOR SELECT USING (is_player() AND player_profile_id IN (
  SELECT pl.id FROM players pl
  JOIN profiles p ON p.id = pl.profile_id
  WHERE p.user_id = auth.uid()
) AND visible_to_player = true);

-- Additional RLS policies for other tables...
-- (Player evaluations, goals, feedback, translations, user preferences, etc.)

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp triggers
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_at_codes_updated_at
BEFORE UPDATE ON public.at_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Role validation trigger
CREATE TRIGGER validate_role_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_role_change();

-- New user handling trigger
CREATE TRIGGER on_auth_user_created
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- END OF DUMP
-- =============================================