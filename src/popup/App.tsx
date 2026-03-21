import { useState, useEffect } from 'react'
import { formatShortcut } from '../options/components/ShortcutRecorder'
import type { ShortcutConfig } from '../options/components/ShortcutSettings'
import './App.css'

const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { id: 'toggle-search-panel', shortcut: { key: 'z', ctrl: true, shift: true } },
]

export function App() {
  const [shortcut, setShortcut] = useState<string>('')

  useEffect(() => {
    chrome.storage.sync.get({ shortcuts: DEFAULT_SHORTCUTS }, (data) => {
      const shortcuts = data.shortcuts as ShortcutConfig[]
      if (shortcuts && shortcuts.length > 0) {
        setShortcut(formatShortcut(shortcuts[0].shortcut))
      }
    })
  }, [])

  const handleOpenSearch = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SEARCH_PANEL' })
    }
    window.close()
  }

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage()
    window.close()
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="popup-icon">
          <img src="../../icons/icon48.png" alt="Tab Tool" />
        </div>
        <h1 className="popup-title">Tab Tool</h1>
      </header>

      <div className="popup-actions">
        <button className="popup-btn" onClick={handleOpenSearch}>
          <span className="popup-btn-icon">🔍</span>
          <span className="popup-btn-text">Search Tabs</span>
          {shortcut && <span className="popup-shortcut">{shortcut}</span>}
        </button>

        <button className="popup-btn" onClick={handleOpenOptions}>
          <span className="popup-btn-icon">⚙️</span>
          <span className="popup-btn-text">Settings</span>
        </button>
      </div>

      <footer className="popup-footer">
        <span>v{chrome.runtime.getManifest().version}</span>
      </footer>
    </div>
  )
}
