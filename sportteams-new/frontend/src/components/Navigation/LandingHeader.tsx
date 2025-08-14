import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

interface LandingHeaderProps {
  onLoginClick: () => void
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onLoginClick }) => {
  const { t } = useTranslation()

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{t('nav.logo')}</h1>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={onLoginClick}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border-2 border-white border-opacity-50 rounded-lg text-sm sm:text-base font-medium text-white bg-white bg-opacity-10 backdrop-blur-sm hover:bg-opacity-20 hover:border-opacity-100 transition-all duration-200"
          >
            {t('nav.login')}
          </button>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader