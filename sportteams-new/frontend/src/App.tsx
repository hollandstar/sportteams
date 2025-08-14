import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { loadStoredAuth, getCurrentUser } from './store/slices/authSlice'

// Route Components
import ProtectedRoute from './components/Router/ProtectedRoute'
import PublicRoute from './components/Router/PublicRoute'

// Layout Components
import DashboardLayout from './components/Dashboard/DashboardLayout'

// Pages
import HomePage from './pages/HomePage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage from './pages/NotFoundPage'

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard'
import TeamAdminDashboard from './pages/dashboard/TeamAdminDashboard'
import CoachDashboard from './pages/dashboard/CoachDashboard'
import PlayerDashboard from './pages/dashboard/PlayerDashboard'

// CSS
import './App.css'

// Role-based dashboard component selector
const getDashboardComponent = (role: string) => {
  switch (role) {
    case 'admin':
      return AdminDashboard
    case 'team_admin':
      return TeamAdminDashboard
    case 'coach':
      return CoachDashboard
    case 'player':
      return PlayerDashboard
    default:
      return PlayerDashboard
  }
}

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Load stored authentication on app start
    dispatch(loadStoredAuth())
    
    // If we have stored auth, try to get current user details
    const token = localStorage.getItem('auth_token')
    if (token) {
      dispatch(getCurrentUser())
    }
  }, [dispatch])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">SportTeams wordt geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            } 
          />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Main Dashboard - Role-based */}
            <Route 
              index 
              element={
                user ? React.createElement(getDashboardComponent(user.role)) : <Navigate to="/" replace />
              } 
            />

            {/* Admin-only Routes */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Gebruikersbeheer</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - User Management</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Systeeminstellingen</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - System Settings</p>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Team Admin + Admin Routes */}
            <Route 
              path="audit" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Audit Trail</p>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Coach + Admin + Team Admin Routes */}
            <Route 
              path="players" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Spelerbeheer</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Player Management</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teams" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Teambeheer</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Team Management</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="reports" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Rapporten</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Reports & Analytics</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="tests" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Testen & Metingen</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Tests & Measurements</p>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* All Roles Routes */}
            <Route 
              path="evaluations" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach', 'player']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Evaluaties</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Player Evaluations</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="goals" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach', 'player']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Doelen & Ontwikkeling</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Goals & Development</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="feedback" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach', 'player']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Feedback & Communicatie</h1>
                    <p className="text-gray-500 mt-2">Coming Soon - Feedback System</p>
                  </div>
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          
          {/* Redirect authenticated users from unknown routes */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <NotFoundPage />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App