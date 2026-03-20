import { useState, useEffect } from 'react'
import './App.css'
import { useTranslation } from '../i18n'

interface Settings {
  enableSearchPanel: boolean
  showTabCount: boolean
  theme: 'system' | 'light' | 'dark'
  language: 'en' | 'zh'
  searchCurrentWindow: boolean
  alwaysShowTabUrl: boolean
}

const DEFAULT_SETTINGS: Settings = {
  enableSearchPanel: true,
  showTabCount: false,
  theme: 'system',
  language: 'en',
  searchCurrentWindow: false,
  alwaysShowTabUrl: true,
}

// Get actual theme based on setting and system preference
function getActualTheme(themeSetting: 'system' | 'light' | 'dark'): 'light' | 'dark' {
  if (themeSetting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return themeSetting
}

export function App() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme)
  }, [actualTheme])

  // Load settings and setup listeners
  useEffect(() => {
    // Load initial settings
    chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
      const loadedSettings = data as Settings
      setSettings(loadedSettings)
      setActualTheme(getActualTheme(loadedSettings.theme))
    })

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.theme) {
        setActualTheme(getActualTheme(changes.theme.newValue))
      }
    })

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      chrome.storage.sync.get({ theme: 'system' }, (data) => {
        if (data.theme === 'system') {
          setActualTheme(getActualTheme('system'))
        }
      })
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    // Update actual theme immediately when theme setting changes
    if (key === 'theme') {
      setActualTheme(getActualTheme(value as 'system' | 'light' | 'dark'))
    }

    chrome.storage.sync.set(newSettings, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <div className="header-icon">
          <span>📋</span>
        </div>
        <div className="header-text">
          <h1>{t.settingsTitle}</h1>
          <p className="header-subtitle">{t.settingsSubtitle}</p>
        </div>
      </header>

      {/* Keyboard Shortcuts */}
      <section className="options-section">
        <div className="section-header">
          <svg className="section-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
          </svg>
          <h2 className="section-title">{t.keyboardShortcuts}</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.toggleSearchPanel}</div>
            <div className="setting-desc">{t.toggleSearchPanelDesc}</div>
          </div>
          <div className="shortcut-keys">Ctrl   Shift   Z</div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.openExtensionPopup}</div>
            <div className="setting-desc">{t.openExtensionPopupDesc}</div>
          </div>
          <div className="shortcut-keys">Ctrl   Shift   Y</div>
        </div>
      </section>

      {/* General Settings */}
      <section className="options-section">
        <div className="section-header">
          <svg className="section-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h2 className="section-title">{t.generalSettings}</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.enableSearchPanel}</div>
            <div className="setting-desc">{t.enableSearchPanelDesc}</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.enableSearchPanel}
              onChange={(e) => updateSetting('enableSearchPanel', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.showTabCountBadge}</div>
            <div className="setting-desc">{t.showTabCountBadgeDesc}</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.showTabCount}
              onChange={(e) => updateSetting('showTabCount', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.theme}</div>
            <div className="setting-desc">{t.themeDesc}</div>
          </div>
          <select
            className="setting-select"
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value as Settings['theme'])}
          >
            <option value="system">{t.themeSystem}</option>
            <option value="light">{t.themeLight}</option>
            <option value="dark">{t.themeDark}</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.language}</div>
            <div className="setting-desc">{t.languageDesc}</div>
          </div>
          <select
            className="setting-select"
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value as Settings['language'])}
          >
            <option value="en">{t.languageEn}</option>
            <option value="zh">{t.languageZh}</option>
          </select>
        </div>
      </section>

      {/* Search Settings */}
      <section className="options-section">
        <div className="section-header">
          <svg className="section-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h2 className="section-title">{t.searchSettings}</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.searchCurrentWindowOnly}</div>
            <div className="setting-desc">{t.searchCurrentWindowOnlyDesc}</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.searchCurrentWindow}
              onChange={(e) => updateSetting('searchCurrentWindow', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.alwaysShowTabUrl}</div>
            <div className="setting-desc">{t.alwaysShowTabUrlDesc}</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.alwaysShowTabUrl}
              onChange={(e) => updateSetting('alwaysShowTabUrl', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </section>

      <footer className="options-footer">
        <span>Tab Tool v{chrome.runtime.getManifest().version}</span>
      </footer>

      <div className={`save-indicator ${saved ? 'show' : ''}`}>{t.settingsSaved}</div>
    </div>
  )
}
