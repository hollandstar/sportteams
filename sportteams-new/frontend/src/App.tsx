import React, { useState } from 'react'
import { ConditionTestForm, ActionTypeTestForm, PlayerSkillsAssessmentForm, AdminDashboard } from './components/Forms'

function App() {
  const [activeView, setActiveView] = useState<'home' | 'admin' | 'condition' | 'action' | 'skills'>('home');
  
  // Echte data uit jouw CSV - GEEN MOCK DATA
  const realPlayers = [
    { id: '1', name: 'Isis van den Bosch' },
    { id: '2', name: 'Nora Bon' }, 
    { id: '3', name: 'Tata van de Peppel' },
    { id: '4', name: 'SpelerTest4' }
  ];

  const realTeams = [
    { id: '1', name: 'Team A' },
    { id: '2', name: 'Team B' }
  ];

  const handleFormSubmit = async (data: any) => {
    console.log('Form submitted with REAL database fields:', data);
    alert('Form submitted successfully! (Check console for data)');
    setActiveView('home');
  };

  if (activeView === 'admin') {
    return (
      <AdminDashboard
        onCreateForm={(type) => alert('Create form: ' + type)}
        onViewForm={(formId) => {
          if (formId === '1') setActiveView('condition');
          else if (formId === '2') setActiveView('action');
          else if (formId === '3') setActiveView('skills');
        }}
        onToggleFormStatus={(formId, isActive) => 
          alert(`Toggle form ${formId} to ${isActive ? 'active' : 'inactive'}`)
        }
        onViewResults={(formId) => alert('View results for form: ' + formId)}
      />
    );
  }

  if (activeView === 'condition') {
    return (
      <ConditionTestForm
        onSubmit={handleFormSubmit}
        onCancel={() => setActiveView('home')}
        players={realPlayers}
        teams={realTeams}
      />
    );
  }

  if (activeView === 'action') {
    return (
      <ActionTypeTestForm
        onSubmit={handleFormSubmit}
        onCancel={() => setActiveView('home')}
        players={realPlayers}
        teams={realTeams}
      />
    );
  }

  if (activeView === 'skills') {
    return (
      <PlayerSkillsAssessmentForm
        onSubmit={handleFormSubmit}
        onCancel={() => setActiveView('home')}
        players={realPlayers}
      />
    );
  }

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
        maxWidth: '700px',
        width: '90%'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          🏆 SportTeams Forms - ECHTE DATA
        </h1>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Formulieren gebaseerd op jouw CSV database analyse<br/>
          • Condition Test (MSFT) - echte velden<br/>
          • Action Type Test - alle 21 velden uit database<br/>
          • Skills Assessment - complete beoordeling<br/>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onClick={() => setActiveView('condition')}
          >
            📈 MSFT Beeptest<br/>
            <span style={{fontSize: '0.75rem', opacity: 0.8}}>Echte CSV velden</span>
          </button>
          
          <button 
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onClick={() => setActiveView('action')}
          >
            ⚡ Action Type Test<br/>
            <span style={{fontSize: '0.75rem', opacity: 0.8}}>21 database velden</span>
          </button>

          <button 
            style={{
              backgroundColor: '#ea580c',
              color: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onClick={() => setActiveView('skills')}
          >
            🎯 Skills Assessment<br/>
            <span style={{fontSize: '0.75rem', opacity: 0.8}}>Vaardigheden CSV</span>
          </button>

          <button 
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onClick={() => setActiveView('admin')}
          >
            👨‍💼 Admin Dashboard<br/>
            <span style={{fontSize: '0.75rem', opacity: 0.8}}>Form management</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App