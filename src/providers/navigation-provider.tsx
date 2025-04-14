'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

type NavigationContextType = {
  isNavigationVisible: boolean
  setNavigationVisible: (visible: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigationVisible, setNavigationVisible] = useState(true)

  return (
    <NavigationContext.Provider value={{ isNavigationVisible, setNavigationVisible }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within an NavigationProvider')
  }
  return context
}
