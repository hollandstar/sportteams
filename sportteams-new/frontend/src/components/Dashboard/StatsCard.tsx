import React from 'react'
import { DashboardStats } from '../../types/auth'

interface StatsCardProps {
  stats: DashboardStats
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const { title, value, change, changeType, icon: Icon } = stats

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <div className="stats-card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor()}`}>
                  <span className="sr-only">
                    {changeType === 'increase' ? 'Increased' : changeType === 'decrease' ? 'Decreased' : 'Changed'} by
                  </span>
                  {getChangeIcon()} {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default StatsCard