import { createContext, useContext, useState, useCallback } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [demoShopOpen, setDemoShopOpen] = useState(false)

  const openDemoShop  = useCallback(() => setDemoShopOpen(true),  [])
  const closeDemoShop = useCallback(() => setDemoShopOpen(false), [])

  return (
    <UIContext.Provider value={{ demoShopOpen, openDemoShop, closeDemoShop }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within <UIProvider>')
  return ctx
}
