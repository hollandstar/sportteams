-- SportTeams - PostgreSQL Schema
-- Migration from Supabase to PostgreSQL with Enhanced Security
-- Created: 2025-01-16

-- =============================================
-- PHASE 1: CORE INFRASTRUCTURE TABLES
-- =============================================

-- Languages Table (Multi-language support)
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active);

-- Translations Table (Optimized for performance)
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    translation_key VARCHAR(100) NOT NULL,
    language_code VARCHAR(5) NOT NULL,
    value TEXT,
    context VARCHAR(50),
    namespace VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(translation_key, language_code)
);

CREATE INDEX IF NOT EXISTS idx_translations_namespace ON translations(namespace);
CREATE INDEX IF NOT EXISTS idx_translations_context ON translations(context);

-- =============================================
-- PHASE 2: USER MANAGEMENT & SECURITY
-- =============================================

-- Users Table (Replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Profiles Table (Enhanced with security fields)
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'player', -- admin, coach, player, team_admin
    is_active BOOLEAN DEFAULT TRUE,
    photo VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    preferred_language VARCHAR(5) DEFAULT 'nl',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);

-- User Security Contexts (Team-scoped access control)
CREATE TABLE IF NOT EXISTS user_security_contexts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    team_scopes JSONB, -- JSON array of team IDs
    permissions JSONB, -- JSON object of permissions  
    session_token_hash VARCHAR(64),
    expires_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_user_id ON user_security_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_session ON user_security_contexts(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_security_expires ON user_security_contexts(expires_at);

-- Refresh Tokens (For JWT token rotation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- =============================================
-- PHASE 3: BUSINESS DOMAIN TABLES  
-- =============================================

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- youth, senior, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    season VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_category ON teams(category);
CREATE INDEX IF NOT EXISTS idx_teams_season ON teams(season);

-- Team Memberships (Enhanced role-based team access)
CREATE TABLE IF NOT EXISTS team_memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- head_coach, assistant_coach, player, team_admin
    permissions JSONB, -- JSON: specific permissions for this team
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_role ON team_memberships(role);
CREATE INDEX IF NOT EXISTS idx_team_memberships_active ON team_memberships(is_active);

-- Players Table (Enhanced with additional fields)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    jersey_number INTEGER,
    position VARCHAR(50),
    date_of_birth DATE,
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    dominant_hand VARCHAR(10), -- left, right, both
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(team_id, jersey_number)
);

CREATE INDEX IF NOT EXISTS idx_players_team_active ON players(team_id, is_active);
CREATE INDEX IF NOT EXISTS idx_players_profile ON players(profile_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);

-- =============================================
-- PHASE 4: EVALUATION & ASSESSMENT SYSTEM
-- =============================================

-- Test Categories
CREATE TABLE IF NOT EXISTS test_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_categories_active ON test_categories(is_active);

-- Tests Table (Enhanced)
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES test_categories(id),
    name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- skill_test, fitness_test, evaluation, etc.
    description TEXT,
    scoring_method VARCHAR(50), -- numeric, rating, boolean
    min_score DECIMAL(10,2),
    max_score DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_by_profile_id INTEGER REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tests_category ON tests(category_id);
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(test_type);
CREATE INDEX IF NOT EXISTS idx_tests_active ON tests(is_active);

-- Test Results (Enhanced with metadata)
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    player_profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coach_profile_id INTEGER REFERENCES profiles(id),
    score DECIMAL(10,2),
    notes TEXT,
    test_conditions JSONB, -- JSON: weather, equipment, etc.
    visible_to_player BOOLEAN DEFAULT TRUE,
    visible_to_parents BOOLEAN DEFAULT FALSE,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_results_player_date ON test_results(player_profile_id, test_date DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_test ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_coach ON test_results(coach_profile_id);

-- Player Evaluations (Enhanced structure)
CREATE TABLE IF NOT EXISTS player_evaluations (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    evaluator_profile_id INTEGER NOT NULL REFERENCES profiles(id),
    evaluation_period VARCHAR(50), -- monthly, seasonal, etc.
    strong_points TEXT NOT NULL,
    improvement_points TEXT NOT NULL,
    coach_notes TEXT,
    development_plan TEXT,
    next_review_date DATE,
    overall_rating INTEGER, -- 1-10 scale
    technical_rating INTEGER,
    tactical_rating INTEGER,
    physical_rating INTEGER,
    mental_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evaluations_player ON player_evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator ON player_evaluations(evaluator_profile_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_period ON player_evaluations(evaluation_period);

-- =============================================
-- PHASE 5: PERFORMANCE TRACKING
-- =============================================

-- Player Goals (Enhanced)
CREATE TABLE IF NOT EXISTS player_goals (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- technical, tactical, physical, mental
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_date DATE,
    completion_percentage INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused, cancelled
    priority VARCHAR(10) DEFAULT 'medium', -- high, medium, low
    measurable_criteria JSONB, -- JSON: specific criteria
    progress_notes TEXT,
    created_by_profile_id INTEGER REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_goals_player ON player_goals(player_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON player_goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_type ON player_goals(goal_type);

-- Player Feedback (Enhanced with video support)
CREATE TABLE IF NOT EXISTS player_feedback (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    created_by_coach_id INTEGER NOT NULL REFERENCES profiles(id),
    feedback_type VARCHAR(50) NOT NULL, -- game_analysis, training_feedback, etc.
    game_principle VARCHAR(100),
    category_skill VARCHAR(100),
    feedback_text TEXT NOT NULL,
    video1_url VARCHAR(500),
    video1_description TEXT,
    video2_url VARCHAR(500),
    video2_description TEXT,
    is_positive BOOLEAN,
    priority VARCHAR(10) DEFAULT 'medium',
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_player ON player_feedback(player_id);
CREATE INDEX IF NOT EXISTS idx_feedback_coach ON player_feedback(created_by_coach_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON player_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_follow_up ON player_feedback(follow_up_required, follow_up_date);

-- =============================================
-- PHASE 6: AUDIT & LOGGING
-- =============================================

-- Access Audit Log (Security monitoring)
CREATE TABLE IF NOT EXISTS profile_access_logs (
    id SERIAL PRIMARY KEY,
    viewer_id INTEGER NOT NULL REFERENCES profiles(id),
    target_profile_id INTEGER NOT NULL REFERENCES profiles(id),
    access_type VARCHAR(50) NOT NULL, -- view, edit, delete, etc.
    resource_type VARCHAR(50), -- player, evaluation, goal, etc.
    resource_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    context JSONB, -- JSON: additional context
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_access_logs_viewer ON profile_access_logs(viewer_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_target ON profile_access_logs(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON profile_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_type ON profile_access_logs(access_type);

-- Application Settings
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by INTEGER REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(setting_key);

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
WHERE p.is_active = true
GROUP BY p.id, p.profile_id, p.team_id, p.jersey_number, p.position, 
         pr.name, pr.email, pr.phone, t.name, t.category, p.is_active, p.created_at;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Insert success confirmation
INSERT INTO app_settings (setting_key, setting_value, description) 
VALUES ('schema_version', '1.0.0', 'SportTeams schema version') 
ON CONFLICT (setting_key) DO UPDATE SET setting_value = '1.0.0', updated_at = CURRENT_TIMESTAMP;

SELECT 'SportTeams PostgreSQL schema created successfully!' as message;