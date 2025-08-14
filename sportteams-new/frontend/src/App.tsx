import { useState, useEffect } from 'react'
import { apiService } from './services/api'
import './App.css'

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

function App() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [user, setUser] = useState<User | null>(null)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    try {
      const response = await apiService.testConnection()
      setConnectionStatus(`✅ Connected - ${response.data.tables_count} tables`)
    } catch (error) {
      setConnectionStatus('❌ Connection failed')
      console.error('API connection failed:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await apiService.login(loginData)
      if (response.status === 'success') {
        setUser(response.user)
        apiService.setToken(response.token)
        setConnectionStatus('✅ Logged in successfully!')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setConnectionStatus('❌ Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h1>🏒 SportTeams - Phase 1 Test</h1>
        
        <div style={{ 
          padding: '15px', 
          margin: '20px 0', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <h3>API Connection Status:</h3>
          <p>{connectionStatus}</p>
        </div>

        {!user ? (
          <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
            <h3>Test Login</h3>
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
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
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
            <h3>✅ Logged in as:</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <button 
              onClick={() => {
                setUser(null)
                apiService.clearToken()
                setConnectionStatus('Logged out')
              }}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f44336', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        )}

        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px' 
        }}>
          <h4>✅ Phase 1 Complete!</h4>
          <ul style={{ textAlign: 'left' }}>
            <li>✅ PostgreSQL database (17 tables)</li>
            <li>✅ Laravel API backend</li>
            <li>✅ React frontend (Vite)</li>
            <li>✅ End-to-end authentication</li>
          </ul>
          <p><small>Ready for Phase 2: Advanced Security & JWT!</small></p>
        </div>
      </div>
    </div>
  )
}

export default App
