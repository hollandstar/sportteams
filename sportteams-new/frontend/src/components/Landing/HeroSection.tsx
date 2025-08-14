import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

interface HeroSectionProps {
  onLoginClick: () => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onLoginClick }) => {
  const { t } = useTranslation()

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {t('hero.title')}
        </h1>
        <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>
        
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <FeatureCard
            icon="📊"
            title={t('features.scientific.title')}
            description={t('features.scientific.description')}
          />
          <FeatureCard
            icon="🎯"
            title={t('features.allinone.title')}
            description={t('features.allinone.description')}
          />
          <FeatureCard
            icon="👥"
            title={t('features.collaboration.title')}
            description={t('features.collaboration.description')}
          />
          <FeatureCard
            icon="📈"
            title={t('features.growth.title')}
            description={t('features.growth.description')}
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={onLoginClick}
          className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          {t('hero.cta')}
        </button>
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
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-opacity-20 transition-all duration-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-200 leading-relaxed">{description}</p>
    </div>
  )
}

export default HeroSection