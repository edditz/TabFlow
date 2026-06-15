import { useState, useEffect } from 'react'
import { Keyboard, Search, LayoutGrid } from 'lucide-react'
import './App.css'
import { useTranslation } from '../i18n'
import {
  ShortcutSettings,
  ShortcutConfig,
  DEFAULT_SHORTCUTS
} from './components/ShortcutSettings'
import { Switch } from './components/Switch'
import type { SidebarSettings, SidebarLayout } from '../sidepanel/types'
import { DEFAULT_SIDEBAR_SETTINGS } from '../sidepanel/types'

export type UrlDisplayStyle = 'none' | 'domain' | 'full'

interface Settings {
  enableSearchPanel: boolean
  theme: 'system' | 'light' | 'dark'
  language: 'en' | 'zh'
  searchCurrentWindow: boolean
  urlDisplayStyle: UrlDisplayStyle
  shortcuts: ShortcutConfig[]
  enableRecentClosed: boolean
  recentClosedTimeWindow: number
  recentClosedMaxResults: number
  sidebarSettings: SidebarSettings
}

const DEFAULT_SETTINGS: Settings = {
  enableSearchPanel: true,
  theme: 'system',
  language: 'en',
  searchCurrentWindow: false,
  urlDisplayStyle: 'domain',
  shortcuts: DEFAULT_SHORTCUTS,
  enableRecentClosed: true,
  recentClosedTimeWindow: 24,
  recentClosedMaxResults: 10,
  sidebarSettings: DEFAULT_SIDEBAR_SETTINGS
}

// Sync shortcuts to chrome.commands via background service worker
function syncShortcutsViaBackground(shortcuts: ShortcutConfig[]): void {
  chrome.runtime.sendMessage({ type: 'UPDATE_SHORTCUTS', shortcuts })
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
      const loadedSettings = data as Settings

      setSettings(loadedSettings)
      setActualTheme(getActualTheme(loadedSettings.theme))

      // Sync shortcuts to chrome.commands via background
      const shortcutsToSync = loadedSettings.shortcuts?.length === 1 ? loadedSettings.shortcuts : DEFAULT_SHORTCUTS
      syncShortcutsViaBackground(shortcutsToSync)
    })

    // Listen for settings changes
    chrome.storage.onChanged.addListener(changes => {
      if (changes.theme) {
        setActualTheme(getActualTheme(changes.theme.newValue))
      }
      if (changes.sidebarSettings) {
        setSettings(prev => ({
          ...prev,
          sidebarSettings: { ...prev.sidebarSettings, ...changes.sidebarSettings.newValue }
        }))
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

    // Update chrome.commands via background when shortcuts change
    if (key === 'shortcuts') {
      syncShortcutsViaBackground(value as ShortcutConfig[])
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
          <img src="../../icons/icon128.png" alt="TabFlow" />
        </div>
        <div className="header-text">
          <h1>{t.settingsTitle}</h1>
          <p className="header-subtitle">{t.settingsSubtitle}</p>
        </div>
      </header>

      {/* Keyboard Shortcuts */}
      <section className="options-section">
        <div className="section-header">
          <Keyboard className="section-icon" size={16} strokeWidth={2} />
          <h2 className="section-title">{t.keyboardShortcuts}</h2>
        </div>

        <ShortcutSettings
          shortcuts={settings.shortcuts.length >= DEFAULT_SHORTCUTS.length ? settings.shortcuts : DEFAULT_SHORTCUTS}
          onChange={shortcuts => updateSetting('shortcuts', shortcuts)}
          labels={{
            toggleSearchPanel: t.toggleSearchPanel,
            toggleSearchPanelDesc: t.toggleSearchPanelDesc,
            toggleSidePanel: t.toggleSidePanel,
            toggleSidePanelDesc: t.toggleSidePanelDesc,
            clickToRecord: t.clickToRecord,
            recording: t.recording,
            resetToDefault: t.resetToDefault,
            shortcutConflict: t.shortcutConflict
          }}
        />
      </section>

      {/* Search Settings */}
      <section className="options-section">
        <div className="section-header">
          <Search className="section-icon" size={16} strokeWidth={2} />
          <h2 className="section-title">{t.searchSettings}</h2>
        </div>

        {/* General */}
        <div className="section-subtitle">{t.generalSettings}</div>

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

        {/* Search */}
        <div className="section-subtitle">{t.searchSettings}</div>

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

        {/* Recently Closed */}
        <div className="section-subtitle">{t.recentClosedSettings}</div>

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

      {/* Sidebar Settings */}
      <section className="options-section">
        <div className="section-header">
          <LayoutGrid className="section-icon" size={16} strokeWidth={2} />
          <h2 className="section-title">{t.sidebarSettings}</h2>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.sidebarLayout}</div>
            <div className="setting-desc">{t.sidebarLayoutDesc}</div>
          </div>
          <select
            className="setting-select"
            value={settings.sidebarSettings.sidebarLayout}
            onChange={e => updateSetting('sidebarSettings', {
              ...settings.sidebarSettings,
              sidebarLayout: e.target.value as SidebarLayout
            })}
          >
            <option value="compact">{t.layoutCompact}</option>
            <option value="detailed">{t.layoutCard}</option>
            <option value="tree">{t.layoutTree}</option>
          </select>
        </div>

        {/* Shared: Favicon (all layouts) */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.sidebarShowFavicon}</div>
            <div className="setting-desc">{t.sidebarShowFaviconDesc}</div>
          </div>
          <Switch
            checked={settings.sidebarSettings.sidebarShowFavicon}
            onChange={checked => updateSetting('sidebarSettings', {
              ...settings.sidebarSettings,
              sidebarShowFavicon: checked
            })}
          />
        </div>

        {/* Shared: Close Button (all layouts) */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.sidebarShowCloseButton}</div>
            <div className="setting-desc">{t.sidebarShowCloseButtonDesc}</div>
          </div>
          <Switch
            checked={settings.sidebarSettings.sidebarShowCloseButton}
            onChange={checked => updateSetting('sidebarSettings', {
              ...settings.sidebarSettings,
              sidebarShowCloseButton: checked
            })}
          />
        </div>

        {/* Recent Tabs (universal) */}
        <div className="section-subtitle">{t.recentClosedSettings}</div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t.sidebarShowRecent}</div>
            <div className="setting-desc">{t.sidebarShowRecentDesc}</div>
          </div>
          <Switch
            checked={settings.sidebarSettings.sidebarShowRecent}
            onChange={checked => updateSetting('sidebarSettings', {
              ...settings.sidebarSettings,
              sidebarShowRecent: checked
            })}
          />
        </div>

        {settings.sidebarSettings.sidebarShowRecent && (
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{t.sidebarRecentCount}</div>
              <div className="setting-desc">{t.sidebarRecentCountDesc}</div>
            </div>
            <select
              className="setting-select"
              value={settings.sidebarSettings.sidebarRecentCount}
              onChange={e => updateSetting('sidebarSettings', {
                ...settings.sidebarSettings,
                sidebarRecentCount: Number(e.target.value)
              })}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
        )}

        {/* Tree: Group expand */}
        {settings.sidebarSettings.sidebarLayout === 'tree' && (
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">{t.sidebarDefaultExpanded}</div>
              <div className="setting-desc">{t.sidebarDefaultExpandedDesc}</div>
            </div>
            <Switch
              checked={settings.sidebarSettings.sidebarDefaultExpanded}
              onChange={checked => updateSetting('sidebarSettings', {
                ...settings.sidebarSettings,
                sidebarDefaultExpanded: checked
              })}
            />
          </div>
        )}

        {/* Card (detailed): Group tag, Audio, Pinned, Memory */}
        {settings.sidebarSettings.sidebarLayout === 'detailed' && (
          <>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">{t.sidebarShowGroupTag}</div>
                <div className="setting-desc">{t.sidebarShowGroupTagDesc}</div>
              </div>
              <Switch
                checked={settings.sidebarSettings.sidebarShowGroupTag}
                onChange={checked => updateSetting('sidebarSettings', {
                  ...settings.sidebarSettings,
                  sidebarShowGroupTag: checked
                })}
              />
            </div>


          </>
        )}
      </section>

      <footer className="options-footer">
        <span>TabFlow v{chrome.runtime.getManifest().version}</span>
      </footer>

      <div className={`save-indicator ${saved ? 'show' : ''}`}>{t.settingsSaved}</div>
    </div>
  )
}
