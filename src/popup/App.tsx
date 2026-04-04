import { useState, useEffect } from 'react'
import { formatShortcut } from '../options/components/ShortcutRecorder'
import type { ShortcutConfig } from '../options/components/ShortcutSettings'
import { useTranslation } from '../i18n'
import { Search, Settings, FolderX } from 'lucide-react'
import './App.css'

const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { id: 'toggle-search-panel', shortcut: { key: 'z', ctrl: true, shift: true } }
]

export function App() {
  const { t } = useTranslation()
  const [shortcut, setShortcut] = useState<string>('')

  useEffect(() => {
    chrome.storage.sync.get({ shortcuts: DEFAULT_SHORTCUTS }, data => {
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

  const handleUngroupAll = async () => {
    await chrome.runtime.sendMessage({ type: 'UNGROUP_ALL' })
    window.close()
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="popup-icon">
          <img src="../../icons/icon48.png" alt="TabFlow" />
        </div>
        <h1 className="popup-title">TabFlow</h1>
      </header>

      <div className="popup-actions">
        <button className="popup-btn" onClick={handleOpenSearch}>
          <span className="popup-btn-icon"><Search size={18} strokeWidth={2} /></span>
          <span className="popup-btn-text">{t.popupSearchTabs}</span>
          {shortcut && <span className="popup-shortcut">{shortcut}</span>}
        </button>

        <button className="popup-btn" onClick={handleOpenOptions}>
          <span className="popup-btn-icon"><Settings size={18} strokeWidth={2} /></span>
          <span className="popup-btn-text">{t.popupSettings}</span>
        </button>

        <button className="popup-btn" onClick={handleUngroupAll}>
          <span className="popup-btn-icon"><FolderX size={18} strokeWidth={2} /></span>
          <span className="popup-btn-text">{t.popupUngroupAll}</span>
        </button>
      </div>
    </div>
  )
}
