import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_SIDEBAR_SETTINGS } from '../types'
import type { SidebarSettings, SidebarLayout } from '../types'

export function useSidebarSettings() {
  const [settings, setSettings] = useState<SidebarSettings>(DEFAULT_SIDEBAR_SETTINGS)

  useEffect(() => {
    chrome.storage.sync.get({ sidebarSettings: DEFAULT_SIDEBAR_SETTINGS }, data => {
      setSettings({ ...DEFAULT_SIDEBAR_SETTINGS, ...(data.sidebarSettings as SidebarSettings) })
    })

    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.sidebarSettings) {
        setSettings({ ...DEFAULT_SIDEBAR_SETTINGS, ...(changes.sidebarSettings.newValue as SidebarSettings) })
      }
    }

    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [])

  const updateSetting = useCallback(<K extends keyof SidebarSettings>(key: K, value: SidebarSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      chrome.storage.sync.set({ sidebarSettings: next })
      return next
    })
  }, [])

  const updateLayout = useCallback((layout: SidebarLayout) => {
    updateSetting('sidebarLayout', layout)
  }, [updateSetting])

  return { settings, updateSetting, updateLayout }
}
