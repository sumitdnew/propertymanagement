import React from 'react'
import PropertyManagementApp from './components/PropertyManagementApp'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <PropertyManagementApp />
      </div>
    </LanguageProvider>
  )
}

export default App
