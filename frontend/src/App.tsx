import React, { useState } from 'react'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('profinance_token'))

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  return <Dashboard />
}

export default App
