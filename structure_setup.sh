#!/bin/bash

# SportTeams Migration - Project Structure Setup Script

echo "Setting up SportTeams new architecture structure..."

# Create main project directory
mkdir -p sportteams-new
cd sportteams-new

# Backend structure (Laravel)
echo "Creating backend structure..."
mkdir -p backend/{app/{Http/{Controllers,Middleware},Models,Services/{Security,Translation,Cache}},database/{migrations,seeders},config,storage,bootstrap}

# Frontend structure (React)
echo "Creating frontend structure..."
mkdir -p frontend/{public,src/{components/{Auth,Dashboard,Players,Teams,Evaluations,Common},hooks,services,store,utils,styles}}

# Database structure (Progress DB)
echo "Creating database structure..."
mkdir -p database/{schema,migrations,seed-data,procedures}

# Documentation structure
echo "Creating documentation structure..."
mkdir -p docs/{api,deployment,security,architecture}

# Configuration files
echo "Creating configuration templates..."

# Backend .env template
cat > backend/.env.example << 'EOF'
APP_NAME=SportTeams
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost

# Progress DB Configuration
PROGRESS_HOST=your-progress-host
PROGRESS_PORT=your-progress-port
PROGRESS_DATABASE=your-database
PROGRESS_USERNAME=your-username
PROGRESS_PASSWORD=your-password

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# JWT Configuration
JWT_SIGNING_KEY=
JWT_ENCRYPTION_KEY=

# Multi-language
DEFAULT_LOCALE=nl
SUPPORTED_LOCALES=nl,en,de,fr
EOF

# Frontend .env template  
cat > frontend/.env.example << 'EOF'
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_DEFAULT_LANGUAGE=nl
REACT_APP_SUPPORTED_LANGUAGES=nl,en,de,fr
EOF

# Create README for each major component
cat > backend/README.md << 'EOF'
# SportTeams Backend (Laravel + Progress DB)

## Setup Instructions
1. Copy `.env.example` to `.env`
2. Configure Progress DB connection
3. Install dependencies: `composer install`
4. Run migrations: `php artisan migrate`
5. Start server: `php artisan serve`

## API Documentation
See `/docs/api/` for endpoint documentation.
EOF

cat > frontend/README.md << 'EOF'
# SportTeams Frontend (React)

## Setup Instructions
1. Copy `.env.example` to `.env`
2. Configure API endpoint
3. Install dependencies: `npm install`
4. Start development server: `npm start`

## Component Structure
- `Auth/` - Authentication components
- `Dashboard/` - Main dashboard
- `Players/` - Player management
- `Teams/` - Team management
- `Evaluations/` - Player evaluations
- `Common/` - Shared components
EOF

echo "Project structure created successfully!"
echo "Next steps:"
echo "1. Review the structure in sportteams-new/"
echo "2. Configure .env files"
echo "3. Begin Phase 2: Database setup"