import { useState, useEffect } from 'react'
import './App.css'

interface Settings {
  enableSearchPanel: boolean
  showTabCount: boolean
  theme: 'system' | 'light' | 'dark'
  searchCurrentWindow: boolean
  maxResults: string
}

const DEFAULT_SETTINGS: Settings = {
  enableSearchPanel: true,
  showTabCount: false,
  theme: 'system',
  searchCurrentWindow: false,
  maxResults: '10',
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
        <div className="options-title">
          <div className="options-icon">📋</div>
          <h1>Tab Tool Settings</h1>
        </div>
        <p className="options-description">Configure your tab management preferences</p>
      </header>

      {/* Keyboard Shortcuts */}
      <section className="options-section">
        <h2 className="section-title">⌨️ Keyboard Shortcuts</h2>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Toggle Search Panel</div>
            <div className="setting-desc">Open/close the global tab search panel</div>
          </div>
          <div className="shortcuts">
            <kbd>Ctrl</kbd>
            <kbd>Shift</kbd>
            <kbd>F</kbd>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Open Extension Popup</div>
            <div className="setting-desc">Open the extension popup window</div>
          </div>
          <div className="shortcuts">
            <kbd>Ctrl</kbd>
            <kbd>Shift</kbd>
            <kbd>Y</kbd>
          </div>
        </div>
      </section>

      {/* General Settings */}
      <section className="options-section">
        <h2 className="section-title">⚙️ General Settings</h2>

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
        <h2 className="section-title">🔍 Search Settings</h2>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Search Current Window Only</div>
            <div className="setting-desc">Limit search results to the current browser window</div>
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
            <div className="setting-label">Max Results</div>
            <div className="setting-desc">Maximum number of results to display</div>
          </div>
          <select
            className="setting-select"
            value={settings.maxResults}
            onChange={(e) => updateSetting('maxResults', e.target.value)}
          >
            <option value="5">5 results</option>
            <option value="10">10 results</option>
            <option value="20">20 results</option>
            <option value="50">50 results</option>
          </select>
        </div>
      </section>

      <footer className="options-footer">
        <span>Tab Tool v{chrome.runtime.getManifest().version}</span>
      </footer>

      <div className={`save-indicator ${saved ? 'show' : ''}`}>Settings saved</div>
    </div>
  )
}
