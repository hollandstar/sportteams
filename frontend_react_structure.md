# React Frontend Structure for SportTeams

## Step 1: React Project Setup

```bash
# Create React app with TypeScript
npx create-react-app sportteams-frontend --template typescript
cd sportteams-frontend

# Install required packages
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios
npm install @heroicons/react
npm install @headlessui/react
npm install react-hook-form
npm install @hookform/resolvers yup
```

## Step 2: Environment Configuration

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_DEFAULT_LANGUAGE=nl
REACT_APP_SUPPORTED_LANGUAGES=nl,en,de,fr
REACT_APP_APP_NAME=SportTeams
```

## Step 3: Directory Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthLayout.tsx
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── DashboardCard.tsx
│   │   └── StatisticCard.tsx
│   ├── Players/
│   │   ├── PlayerList.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerDetail.tsx
│   │   └── PlayerForm.tsx
│   ├── Teams/
│   │   ├── TeamList.tsx
│   │   ├── TeamCard.tsx
│   │   ├── TeamRoster.tsx
│   │   └── TeamForm.tsx
│   ├── Evaluations/
│   │   ├── EvaluationList.tsx
│   │   ├── EvaluationForm.tsx
│   │   └── EvaluationDetail.tsx
│   └── Common/
│       ├── Layout/
│       │   ├── AppLayout.tsx
│       │   ├── Sidebar.tsx
│       │   └── Header.tsx
│       ├── UI/
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Modal.tsx
│       │   ├── LoadingSpinner.tsx
│       │   └── ErrorBoundary.tsx
│       └── Navigation/
│           ├── MainNav.tsx
│           └── Breadcrumb.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTranslation.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── players.ts
│   ├── teams.ts
│   ├── evaluations.ts
│   └── translations.ts
├── store/
│   ├── index.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── playersSlice.ts
│   │   ├── teamsSlice.ts
│   │   ├── translationSlice.ts
│   │   └── uiSlice.ts
│   └── middleware/
│       └── authMiddleware.ts
├── types/
│   ├── auth.ts
│   ├── player.ts
│   ├── team.ts
│   ├── evaluation.ts
│   └── api.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validation.ts
│   └── storage.ts
└── styles/
    ├── globals.css
    └── components/
```

## Step 4: Core Implementation Files

### 1. API Service Configuration

```typescript
// src/services/api.ts

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  loadToken(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.token = token;
    }
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
```

### 2. Redux Store Setup

```typescript
// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import playersSlice from './slices/playersSlice';
import teamsSlice from './slices/teamsSlice';
import translationSlice from './slices/translationSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    players: playersSlice,
    teams: teamsSlice,
    translations: translationSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 3. Authentication Slice

```typescript
// src/store/slices/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileId: number;
  teamScopes: number[];
  permissions: Record<string, boolean>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await apiService.post<{
      user: User;
      token: string;
      refreshToken: string;
    }>('/auth/login', credentials);
    
    apiService.setToken(response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    
    return response;
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await apiService.post<{
      token: string;
      refreshToken: string;
    }>('/auth/refresh', { refreshToken });
    
    apiService.setToken(response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await apiService.post('/auth/logout');
    apiService.clearToken();
    localStorage.removeItem('refresh_token');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    loadStoredAuth: (state) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        apiService.setToken(token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, loadStoredAuth } = authSlice.actions;
export default authSlice.reducer;
```

### 4. Players Service

```typescript
// src/services/players.ts

import { apiService } from './api';

export interface Player {
  id: number;
  name: string;
  email?: string;
  position: string;
  jerseyNumber: number;
  teamId: number;
  teamName: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  evaluationsCount: number;
  avgTestScore: number;
  activeGoalsCount: number;
}

export interface PlayerDetail extends Player {
  phone?: string;
  dominantHand?: string;
  recentEvaluations: Array<{
    id: number;
    strongPoints: string;
    improvementPoints: string;
    overallRating: number;
    createdAt: string;
  }>;
  activeGoals: Array<{
    id: number;
    title: string;
    completionPercentage: number;
    targetDate: string;
  }>;
}

class PlayersService {
  async getPlayers(teamId?: number): Promise<{ data: Player[] }> {
    const params = teamId ? { team_id: teamId } : {};
    return apiService.get<{ data: Player[] }>('/players', params);
  }

  async getPlayer(playerId: number): Promise<{ data: PlayerDetail }> {
    return apiService.get<{ data: PlayerDetail }>(`/players/${playerId}`);
  }

  async createPlayer(playerData: Partial<Player>): Promise<{ data: Player }> {
    return apiService.post<{ data: Player }>('/players', playerData);
  }

  async updatePlayer(playerId: number, playerData: Partial<Player>): Promise<{ data: Player }> {
    return apiService.put<{ data: Player }>(`/players/${playerId}`, playerData);
  }

  async deletePlayer(playerId: number): Promise<void> {
    return apiService.delete(`/players/${playerId}`);
  }
}

export const playersService = new PlayersService();
```

### 5. Translation Hook

```typescript
// src/hooks/useTranslation.ts

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadTranslations, setLanguage } from '../store/slices/translationSlice';

export const useTranslation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { translations, currentLanguage, loading } = useSelector(
    (state: RootState) => state.translations
  );

  useEffect(() => {
    if (!translations[currentLanguage]) {
      dispatch(loadTranslations(currentLanguage));
    }
  }, [currentLanguage, translations, dispatch]);

  const t = (key: string, params: Record<string, string> = {}): string => {
    let value = translations[currentLanguage]?.[key] || key;
    
    // Parameter interpolation
    Object.entries(params).forEach(([param, val]) => {
      value = value.replace(new RegExp(`{{${param}}}`, 'g'), val);
    });

    return value;
  };

  const changeLanguage = (language: string) => {
    dispatch(setLanguage(language));
    localStorage.setItem('preferred_language', language);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    loading,
    supportedLanguages: process.env.REACT_APP_SUPPORTED_LANGUAGES?.split(',') || ['nl'],
  };
};
```

### 6. Main App Component

```typescript
// src/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { loadStoredAuth } from './store/slices/authSlice';

// Components
import AppLayout from './components/Common/Layout/AppLayout';
import LoginForm from './components/Auth/LoginForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import PlayerList from './components/Players/PlayerList';
import PlayerDetail from './components/Players/PlayerDetail';
import TeamList from './components/Teams/TeamList';
import EvaluationList from './components/Evaluations/EvaluationList';
import ErrorBoundary from './components/Common/UI/ErrorBoundary';

// Styles
import './styles/globals.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load stored authentication state
    dispatch(loadStoredAuth());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/players" element={
            <ProtectedRoute>
              <AppLayout>
                <PlayerList />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/players/:id" element={
            <ProtectedRoute>
              <AppLayout>
                <PlayerDetail />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/teams" element={
            <ProtectedRoute>
              <AppLayout>
                <TeamList />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/evaluations" element={
            <ProtectedRoute>
              <AppLayout>
                <EvaluationList />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

### 7. Player List Component Example

```typescript
// src/components/Players/PlayerList.tsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchPlayers } from '../../store/slices/playersSlice';
import { useTranslation } from '../../hooks/useTranslation';
import PlayerCard from './PlayerCard';
import LoadingSpinner from '../Common/UI/LoadingSpinner';

const PlayerList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  
  const { players, loading, error } = useSelector(
    (state: RootState) => state.players
  );
  const { teams } = useSelector((state: RootState) => state.teams);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchPlayers(selectedTeam || undefined));
  }, [dispatch, selectedTeam]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{t('error.loadingPlayers')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('players.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('players.subtitle', { count: players.length.toString() })}
          </p>
        </div>
        
        {user?.role !== 'player' && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => {/* Handle add player */}}
          >
            {t('players.addNew')}
          </button>
        )}
      </div>

      {/* Team Filter */}
      {user?.teamScopes && user.teamScopes.length > 1 && (
        <div className="flex space-x-4">
          <select
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value ? parseInt(e.target.value) : null)}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('common.allTeams')}</option>
            {teams
              .filter(team => user.teamScopes.includes(team.id))
              .map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            showActions={user?.role !== 'player'}
          />
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {t('players.noPlayersFound')}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
```

## Step 5: Package.json Scripts

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

## Next Steps

1. **Complete Component Implementation**: Finish all components
2. **Add Form Validation**: Implement proper form handling
3. **Error Handling**: Comprehensive error boundaries
4. **Testing**: Unit and integration tests
5. **Responsive Design**: Mobile-first approach
6. **Performance Optimization**: Code splitting and lazy loading

This structure provides a scalable, type-safe React frontend with proper state management, security, and multi-language support that connects seamlessly with the Laravel backend.