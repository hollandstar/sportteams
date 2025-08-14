import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from './store'
import { loginUser, getCurrentUser, logout, loadStoredAuth } from './store/slices/authSlice'
import { apiService } from './services/api'
import './App.css'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth)
  
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  useEffect(() => {
    // Load stored authentication and test API connection
    dispatch(loadStoredAuth())
    testApiConnection()
    
    // If we have stored auth, try to get current user
    const token = localStorage.getItem('auth_token')
    if (token && !user) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, user])

  const testApiConnection = async () => {
    try {
      const response = await apiService.testConnection()
      if (response.data?.security_enhanced) {
        setConnectionStatus(`✅ Connected (Enhanced Security) - ${response.data.tables_count} tables`)
      } else {
        setConnectionStatus(`✅ Connected - ${response.data.tables_count} tables`)
      }
    } catch (error) {
      setConnectionStatus('❌ Connection failed')
      console.error('API connection failed:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await dispatch(loginUser(loginData)).unwrap()
      setConnectionStatus('✅ Logged in successfully!')
    } catch (error) {
      console.error('Login failed:', error)
      setConnectionStatus('❌ Login failed: ' + error)
    }
  }

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      setConnectionStatus('✅ Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="App">
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>🏒 SportTeams - Phase 2: Enhanced Security</h1>
        
        <div style={{ 
          padding: '15px', 
          margin: '20px 0', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <h3>API Connection Status:</h3>
          <p>{connectionStatus}</p>
        </div>

        {error && (
          <div style={{ 
            padding: '15px', 
            margin: '20px 0', 
            backgroundColor: '#ffebee', 
            borderRadius: '8px',
            color: '#c62828'
          }}>
            <h3>❌ Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
            <h3>Enhanced JWT Login</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="email"
                placeholder="Email (try: admin@sportteams.nl)"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                required
              />
              <input
                type="password"
                placeholder="Password (try: admin123)"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: loading ? '#ccc' : '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Logging in...' : 'Login with Enhanced Security'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ 
            padding: '15px', 
            margin: '20px 0', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px' 
          }}>
            <h3>✅ Authenticated User:</h3>
            <div style={{ textAlign: 'left' }}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Profile ID:</strong> {user?.profile_id}</p>
              <p><strong>Team Scopes:</strong> {user?.team_scopes?.length ? user.team_scopes.join(', ') : 'Admin (All Teams)'}</p>
              <p><strong>Language:</strong> {user?.preferred_language || 'nl'}</p>
              {user?.last_login_at && <p><strong>Last Login:</strong> {new Date(user.last_login_at).toLocaleString()}</p>}
              
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔐 Permissions</summary>
                <div style={{ marginTop: '5px', fontSize: '12px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
                  {user?.permissions && Object.entries(user.permissions).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '2px' }}>
                      <span style={{ color: value ? 'green' : 'red' }}>
                        {value ? '✅' : '❌'}
                      </span> {key.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </details>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{ 
                marginTop: '15px',
                padding: '8px 16px', 
                backgroundColor: '#f44336', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Secure Logout
            </button>
          </div>
        )}

        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px' 
        }}>
          <h4>✅ Phase 2: Enhanced Security Complete!</h4>
          <ul style={{ textAlign: 'left' }}>
            <li>✅ <strong>Encrypted JWT</strong> with JWE (JSON Web Encryption)</li>
            <li>✅ <strong>Token Rotation</strong> with secure refresh tokens</li>
            <li>✅ <strong>Team-scoped Access</strong> replacing insecure RLS</li>
            <li>✅ <strong>Rate Limiting</strong> and security monitoring</li>
            <li>✅ <strong>Redux State Management</strong> for frontend</li>
            <li>✅ <strong>Enhanced Permissions</strong> with role-based access</li>
            <li>✅ <strong>Security Logging</strong> and audit trails</li>
          </ul>
          <p><small>🚀 Ready for Phase 3: Player Management System!</small></p>
        </div>
      </div>
    </div>
  )
}

export default App
