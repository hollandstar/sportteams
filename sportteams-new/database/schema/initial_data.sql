-- Initial data for SportTeams

-- Default languages
INSERT INTO languages (code, name, is_active, is_default) VALUES 
('nl', 'Nederlands', true, true),
('en', 'English', true, false),
('de', 'Deutsch', true, false),
('fr', 'Français', true, false)
ON CONFLICT (code) DO NOTHING;

-- Basic translations for testing
INSERT INTO translations (translation_key, language_code, value, namespace) VALUES 
('common.login', 'nl', 'Inloggen', 'auth'),
('common.login', 'en', 'Login', 'auth'),
('common.logout', 'nl', 'Uitloggen', 'auth'),
('common.logout', 'en', 'Logout', 'auth'),
('players.title', 'nl', 'Spelers', 'players'),
('players.title', 'en', 'Players', 'players'),
('teams.title', 'nl', 'Teams', 'teams'),
('teams.title', 'en', 'Teams', 'teams')
ON CONFLICT (translation_key, language_code) DO NOTHING;

-- Test admin user (password: 'admin123' hashed with SHA256)
INSERT INTO users (email, password_hash, email_verified_at) VALUES 
('admin@sportteams.nl', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Admin profile
INSERT INTO profiles (user_id, name, role, is_active) VALUES 
((SELECT id FROM users WHERE email = 'admin@sportteams.nl'), 'System Admin', 'admin', true)
ON CONFLICT DO NOTHING;

-- Test team
INSERT INTO teams (name, category, season, is_active) VALUES 
('Test Team', 'Senior', '2024-2025', true)
ON CONFLICT DO NOTHING;

SELECT 'Initial data inserted successfully!' as message;
