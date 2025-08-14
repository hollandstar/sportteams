import React from 'react'
import StatsCard from '../../components/Dashboard/StatsCard'
import { useTranslation } from '../../hooks/useTranslation'
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()

  const stats = [
    {
      title: 'Totaal Gebruikers',
      value: '127',
      change: '+12%',
      changeType: 'increase' as const,
      icon: UsersIcon
    },
    {
      title: 'Actieve Teams',
      value: '8',
      change: '+2',
      changeType: 'increase' as const,
      icon: UserGroupIcon
    },
    {
      title: 'Evaluaties Deze Maand',
      value: '342',
      change: '+23%',
      changeType: 'increase' as const,
      icon: ClipboardDocumentListIcon
    },
    {
      title: 'Systeem Activiteit',
      value: '98%',
      change: '+2%',
      changeType: 'increase' as const,
      icon: ChartBarIcon
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overzicht van het volledige SportTeams systeem
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} stats={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recente Activiteit</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Nieuwe team admin toegevoegd</p>
                <p className="text-xs text-gray-500">2 minuten geleden</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">5 nieuwe spelers geregistreerd</p>
                <p className="text-xs text-gray-500">1 uur geleden</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Team evaluatie voltooid</p>
                <p className="text-xs text-gray-500">3 uur geleden</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Snelle Acties</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <UsersIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Nieuwe Gebruiker</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <UserGroupIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Nieuw Team</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <ChartBarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Rapport Genereren</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Systeem Status</p>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Systeem Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-gray-900">Database</p>
            <p className="text-xs text-gray-500">Operationeel</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-gray-900">API Services</p>
            <p className="text-xs text-gray-500">Operationeel</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-gray-900">Frontend</p>
            <p className="text-xs text-gray-500">Operationeel</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard