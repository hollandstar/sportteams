import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { loadStoredAuth, getCurrentUser } from './store/slices/authSlice'

// Route Components
import ProtectedRoute from './components/Router/ProtectedRoute'
import PublicRoute from './components/Router/PublicRoute'

// Pages
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage from './pages/NotFoundPage'

// CSS
import './App.css'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth)

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin-only Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <div>Admin Panel - Coming Soon</div>
              </ProtectedRoute>
            } 
          />

          {/* Team Admin Routes */}
          <Route 
            path="/team-admin/*" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'team_admin']}>
                <div>Team Admin Panel - Coming Soon</div>
              </ProtectedRoute>
            } 
          />

          {/* Coach Routes */}
          <Route 
            path="/coach/*" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach']}>
                <div>Coach Panel - Coming Soon</div>
              </ProtectedRoute>
            } 
          />

          {/* Player Routes */}
          <Route 
            path="/player/*" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'team_admin', 'coach', 'player']}>
                <div>Player Panel - Coming Soon</div>
              </ProtectedRoute>
            } 
          />

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