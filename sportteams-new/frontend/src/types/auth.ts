export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'team_admin' | 'coach' | 'player'
  preferred_language: string
  is_active: boolean
  profile_id?: number
  teams?: Team[]
  permissions?: string[]
}

export interface Team {
  id: number
  name: string
  sport: string
  season: string
  description?: string
  player_count?: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  token: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  allowedRoles: string[]
  badge?: string | number
}

export interface DashboardStats {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<any>
}