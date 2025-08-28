import React from 'react'
import PropertyManagementApp from './components/PropertyManagementApp'
import { LanguageProvider } from './contexts/LanguageContext'
import { SupabaseProvider } from './contexts/SupabaseContext'

function App() {
  return (
    <SupabaseProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">
          <PropertyManagementApp />
        </div>
      </LanguageProvider>
    </SupabaseProvider>
  )
}

export default App
