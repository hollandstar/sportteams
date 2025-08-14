import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import { useTranslation } from '../../hooks/useTranslation'
import { 
  HomeIcon, 
  UsersIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  const location = useLocation()

  const navigationItems = [
    {
      name: t('nav.dashboard'),
      href: '/dashboard',
      icon: HomeIcon,
      allowedRoles: ['admin', 'team_admin', 'coach', 'player'],
    },
    {
      name: t('nav.players'),
      href: '/dashboard/players',
      icon: UsersIcon,
      allowedRoles: ['admin', 'team_admin', 'coach'],
    },
    {
      name: t('nav.teams'),
      href: '/dashboard/teams',
      icon: UserGroupIcon,
      allowedRoles: ['admin', 'team_admin', 'coach'],
    },
    {
      name: t('nav.evaluations'),
      href: '/dashboard/evaluations',
      icon: ClipboardDocumentListIcon,
      allowedRoles: ['admin', 'team_admin', 'coach', 'player'],
    },
    {
      name: 'Doelen',
      href: '/dashboard/goals',
      icon: TrophyIcon,
      allowedRoles: ['admin', 'team_admin', 'coach', 'player'],
    },
    {
      name: 'Feedback',
      href: '/dashboard/feedback',
      icon: ChatBubbleLeftRightIcon,
      allowedRoles: ['admin', 'team_admin', 'coach', 'player'],
    },
    {
      name: 'Testen',
      href: '/dashboard/tests',
      icon: AcademicCapIcon,
      allowedRoles: ['admin', 'team_admin', 'coach'],
    },
    {
      name: 'Rapporten',
      href: '/dashboard/reports',
      icon: ChartBarIcon,
      allowedRoles: ['admin', 'team_admin', 'coach'],
    },
    {
      name: 'Gebruikers',
      href: '/dashboard/users',
      icon: UsersIcon,
      allowedRoles: ['admin'],
    },
    {
      name: 'Audit Log',
      href: '/dashboard/audit',
      icon: DocumentTextIcon,
      allowedRoles: ['admin', 'team_admin'],
    },
    {
      name: t('nav.settings'),
      href: '/dashboard/settings',
      icon: Cog6ToothIcon,
      allowedRoles: ['admin'],
    },
  ]

  const filteredNavigation = navigationItems.filter(item => 
    user && item.allowedRoles.includes(user.role)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="ml-3 text-lg font-semibold text-sidebar-text">{t('nav.logo')}</h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-sidebar-text-muted hover:text-sidebar-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 py-4 border-b border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-text">{user.name}</p>
                  <p className="text-xs text-sidebar-text-muted capitalize">
                    {t(`roles.${user.role}`)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => onClose()}
                  className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-700">
            <p className="text-xs text-sidebar-text-muted text-center">
              SportTeams v2.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar