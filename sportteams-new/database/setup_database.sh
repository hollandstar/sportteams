#!/bin/bash

# SportTeams Database Setup Script
# PostgreSQL Database Setup

set -e  # Exit on any error

echo "🏒 SportTeams Database Setup Starting..."

# Database connection details
DB_HOST="hollandstars.com"
DB_PORT="5432"
DB_NAME="dbyhzn818emewb" 
DB_USER="ugqbhtfgniuhi"
DB_PASS="cp4dhplsajrh"

# Connection string
PGPASSWORD="$DB_PASS"
export PGPASSWORD

echo "📡 Testing database connection..."

# Test connection
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    echo "Please check your connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"  
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    exit 1
fi

echo "🗃️  Creating database schema..."

# Execute schema creation
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f schema/postgresql_schema.sql; then
    echo "✅ Schema created successfully!"
else
    echo "❌ Schema creation failed!"
    exit 1
fi

echo "⚙️  Creating database functions..."

# Execute functions creation
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f schema/postgresql_functions.sql; then
    echo "✅ Functions created successfully!"
else
    echo "❌ Functions creation failed!"
    exit 1
fi

echo "🌱 Inserting initial data..."

# Create initial data script
cat > schema/initial_data.sql << 'EOF'
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
EOF

# Execute initial data
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f schema/initial_data.sql; then
    echo "✅ Initial data inserted successfully!"
else
    echo "❌ Initial data insertion failed!"
    exit 1
fi

echo "🔍 Verifying database setup..."

# Verify tables were created
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")

echo "📊 Created $TABLE_COUNT tables"

if [ "$TABLE_COUNT" -gt 15 ]; then
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "🎯 Test credentials:"
    echo "   Email: admin@sportteams.nl"
    echo "   Password: admin123"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Setup Laravel backend (Step 1.3)"
    echo "   2. Test API connection"
    echo "   3. Setup React frontend (Step 1.4)"
else
    echo "⚠️  Warning: Expected more tables. Please check for errors above."
fi

# Clean up
unset PGPASSWORD