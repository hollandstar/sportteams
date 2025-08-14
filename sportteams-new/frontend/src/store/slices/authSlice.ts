import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_id: number;
  team_scopes: number[];
  permissions: Record<string, boolean>;
  preferred_language?: string;
  photo?: string;
  last_login_at?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await apiService.login(credentials);
    
    if (response.status === 'success') {
      // Set the token in API service
      apiService.setToken(response.tokens.access_token);
      
      // Store refresh token
      localStorage.setItem('refresh_token', response.tokens.refresh_token);
      
      return {
        user: response.user,
        tokens: response.tokens
      };
    } else {
      throw new Error(response.message || 'Login failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { getState }) => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await apiService.refreshToken(refreshToken);
    
    if (response.status === 'success') {
      apiService.setToken(response.tokens.access_token);
      localStorage.setItem('refresh_token', response.tokens.refresh_token);
      
      return {
        tokens: response.tokens
      };
    } else {
      throw new Error(response.message || 'Token refresh failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/me',
  async () => {
    const response = await apiService.getCurrentUser();
    
    if (response.status === 'success') {
      return response.user;
    } else {
      throw new Error(response.message || 'Failed to get user info');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }
    
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
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (token && refreshToken) {
        apiService.setToken(token);
        state.isAuthenticated = true;
        // Note: We'll need to fetch user data separately
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    }
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
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (state.tokens) {
          state.tokens = action.payload.tokens;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token refresh failed, user needs to login again
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get user info';
        // Don't clear auth state here, token might still be valid
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, loadStoredAuth, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;