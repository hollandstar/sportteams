import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'

const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Geen toegang
        </h1>
        <p className="text-gray-600 mb-6">
          Je hebt geen toestemming om deze pagina te bekijken.
        </p>
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Ga naar Dashboard
          </Link>
          <Link
            to="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Ga naar Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage