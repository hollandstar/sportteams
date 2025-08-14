import React from 'react'
import StatsCard from '../../components/Dashboard/StatsCard'
import { useTranslation } from '../../hooks/useTranslation'
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const CoachDashboard: React.FC = () => {
  const { t } = useTranslation()

  const stats = [
    {
      title: 'Mijn Spelers',
      value: '23',
      icon: UsersIcon
    },
    {
      title: 'Openstaande Evaluaties',
      value: '7',
      change: '+3',
      changeType: 'increase' as const,
      icon: ClipboardDocumentListIcon
    },
    {
      title: 'Voltooide Testen',
      value: '45',
      change: '+12',
      changeType: 'increase' as const,
      icon: AcademicCapIcon
    },
    {
      title: 'Feedback Gegeven',
      value: '18',
      change: '+6',
      changeType: 'increase' as const,
      icon: ChatBubbleLeftRightIcon
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overzicht van uw coaching activiteiten
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} stats={stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aankomende Trainingen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">JO16 Training</h4>
                <p className="text-sm text-gray-500">Morgen 18:00 - 19:30</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Bevestigd
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Wedstrijd Voorbereiding</h4>
                <p className="text-sm text-gray-500">Vrijdag 19:00 - 20:00</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                In afwachting
              </span>
            </div>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recente Evaluaties</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">JV</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Jan de Vries</p>
                <p className="text-xs text-gray-500">Techniek evaluatie - 8.5/10</p>
              </div>
              <span className="text-xs text-gray-500">2u geleden</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">SJ</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Fysieke conditie - 7.8/10</p>
              </div>
              <span className="text-xs text-gray-500">1d geleden</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Snelle Acties</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <ClipboardDocumentListIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Nieuwe Evaluatie</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <AcademicCapIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Test Plannen</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Feedback Geven</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <UsersIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Team Bekijken</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CoachDashboard