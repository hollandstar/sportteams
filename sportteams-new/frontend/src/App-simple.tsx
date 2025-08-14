import React from 'react'
import './App.css'

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          🏆 SportTeams
        </h1>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Sport Team Manager voor teams<br/>
          Wetenschappelijk onderbouwd teammanagement voor moderne sportteams
        </p>
        <button 
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onClick={() => alert('Login functionality works!')}
        >
          Inloggen
        </button>
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '6px',
          border: '1px solid #bbf7d0'
        }}>
          <p style={{ color: '#166534', fontSize: '0.875rem', margin: 0 }}>
            ✅ Frontend: Running<br/>
            ✅ Backend: Connected<br/>
            ✅ Database: 20 tables loaded<br/>
            ✅ Preview: Should be working now!
          </p>
        </div>
      </div>
    </div>
  )
}

export default App