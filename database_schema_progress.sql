-- SportTeams - Progress DB Schema
-- Migration from Supabase to Progress DB with Enhanced Security
-- Created: 2025-01-16

-- =============================================
-- PHASE 1: CORE INFRASTRUCTURE TABLES
-- =============================================

-- Languages Table (Multi-language support)
CREATE TABLE languages (
    id INTEGER NOT NULL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_languages_code (code),
    INDEX idx_languages_active (is_active)
);

-- Translations Table (Optimized for performance)
CREATE TABLE translations (
    id INTEGER NOT NULL PRIMARY KEY,
    translation_key VARCHAR(100) NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    value CLOB,
    context VARCHAR(50),
    namespace VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX uk_translations (translation_key, language_code),
    INDEX idx_translations_namespace (namespace),
    INDEX idx_translations_context (context)
);

-- =============================================
-- PHASE 2: USER MANAGEMENT & SECURITY
-- =============================================

-- Users Table (Replaces Supabase auth.users)
CREATE TABLE users (
    id INTEGER NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email)
);

-- Profiles Table (Enhanced with security fields)
CREATE TABLE profiles (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'player', -- admin, coach, player, team_admin
    is_active BOOLEAN DEFAULT TRUE,
    photo VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    preferred_language VARCHAR(5) DEFAULT 'nl',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profiles_user_id (user_id),
    INDEX idx_profiles_role (role),
    INDEX idx_profiles_active (is_active)
);

-- User Security Contexts (Team-scoped access control)
CREATE TABLE user_security_contexts (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL,
    team_scopes CLOB, -- JSON array of team IDs
    permissions CLOB, -- JSON object of permissions
    session_token_hash VARCHAR(64),
    expires_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_security_user_id (user_id),
    INDEX idx_security_session (session_token_hash),
    INDEX idx_security_expires (expires_at)
);

-- Refresh Tokens (For JWT token rotation)
CREATE TABLE refresh_tokens (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_user (user_id),
    INDEX idx_refresh_tokens_hash (token_hash),
    INDEX idx_refresh_tokens_expires (expires_at)
);

-- =============================================
-- PHASE 3: BUSINESS DOMAIN TABLES
-- =============================================

-- Teams Table
CREATE TABLE teams (
    id INTEGER NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- youth, senior, etc.
    description CLOB,
    is_active BOOLEAN DEFAULT TRUE,
    season VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_teams_active (is_active),
    INDEX idx_teams_category (category),
    INDEX idx_teams_season (season)
);

-- Team Memberships (Enhanced role-based team access)
CREATE TABLE team_memberships (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL, -- head_coach, assistant_coach, player, team_admin
    permissions CLOB, -- JSON: specific permissions for this team
    granted_by INTEGER, -- who granted this access
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id),
    
    UNIQUE INDEX uk_user_team (user_id, team_id),
    INDEX idx_team_memberships_team (team_id),
    INDEX idx_team_memberships_role (role),
    INDEX idx_team_memberships_active (is_active)
);

-- Players Table (Enhanced with additional fields)
CREATE TABLE players (
    id INTEGER NOT NULL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    jersey_number INTEGER,
    position VARCHAR(50),
    date_of_birth DATE,
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    dominant_hand VARCHAR(10), -- left, right, both
    is_active BOOLEAN DEFAULT TRUE,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    
    UNIQUE INDEX uk_player_jersey_team (team_id, jersey_number),
    INDEX idx_players_team_active (team_id, is_active),
    INDEX idx_players_profile (profile_id),
    INDEX idx_players_position (position)
);

-- =============================================
-- PHASE 4: EVALUATION & ASSESSMENT SYSTEM
-- =============================================

-- Test Categories
CREATE TABLE test_categories (
    id INTEGER NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description CLOB,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_test_categories_active (is_active)
);

-- Tests Table (Enhanced)
CREATE TABLE tests (
    id INTEGER NOT NULL PRIMARY KEY,
    category_id INTEGER,
    name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- skill_test, fitness_test, evaluation, etc.
    description CLOB,
    scoring_method VARCHAR(50), -- numeric, rating, boolean
    min_score DECIMAL(10,2),
    max_score DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_by_profile_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES test_categories(id),
    FOREIGN KEY (created_by_profile_id) REFERENCES profiles(id),
    
    INDEX idx_tests_category (category_id),
    INDEX idx_tests_type (test_type),
    INDEX idx_tests_active (is_active)
);

-- Test Results (Enhanced with metadata)
CREATE TABLE test_results (
    id INTEGER NOT NULL PRIMARY KEY,
    test_id INTEGER NOT NULL,
    player_profile_id INTEGER NOT NULL,
    coach_profile_id INTEGER,
    score DECIMAL(10,2),
    notes CLOB,
    test_conditions CLOB, -- JSON: weather, equipment, etc.
    visible_to_player BOOLEAN DEFAULT TRUE,
    visible_to_parents BOOLEAN DEFAULT FALSE,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (player_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_profile_id) REFERENCES profiles(id),
    
    INDEX idx_test_results_player_date (player_profile_id, test_date DESC),
    INDEX idx_test_results_test (test_id),
    INDEX idx_test_results_coach (coach_profile_id)
);

-- Player Evaluations (Enhanced structure)
CREATE TABLE player_evaluations (
    id INTEGER NOT NULL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    evaluator_profile_id INTEGER NOT NULL,
    evaluation_period VARCHAR(50), -- monthly, seasonal, etc.
    strong_points CLOB NOT NULL,
    improvement_points CLOB NOT NULL,
    coach_notes CLOB,
    development_plan CLOB,
    next_review_date DATE,
    overall_rating INTEGER, -- 1-10 scale
    technical_rating INTEGER,
    tactical_rating INTEGER,
    physical_rating INTEGER,
    mental_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_profile_id) REFERENCES profiles(id),
    
    INDEX idx_evaluations_player (player_id),
    INDEX idx_evaluations_evaluator (evaluator_profile_id),
    INDEX idx_evaluations_period (evaluation_period)
);

-- =============================================
-- PHASE 5: PERFORMANCE TRACKING
-- =============================================

-- Player Goals (Enhanced)
CREATE TABLE player_goals (
    id INTEGER NOT NULL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- technical, tactical, physical, mental
    title VARCHAR(255) NOT NULL,
    description CLOB NOT NULL,
    target_date DATE,
    completion_percentage INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused, cancelled
    priority VARCHAR(10) DEFAULT 'medium', -- high, medium, low
    measurable_criteria CLOB, -- JSON: specific criteria
    progress_notes CLOB,
    created_by_profile_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_profile_id) REFERENCES profiles(id),
    
    INDEX idx_goals_player (player_id),
    INDEX idx_goals_status (status),
    INDEX idx_goals_type (goal_type)
);

-- Player Feedback (Enhanced with video support)
CREATE TABLE player_feedback (
    id INTEGER NOT NULL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    created_by_coach_id INTEGER NOT NULL,
    feedback_type VARCHAR(50) NOT NULL, -- game_analysis, training_feedback, etc.
    game_principle VARCHAR(100),
    category_skill VARCHAR(100),
    feedback_text CLOB NOT NULL,
    video1_url VARCHAR(500),
    video1_description CLOB,
    video2_url VARCHAR(500),
    video2_description CLOB,
    is_positive BOOLEAN,
    priority VARCHAR(10) DEFAULT 'medium',
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_coach_id) REFERENCES profiles(id),
    
    INDEX idx_feedback_player (player_id),
    INDEX idx_feedback_coach (created_by_coach_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_feedback_follow_up (follow_up_required, follow_up_date)
);

-- =============================================
-- PHASE 6: AUDIT & LOGGING
-- =============================================

-- Access Audit Log (Security monitoring)
CREATE TABLE profile_access_logs (
    id INTEGER NOT NULL PRIMARY KEY,
    viewer_id INTEGER NOT NULL,
    target_profile_id INTEGER NOT NULL,
    access_type VARCHAR(50) NOT NULL, -- view, edit, delete, etc.
    resource_type VARCHAR(50), -- player, evaluation, goal, etc.
    resource_id INTEGER,
    ip_address VARCHAR(45),
    user_agent CLOB,
    context CLOB, -- JSON: additional context
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (viewer_id) REFERENCES profiles(id),
    FOREIGN KEY (target_profile_id) REFERENCES profiles(id),
    
    INDEX idx_access_logs_viewer (viewer_id),
    INDEX idx_access_logs_target (target_profile_id),
    INDEX idx_access_logs_timestamp (timestamp),
    INDEX idx_access_logs_type (access_type)
);

-- Application Settings
CREATE TABLE app_settings (
    id INTEGER NOT NULL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value CLOB NOT NULL,
    description CLOB,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES profiles(id),
    INDEX idx_settings_key (setting_key)
);

-- =============================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =============================================

-- Player Summary View (for dashboard performance)
CREATE VIEW player_team_summary AS
SELECT 
    p.id,
    p.profile_id,
    p.team_id,
    p.jersey_number,
    p.position,
    pr.name as player_name,
    pr.email,
    pr.phone,
    t.name as team_name,
    t.category as team_category,
    COUNT(pe.id) as evaluations_count,
    AVG(tr.score) as avg_test_score,
    MAX(pe.created_at) as last_evaluation_date,
    COUNT(pg.id) as active_goals_count,
    p.is_active,
    p.created_at
FROM players p
JOIN profiles pr ON p.profile_id = pr.id
JOIN teams t ON p.team_id = t.id
LEFT JOIN player_evaluations pe ON pe.player_id = p.id
LEFT JOIN test_results tr ON tr.player_profile_id = p.profile_id
LEFT JOIN player_goals pg ON pg.player_id = p.id AND pg.status = 'active'
WHERE p.is_active = 1
GROUP BY p.id, p.profile_id, p.team_id, p.jersey_number, p.position, 
         pr.name, pr.email, pr.phone, t.name, t.category, p.is_active, p.created_at;

-- =============================================
-- INDEXES FOR OPTIMAL PERFORMANCE
-- =============================================

-- Additional performance indexes
CREATE INDEX idx_test_results_player_score ON test_results(player_profile_id, score DESC);
CREATE INDEX idx_evaluations_date ON player_evaluations(created_at DESC);
CREATE INDEX idx_goals_target_date ON player_goals(target_date);
CREATE INDEX idx_feedback_date ON player_feedback(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_team_memberships_user_active ON team_memberships(user_id, is_active);
CREATE INDEX idx_players_team_position ON players(team_id, position, is_active);
CREATE INDEX idx_test_results_date_range ON test_results(test_date, player_profile_id);

-- =============================================
-- COMPLETION NOTES
-- =============================================

-- This schema provides:
-- 1. Enhanced security with team-scoped access
-- 2. Performance optimization through proper indexing
-- 3. Comprehensive audit logging
-- 4. Multi-language support infrastructure
-- 5. Flexible evaluation and goal tracking system
-- 6. Materialized views for dashboard performance

-- Next Steps:
-- 1. Create stored procedures for secure data access
-- 2. Implement connection pooling configuration
-- 3. Setup initial data seeding
-- 4. Create Laravel migrations from this schema