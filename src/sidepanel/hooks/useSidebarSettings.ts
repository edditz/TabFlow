import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_SIDEBAR_SETTINGS } from '../types'
import type { SidebarSettings, SidebarLayout } from '../types'

export function useSidebarSettings() {
  const [settings, setSettings] = useState<SidebarSettings>(DEFAULT_SIDEBAR_SETTINGS)

  useEffect(() => {
    chrome.storage.sync.get(DEFAULT_SIDEBAR_SETTINGS, data => {
      setSettings({ ...DEFAULT_SIDEBAR_SETTINGS, ...data })
    })

    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      setSettings(prev => {
        const updated = { ...prev }
        for (const key of Object.keys(changes) as Array<keyof SidebarSettings>) {
          if (changes[key]) {
            ;(updated as Record<keyof SidebarSettings, unknown>)[key] = changes[key].newValue
          }
        }
        return updated
      })
    }

    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [])

  const updateSetting = useCallback(<K extends keyof SidebarSettings>(key: K, value: SidebarSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    chrome.storage.sync.set({ [key]: value })
  }, [])

  const updateLayout = useCallback((layout: SidebarLayout) => {
    updateSetting('sidebarLayout', layout)
  }, [updateSetting])

  return { settings, updateSetting, updateLayout }
}
