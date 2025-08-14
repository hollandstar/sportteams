import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

const CoachFeaturesSection: React.FC = () => {
  const { t } = useTranslation()

  return (
    <section className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('coaches.title')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="✅"
            title={t('coaches.evaluations.title')}
            description={t('coaches.evaluations.description')}
          />
          <FeatureCard
            icon="🎯"
            title={t('coaches.planning.title')}
            description={t('coaches.planning.description')}
          />
          <FeatureCard
            icon="📊"
            title={t('coaches.dashboard.title')}
            description={t('coaches.dashboard.description')}
          />
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-opacity-20 transition-all duration-200 border border-white border-opacity-10">
      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  )
}

export default CoachFeaturesSection