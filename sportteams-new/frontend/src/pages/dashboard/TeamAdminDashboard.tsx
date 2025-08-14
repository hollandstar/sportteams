import React, { useState, useEffect } from 'react'
import StatsCard from '../../components/Dashboard/StatsCard'
import DataTable, { Column } from '../../components/Dashboard/DataTable'
import { useTranslation } from '../../hooks/useTranslation'
import {
  UsersIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Player {
  id: number
  name: string
  email: string
  position: string
  team_name: string
  jersey_number: number
  created_at: string
}

interface Team {
  id: number
  name: string
  sport: string
  player_count: number
}

const TeamAdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockTeams: Team[] = [
      { id: 1, name: 'JO16 Hockey Heren', sport: 'Hockey', player_count: 18 },
      { id: 2, name: 'JO18 Hockey Dames', sport: 'Hockey', player_count: 16 }
    ]

    const mockPlayers: Player[] = [
      {
        id: 1,
        name: 'Jan de Vries',
        email: 'jan@example.com',
        position: 'Middenvelder',
        team_name: 'JO16 Hockey Heren',
        jersey_number: 10,
        created_at: '2025-01-10'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        position: 'Aanvaller',
        team_name: 'JO18 Hockey Dames',
        jersey_number: 7,
        created_at: '2025-01-12'
      }
    ]

    setTeams(mockTeams)
    setPlayers(mockPlayers)
    setLoading(false)
  }, [])

  const stats = [
    {
      title: 'Mijn Teams',
      value: teams.length.toString(),
      icon: UserGroupIcon
    },
    {
      title: 'Totaal Spelers',
      value: players.length.toString(),
      icon: UsersIcon
    },
    {
      title: 'Nieuwe Spelers (Deze Maand)',
      value: '5',
      change: '+25%',
      changeType: 'increase' as const,
      icon: PlusIcon
    },
    {
      title: 'Actieve Evaluaties',
      value: '12',
      icon: PencilIcon
    }
  ]

  const playerColumns: Column<Player>[] = [
    {
      key: 'name',
      title: 'Naam',
      sortable: true
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true
    },
    {
      key: 'team_name',
      title: 'Team',
      sortable: true
    },
    {
      key: 'position',
      title: 'Positie',
      sortable: true
    },
    {
      key: 'jersey_number',
      title: 'Rugnummer',
      sortable: true,
      render: (value) => value ? `#${value}` : '-'
    },
    {
      key: 'created_at',
      title: 'Toegevoegd',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('nl-NL')
    }
  ]

  const teamColumns: Column<Team>[] = [
    {
      key: 'name',
      title: 'Team Naam',
      sortable: true
    },
    {
      key: 'sport',
      title: 'Sport',
      sortable: true
    },
    {
      key: 'player_count',
      title: 'Aantal Spelers',
      sortable: true,
      render: (value) => `${value} spelers`
    }
  ]

  const handlePlayerAction = (action: string, player: Player) => {
    console.log(`${action} player:`, player)
    // TODO: Implement actual actions
  }

  const playerActions = (player: Player) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handlePlayerAction('view', player)}
        className="text-primary-600 hover:text-primary-900"
      >
        <EyeIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handlePlayerAction('edit', player)}
        className="text-gray-600 hover:text-gray-900"
      >
        <PencilIcon className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Beheer spelers en teams onder uw toezicht
          </p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nieuwe Speler
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} stats={stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Teams Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mijn Teams</h3>
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <h4 className="font-medium text-gray-900">{team.name}</h4>
                  <p className="text-sm text-gray-500">{team.sport}</p>
                  <p className="text-sm text-gray-500">{team.player_count} spelers</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recente Activiteit</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Jan de Vries toegevoegd aan JO16 Hockey Heren</p>
                  <p className="text-xs text-gray-500">2 uur geleden</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Evaluatie voltooid voor Sarah Johnson</p>
                  <p className="text-xs text-gray-500">1 dag geleden</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Team opstelling bijgewerkt</p>
                  <p className="text-xs text-gray-500">2 dagen geleden</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Alle Spelers</h3>
          <div className="flex space-x-2">
            <button className="btn-secondary text-sm">
              Exporteren
            </button>
            <button className="btn-secondary text-sm">
              Importeren
            </button>
          </div>
        </div>
        <DataTable
          columns={playerColumns}
          data={players}
          loading={loading}
          actions={playerActions}
          onRowClick={(player) => console.log('View player:', player)}
        />
      </div>
    </div>
  )
}

export default TeamAdminDashboard