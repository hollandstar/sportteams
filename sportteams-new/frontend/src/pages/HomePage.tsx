import React, { useState } from 'react'
import LandingHeader from '../components/Navigation/LandingHeader'
import LandingPage from '../components/Landing/LandingPage'
import AuthModal from '../components/Auth/AuthModal'

const HomePage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleLoginClick = () => {
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <div className="min-h-screen">
      <LandingHeader onLoginClick={handleLoginClick} />
      <LandingPage onLoginClick={handleLoginClick} />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  )
}

export default HomePage