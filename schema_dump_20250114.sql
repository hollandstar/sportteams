-- Schema-only dump created: 2025-01-14
-- Hockey SportTeams Application - Schema Structure
-- Supabase Project: mxmviqrtmtuhhlxohwpd

-- =============================================
-- CURRENT DATABASE SCHEMA STRUCTURE
-- =============================================

-- Database Tables Summary:
-- Total Tables: 17
-- All tables have RLS enabled
-- All tables have triggers for timestamp management

-- =============================================
-- TABLE STRUCTURES (Schema Only)
-- =============================================

-- 1. APP_SETTINGS
-- Purpose: Application configuration settings
CREATE TABLE public.app_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. AT_CODES  
-- Purpose: Action Type codes for player assessments
CREATE TABLE public.at_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL,
    description text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    extended_description text
);

-- 3. DEMO_REQUESTS
-- Purpose: Demo access requests from potential users
CREATE TABLE public.demo_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    club text NOT NULL,
    role text NOT NULL,
    message text,
    status text NOT NULL DEFAULT 'new',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. LANGUAGES
-- Purpose: Supported languages for internationalization
CREATE TABLE public.languages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code character varying NOT NULL,
    name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. PLAYER_EVALUATIONS
-- Purpose: Player evaluation forms and assessments
CREATE TABLE public.player_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 6. PLAYER_FEEDBACK
-- Purpose: Video feedback and coaching notes for players
CREATE TABLE public.player_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 7. PLAYER_GOALS
-- Purpose: Player goal setting and tracking
CREATE TABLE public.player_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 8. PLAYERS
-- Purpose: Player roster and basic information
CREATE TABLE public.players (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 9. PROFILE_ACCESS_LOGS
-- Purpose: Security and audit logging for profile access
CREATE TABLE public.profile_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id uuid NOT NULL,
    target_profile_id uuid NOT NULL,
    access_type text NOT NULL,
    timestamp timestamp with time zone NOT NULL DEFAULT now(),
    ip_address inet,
    user_agent text,
    context jsonb DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 10. PROFILES
-- Purpose: User profiles and role management
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 11. TEAM_COACHES
-- Purpose: Coach to team assignments with denormalized names
CREATE TABLE public.team_coaches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_profile_id uuid,
    team_id uuid,
    coach_name text,
    team_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone
);

-- 12. TEAMS
-- Purpose: Team information and categories
CREATE TABLE public.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 13. TEST_RESULTS
-- Purpose: Test scores and evaluation results
CREATE TABLE public.test_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 14. TESTS
-- Purpose: Test definitions and types
CREATE TABLE public.tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    test_type text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_by_profile_id uuid,
    created_by_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 15. TRANSLATIONS
-- Purpose: Multi-language support for UI elements
CREATE TABLE public.translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL,
    language_code character varying NOT NULL,
    value text NOT NULL,
    category text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 16. USER_PREFERENCES
-- Purpose: User language and preference settings
CREATE TABLE public.user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    language_code character varying NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 17. USER_PRIVACY_SETTINGS
-- Purpose: Privacy controls for user data sharing
CREATE TABLE public.user_privacy_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    profile_visibility text NOT NULL DEFAULT 'team',
    show_email_to_teammates boolean NOT NULL DEFAULT true,
    show_photo_to_others boolean NOT NULL DEFAULT true,
    allow_cross_team_view boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =============================================
-- SECURITY FUNCTIONS SUMMARY
-- =============================================

-- Core security functions:
-- - is_admin(): Check if current user is admin
-- - is_coach(): Check if current user is coach  
-- - is_player(): Check if current user is player
-- - is_coach_for_team(uuid): Check coach assignment to specific team
-- - get_current_user_role(): Get current user's role

-- Profile management functions:
-- - handle_new_user(): Auto-create profile on user signup
-- - validate_role_change(): Enforce role change permissions
-- - handle_profile_updates(): Update timestamp trigger

-- =============================================
-- RLS POLICY SUMMARY
-- =============================================

-- SECURITY MODEL:
-- Admin: Full access to all data
-- Coach: Team-scoped access to players and related data
-- Player: Self-only access to own data
-- General: Limited read access

-- KEY RLS PATTERNS:
-- 1. Admin bypass: is_admin() for full access
-- 2. Team-scoped: Coach can see players on their assigned teams
-- 3. Self-only: Players see only their own records
-- 4. Public read: Some tables (teams, tests) readable by all authenticated users

-- CRITICAL SECURITY NOTE:
-- Current players table has overly permissive SELECT policy:
-- "Players are viewable by authenticated users" USING (true)
-- This allows any authenticated user to see all players.
-- Should be tightened to team-scoped access.

-- =============================================
-- IDENTIFIED SECURITY ISSUES
-- =============================================

-- 1. CRITICAL: Players table exposure
--    Current: Any authenticated user can view all players
--    Should: Team-scoped access (coaches see team players, players see themselves)

-- 2. MEDIUM: Profiles table exposure  
--    Current: Any authenticated user can view all profiles
--    Impact: Personal information visible across teams

-- 3. Recommended: Implement "Team admin" role
--    Purpose: Delegate player roster management without full admin privileges

-- =============================================
-- STAGING MIGRATION PLAN
-- =============================================

-- Phase 1: Tighten players table RLS (Ready for staging)
-- Phase 2: Tighten profiles table RLS 
-- Phase 3: Introduce team admin role and permissions
-- Phase 4: Update frontend components for new security model

-- See: doc/migrations/phase1-tighten-players-rls.sql
-- See: doc/staging-setup-checklist.md