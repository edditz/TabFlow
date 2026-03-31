import { useState, useEffect } from 'react'
import './App.css'
import { useTranslation } from '../i18n'
import { ShortcutSettings, ShortcutConfig, DEFAULT_SHORTCUTS } from './components/ShortcutSettings'
import { Switch } from './components/Switch'
import { AISettings as AISettingsComponent } from './components/AISettings'
import type { AISettings } from '../classification'
import { DEFAULT_AI_SETTINGS } from '../classification'

export type UrlDisplayStyle = 'none' | 'domain' | 'full'

interface Settings {
  enableSearchPanel: boolean
  showTabCount: boolean
  theme: 'system' | 'light' | 'dark'
  language: 'en' | 'zh'
  searchCurrentWindow: boolean
  urlDisplayStyle: UrlDisplayStyle
  shortcuts: ShortcutConfig[]
  enableRecentClosed: boolean
  recentClosedTimeWindow: number
  recentClosedMaxResults: number
  aiSettings: AISettings
}

const DEFAULT_SETTINGS: Settings = {
  enableSearchPanel: true,
  showTabCount: false,
  theme: 'system',
  language: 'en',
  searchCurrentWindow: false,
  urlDisplayStyle: 'domain',
  shortcuts: DEFAULT_SHORTCUTS,
  enableRecentClosed: true,
  recentClosedTimeWindow: 24,
  recentClosedMaxResults: 10,
  aiSettings: DEFAULT_AI_SETTINGS
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
    chrome.storage.sync.get(DEFAULT_SETTINGS, data => {
      let loadedSettings = data as Settings

      // In development mode, auto-fill AI settings from environment variables
      if (import.meta.env.VITE_DEV) {
        const envAISettings: Partial<AISettings> = {}

        if (import.meta.env.VITE_AI_ENABLED !== undefined) {
          envAISettings.enabled = import.meta.env.VITE_AI_ENABLED === 'true'
        }
        if (import.meta.env.VITE_AI_ENDPOINT) {
          envAISettings.endpoint = import.meta.env.VITE_AI_ENDPOINT
        }
        if (import.meta.env.VITE_AI_API_KEY) {
          envAISettings.apiKey = import.meta.env.VITE_AI_API_KEY
        }
        if (import.meta.env.VITE_AI_MODEL) {
          envAISettings.model = import.meta.env.VITE_AI_MODEL
        }

        // If any env vars are set, merge and save to storage
        if (Object.keys(envAISettings).length > 0) {
          loadedSettings = {
            ...loadedSettings,
            aiSettings: { ...loadedSettings.aiSettings, ...envAISettings }
          }
          // Save to storage so UI shows the values
          chrome.storage.sync.set({ aiSettings: loadedSettings.aiSettings })
        }
      }

      setSettings(loadedSettings)
      setActualTheme(getActualTheme(loadedSettings.theme))
    })

    // Listen for settings changes
    chrome.storage.onChanged.addListener(changes => {
      if (changes.theme) {
        setActualTheme(getActualTheme(changes.theme.newValue))
      }
    })

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      chrome.storage.sync.get({ theme: 'system' }, data => {
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
          <img src="../../icons/icon128.png" alt="Tab Tool" />
        </div>
        <div className="header-text">
          <h1>{t.settingsTitle}</h1>
          <p className="header-subtitle">{t.settingsSubtitle}</p>
        </div>
      </header>

      {/* Keyboard Shortcuts */}
      <section className="options-section">
        <div className="section-header">
          <svg
            className="section-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
          </svg>
          <h2 className="section-title">{t.keyboardShortcuts}</h2>
        </div>

        <ShortcutSettings
          shortcuts={settings.shortcuts.length === 2 ? settings.shortcuts : DEFAULT_SHORTCUTS}
          onChange={shortcuts => updateSetting('shortcuts', shortcuts)}
          labels={{
            toggleSearchPanel: t.toggleSearchPanel,
            toggleSearchPanelDesc: t.toggleSearchPanelDesc,
            openExtensionPopup: t.openExtensionPopup,
            openExtensionPopupDesc: t.openExtensionPopupDesc,
            clickToRecord: t.clickToRecord,
            recording: t.recording,
            resetToDefault: t.resetToDefault,
            shortcutConflict: t.shortcutConflict
          }}
        />
      </section>

      {/* General Settings */}
      <section className="options-section">
        <div className="section-header">
          <svg
            className="section-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <Switch
            checked={settings.enableSearchPanel}
            onChange={checked => updateSetting('enableSearchPanel', checked)}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.showTabCountBadge}</div>
            <div className="setting-desc">{t.showTabCountBadgeDesc}</div>
          </div>
          <Switch
            checked={settings.showTabCount}
            onChange={checked => updateSetting('showTabCount', checked)}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.theme}</div>
            <div className="setting-desc">{t.themeDesc}</div>
          </div>
          <select
            className="setting-select"
            value={settings.theme}
            onChange={e => updateSetting('theme', e.target.value as Settings['theme'])}
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
            onChange={e => updateSetting('language', e.target.value as Settings['language'])}
          >
            <option value="en">{t.languageEn}</option>
            <option value="zh">{t.languageZh}</option>
          </select>
        </div>
      </section>

      {/* Search Settings */}
      <section className="options-section">
        <div className="section-header">
          <svg
            className="section-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <Switch
            checked={settings.searchCurrentWindow}
            onChange={checked => updateSetting('searchCurrentWindow', checked)}
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.urlDisplayStyle}</div>
            <div className="setting-desc">{t.urlDisplayStyleDesc}</div>
          </div>
          <select
            className="setting-select"
            value={settings.urlDisplayStyle}
            onChange={e => updateSetting('urlDisplayStyle', e.target.value as UrlDisplayStyle)}
          >
            <option value="none">{t.urlDisplayStyleNone}</option>
            <option value="domain">{t.urlDisplayStyleDomain}</option>
            <option value="full">{t.urlDisplayStyleFull}</option>
          </select>
        </div>
      </section>

      {/* Recently Closed Settings */}
      <section className="options-section">
        <div className="section-header">
          <svg
            className="section-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h2 className="section-title">{t.recentClosedSettings}</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.enableRecentClosed}</div>
            <div className="setting-desc">{t.enableRecentClosedDesc}</div>
          </div>
          <Switch
            checked={settings.enableRecentClosed}
            onChange={checked => updateSetting('enableRecentClosed', checked)}
          />
        </div>

        {settings.enableRecentClosed && (
          <>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">{t.recentClosedTimeWindow}</div>
                <div className="setting-desc">{t.recentClosedTimeWindowDesc}</div>
              </div>
              <select
                className="setting-select"
                value={settings.recentClosedTimeWindow}
                onChange={e => updateSetting('recentClosedTimeWindow', Number(e.target.value))}
              >
                <option value="1">1 {t.hours}</option>
                <option value="2">2 {t.hours}</option>
                <option value="3">3 {t.hours}</option>
                <option value="6">6 {t.hours}</option>
                <option value="12">12 {t.hours}</option>
                <option value="24">24 {t.hours}</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">{t.recentClosedMaxResults}</div>
                <div className="setting-desc">{t.recentClosedMaxResultsDesc}</div>
              </div>
              <select
                className="setting-select"
                value={settings.recentClosedMaxResults}
                onChange={e => updateSetting('recentClosedMaxResults', Number(e.target.value))}
              >
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
          </>
        )}
      </section>

      {/* AI Classification Settings */}
      <AISettingsComponent
        settings={settings.aiSettings}
        onChange={aiSettings => updateSetting('aiSettings', aiSettings)}
        labels={{
          aiSettings: t.aiSettings,
          enableAiClassification: t.enableAiClassification,
          enableAiClassificationDesc: t.enableAiClassificationDesc,
          apiEndpoint: t.apiEndpoint,
          apiEndpointHint: t.apiEndpointHint,
          apiKey: t.apiKey,
          apiKeyPlaceholder: t.apiKeyPlaceholder,
          modelName: t.modelName,
          modelNameHint: t.modelNameHint,
          testConnection: t.testConnection,
          connectionSuccess: t.connectionSuccess,
          connectionFailed: t.connectionFailed
        }}
      />

      <footer className="options-footer">
        <span>Tab Tool v{chrome.runtime.getManifest().version}</span>
      </footer>

      <div className={`save-indicator ${saved ? 'show' : ''}`}>{t.settingsSaved}</div>
    </div>
  )
}
