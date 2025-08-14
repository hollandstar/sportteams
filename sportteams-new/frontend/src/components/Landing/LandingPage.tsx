import React from 'react'
import HeroSection from './HeroSection'
import CoachFeaturesSection from './CoachFeaturesSection'
import TestimonialSection from './TestimonialSection'
import DemoRequestSection from './DemoRequestSection'
import { useTranslation } from '../../hooks/useTranslation'

interface LandingPageProps {
  onLoginClick: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      <HeroSection onLoginClick={onLoginClick} />
      <TestimonialSection />
      <CoachFeaturesSection />
      <DemoRequestSection />
    </div>
  )
}

export default LandingPage