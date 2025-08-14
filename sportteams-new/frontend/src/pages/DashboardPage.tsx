import React from 'react'
import AppLayout from '../components/Layout/AppLayout'
import Dashboard from '../components/Dashboard/Dashboard'

const DashboardPage: React.FC = () => {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  )
}

export default DashboardPage