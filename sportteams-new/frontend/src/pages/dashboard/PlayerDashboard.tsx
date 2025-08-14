import React from 'react'
import StatsCard from '../../components/Dashboard/StatsCard'
import { useTranslation } from '../../hooks/useTranslation'
import {
  TrophyIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

const PlayerDashboard: React.FC = () => {
  const { t } = useTranslation()

  const stats = [
    {
      title: 'Mijn Score',
      value: '8.2',
      change: '+0.3',
      changeType: 'increase' as const,
      icon: ChartBarIcon
    },
    {
      title: 'Behaalde Doelen',
      value: '12',
      change: '+3',
      changeType: 'increase' as const,
      icon: TrophyIcon
    },
    {
      title: 'Evaluaties Ontvangen',
      value: '8',
      change: '+2',
      changeType: 'increase' as const,
      icon: ClipboardDocumentListIcon
    },
    {
      title: 'Trainingen Bijgewoond',
      value: '28',
      change: '+4',
      changeType: 'increase' as const,
      icon: CalendarDaysIcon
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mijn Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overzicht van uw persoonlijke prestaties en ontwikkeling
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
        {/* Progress Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mijn Voortgang</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Voortgang grafiek wordt hier getoond</p>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recente Feedback</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">+</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Uitstekende techniek</p>
                  <p className="text-sm text-green-700">Je balbeheersing is echt verbeterd deze maand!</p>
                  <p className="text-xs text-green-600 mt-1">Coach van der Berg - 2 dagen geleden</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">i</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Aandachtspunt</p>
                  <p className="text-sm text-blue-700">Focus op passing nauwkeurigheid tijdens training.</p>
                  <p className="text-xs text-blue-600 mt-1">Coach van der Berg - 1 week geleden</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals and Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Goals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mijn Doelen</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Passing nauwkeurigheid</p>
                  <span className="text-sm text-gray-500">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Fysieke conditie</p>
                  <span className="text-sm text-gray-500">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Teamwork</p>
                  <span className="text-sm text-gray-500">90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aankomend Schema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Training</p>
                <p className="text-xs text-gray-500">Morgen 18:00 - 19:30</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Training
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Wedstrijd vs Ajax</p>
                <p className="text-xs text-gray-500">Zaterdag 14:00 - 16:00</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Wedstrijd
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Evaluatie Sessie</p>
                <p className="text-xs text-gray-500">Maandag 17:00 - 18:00</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Evaluatie
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerDashboard