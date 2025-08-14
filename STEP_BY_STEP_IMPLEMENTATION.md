# SportTeams Migration: Step-by-Step Implementation Guide

## Overview

This guide walks you through implementing the new SportTeams architecture component by component, ensuring each piece is fully functional before moving to the next.

---

## PHASE 1: Foundation Setup (Day 1-2)

### Step 1.1: Project Structure Creation
```bash
# Run the setup script
chmod +x structure_setup.sh
./structure_setup.sh

# Navigate to new project directory
cd sportteams-new
```

### Step 1.2: Progress DB Setup
```bash
# 1. Connect to your Progress DB instance
# 2. Execute the schema creation script
progress-db-cli -f database_schema_progress.sql

# 3. Execute the stored procedures
progress-db-cli -f progress_db_procedures.sql

# 4. Verify connection and tables
progress-db-cli -c "SELECT COUNT(*) FROM users;"
```

### Step 1.3: Laravel Backend Setup
```bash
cd backend

# Create Laravel project
composer create-project laravel/laravel . --prefer-dist

# Install dependencies
composer require firebase/php-jwt predis/predis

# Copy configuration files from backend_laravel_structure.md
# - Create .env file with Progress DB connection
# - Setup Progress DB Service Provider
# - Create directory structure
```

### Step 1.4: React Frontend Setup
```bash
cd ../frontend

# Create React TypeScript app
npx create-react-app . --template typescript

# Install dependencies
npm install @reduxjs/toolkit react-redux react-router-dom axios @heroicons/react @headlessui/react react-hook-form @hookform/resolvers yup

# Copy configuration from frontend_react_structure.md
# - Create .env file
# - Setup directory structure
```

**✅ Checkpoint 1**: Verify both backend and frontend applications start without errors.

---

## PHASE 2: Security & Authentication (Day 3-4)

### Step 2.1: Backend Authentication System

#### 2.1.1: Create Security Services
```bash
cd backend

# Create the security service files
mkdir -p app/Services/Security
# Copy SecurityContextService.php from the structure guide
# Copy TokenService.php from the structure guide
```

#### 2.1.2: Create Authentication Controller
```php
// app/Http/Controllers/Api/AuthController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Security\TokenService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    private $tokenService;
    private $db;
    
    public function __construct(TokenService $tokenService)
    {
        $this->tokenService = $tokenService;
        $this->db = app('progress.db');
    }
    
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);
        
        // Verify user credentials against Progress DB
        $stmt = $this->db->prepare("
            SELECT u.id, u.email, p.id as profile_id, p.name, p.role
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE u.email = ? AND u.password_hash = ?
        ");
        
        $passwordHash = hash('sha256', $credentials['password']);
        $stmt->execute([$credentials['email'], $passwordHash]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$user) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        
        // Create security context
        $stmt = $this->db->prepare("CALL usp_update_security_context(?, ?, ?, ?, ?)");
        $teamScopes = json_encode([]); // Load from team_memberships
        $permissions = json_encode(['can_view_players' => true]);
        
        $stmt->execute([
            $user['id'],
            $user['profile_id'],
            $user['role'],
            $teamScopes,
            $permissions
        ]);
        
        // Generate tokens
        $token = $this->tokenService->createToken([
            'user_id' => $user['id'],
            'profile_id' => $user['profile_id'],
            'role' => $user['role']
        ]);
        
        return response()->json([
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'profileId' => $user['profile_id']
            ],
            'token' => $token
        ]);
    }
}
```

#### 2.1.3: Create Security Middleware
```bash
# Copy SecurityMiddleware from backend_laravel_structure.md
# Register middleware in app/Http/Kernel.php
```

#### 2.1.4: Setup API Routes
```php
// routes/api.php
<?php

use App\Http\Controllers\Api\AuthController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Protected routes
    Route::middleware(['security'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });
});
```

### Step 2.2: Frontend Authentication System

#### 2.2.1: Setup Redux Store
```bash
cd ../frontend

# Copy store configuration from frontend_react_structure.md
# Create src/store/index.ts
# Create src/store/slices/authSlice.ts
```

#### 2.2.2: Create Authentication Components
```typescript
// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(credentials)).unwrap();
      // Redirect to dashboard
      window.location.href = '/';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            SportTeams Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              placeholder="Email"
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Password"
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
```

**✅ Checkpoint 2**: Verify login functionality works end-to-end.

---

## PHASE 3: Player Management System (Day 5-7)

### Step 3.1: Backend Player API

#### 3.1.1: Create Player Controller
```bash
cd backend

# Copy PlayerController from backend_laravel_structure.md
# Add to routes/api.php
```

#### 3.1.2: Add Player Routes
```php
// routes/api.php - Add to protected routes group
Route::middleware(['security'])->group(function () {
    Route::get('/players', [PlayerController::class, 'index']);
    Route::get('/players/{id}', [PlayerController::class, 'show']);
    Route::post('/players', [PlayerController::class, 'store']);
    Route::put('/players/{id}', [PlayerController::class, 'update']);
    Route::delete('/players/{id}', [PlayerController::class, 'destroy']);
});
```

### Step 3.2: Frontend Player Components

#### 3.2.1: Create Players Service
```bash
cd ../frontend

# Copy playersService from frontend_react_structure.md
# Create src/services/players.ts
```

#### 3.2.2: Create Players Redux Slice
```typescript
// src/store/slices/playersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { playersService, Player } from '../../services/players';

interface PlayersState {
  players: Player[];
  currentPlayer: Player | null;
  loading: boolean;
  error: string | null;
}

export const fetchPlayers = createAsyncThunk(
  'players/fetchPlayers',
  async (teamId?: number) => {
    const response = await playersService.getPlayers(teamId);
    return response.data;
  }
);

const playersSlice = createSlice({
  name: 'players',
  initialState: {
    players: [],
    currentPlayer: null,
    loading: false,
    error: null
  } as PlayersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch players';
      });
  }
});

export default playersSlice.reducer;
```

#### 3.2.3: Create Player Components
```bash
# Copy PlayerList component from frontend_react_structure.md
# Create src/components/Players/PlayerList.tsx
# Create src/components/Players/PlayerCard.tsx
```

**✅ Checkpoint 3**: Verify player listing works with proper security filtering.

---

## PHASE 4: Team Management (Day 8-9)

### Step 4.1: Backend Team API
```bash
cd backend

# Create app/Http/Controllers/Api/TeamController.php
# Similar structure to PlayerController but for teams
# Add team routes to routes/api.php
```

### Step 4.2: Frontend Team Components
```bash
cd ../frontend

# Create team service, Redux slice, and components
# Following same pattern as players
```

**✅ Checkpoint 4**: Verify team management with roster display.

---

## PHASE 5: Evaluation System (Day 10-12)

### Step 5.1: Backend Evaluation API
```bash
cd backend

# Create EvaluationController
# Implement evaluation CRUD with security checks
```

### Step 5.2: Frontend Evaluation Components
```bash
cd ../frontend

# Create evaluation forms and display components
# Implement evaluation creation/editing
```

**✅ Checkpoint 5**: Verify evaluation system works end-to-end.

---

## PHASE 6: Multi-Language Support (Day 13-14)

### Step 6.1: Backend Translation API
```bash
cd backend

# Create TranslationController
# Implement namespace-based translation loading
```

### Step 6.2: Frontend Translation System
```bash
cd ../frontend

# Copy translation hook from frontend_react_structure.md
# Implement language switching
# Add translations for all UI text
```

**✅ Checkpoint 6**: Verify multi-language switching works.

---

## PHASE 7: Performance & Caching (Day 15)

### Step 7.1: Setup Redis Caching
```bash
cd backend

# Configure Redis in .env
# Implement caching in services
# Add cache invalidation logic
```

### Step 7.2: Frontend Performance
```bash
cd ../frontend

# Implement code splitting
# Add React.memo for expensive components
# Setup proper loading states
```

**✅ Checkpoint 7**: Verify performance improvements.

---

## PHASE 8: Testing & Deployment (Day 16-17)

### Step 8.1: Backend Testing
```bash
cd backend

# Create test cases for security
# Test all API endpoints
# Verify access control works properly
```

### Step 8.2: Frontend Testing
```bash
cd ../frontend

# Test critical user flows
# Verify responsive design
# Test cross-browser compatibility
```

### Step 8.3: Integration Testing
- Test complete user workflows
- Verify data consistency
- Test error handling

**✅ Final Checkpoint**: Complete system working with real data.

---

## Implementation Notes

### Daily Verification Steps
1. **Start of each day**: Run existing functionality to ensure nothing broke
2. **End of each day**: Create checkpoint to verify new functionality
3. **Before moving phases**: Complete integration test of current phase

### Key Success Criteria
- ✅ **Security**: Team-scoped access working properly
- ✅ **Performance**: Fast loading with proper caching
- ✅ **Usability**: Intuitive UI with proper error handling
- ✅ **Data Integrity**: No data loss during operations
- ✅ **Multi-language**: All text properly translated

### Troubleshooting
- **Progress DB Issues**: Check connection strings and stored procedures
- **JWT Issues**: Verify encryption keys are properly configured
- **CORS Issues**: Ensure proper headers are set in Laravel
- **State Issues**: Check Redux DevTools for state management problems

Ready to start implementation? Begin with Phase 1, Step 1.1! 🚀