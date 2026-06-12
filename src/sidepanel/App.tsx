import { useState, useEffect } from 'react'
import './App.css'

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    function getActualTheme(themeSetting: string): 'light' | 'dark' {
      if (themeSetting === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return themeSetting as 'light' | 'dark'
    }

    chrome.storage.sync.get({ theme: 'system' }, data => {
      setTheme(getActualTheme(data.theme))
    })

    chrome.storage.onChanged.addListener(changes => {
      if (changes.theme) {
        setTheme(getActualTheme(changes.theme.newValue))
      }
    })

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      chrome.storage.sync.get({ theme: 'system' }, data => {
        if (data.theme === 'system') {
          setTheme(getActualTheme('system'))
        }
      })
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="sidebar-container">
      <h1>TabFlow Sidebar</h1>
    </div>
  )
}
