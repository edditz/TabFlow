import { useState, useEffect } from 'react'
import './App.css'

interface Settings {
  enableSearchPanel: boolean
  showTabCount: boolean
  theme: 'system' | 'light' | 'dark'
  searchCurrentWindow: boolean
  alwaysShowTabUrl: boolean
}

const DEFAULT_SETTINGS: Settings = {
  enableSearchPanel: true,
  showTabCount: false,
  theme: 'system',
  searchCurrentWindow: false,
  alwaysShowTabUrl: true,
}

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
      setSettings(data as Settings)
    })
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
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
          <h1>Tab Tool Settings</h1>
          <p className="header-subtitle">Configure your tab management preferences</p>
        </div>
      </header>

      {/* Keyboard Shortcuts */}
      <section className="options-section">
        <div className="section-header">
          <svg className="section-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
          </svg>
          <h2 className="section-title">Keyboard Shortcuts</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Toggle Search Panel</div>
            <div className="setting-desc">Open/close the global tab search panel</div>
          </div>
          <div className="shortcut-keys">Ctrl   Shift   Z</div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Open Extension Popup</div>
            <div className="setting-desc">Open the extension popup window</div>
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
          <h2 className="section-title">General Settings</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Enable Search Panel</div>
            <div className="setting-desc">Show the global search panel on any page</div>
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
            <div className="setting-label">Show Tab Count Badge</div>
            <div className="setting-desc">Display the number of open tabs on the extension icon</div>
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
            <div className="setting-label">Theme</div>
            <div className="setting-desc">Choose the appearance of the search panel</div>
          </div>
          <select
            className="setting-select"
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value as Settings['theme'])}
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
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
          <h2 className="section-title">Search Settings</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Search Current Window Only</div>
            <div className="setting-desc">Limit results to tabs from the active window</div>
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
            <div className="setting-label">Always Show Tab URL</div>
            <div className="setting-desc">Keep URL visible in candidate rows</div>
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

      <div className={`save-indicator ${saved ? 'show' : ''}`}>Settings saved</div>
    </div>
  )
}
