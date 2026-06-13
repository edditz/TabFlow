import { useTranslation } from '../i18n'
import { Search, Settings, FolderX, PanelLeft } from 'lucide-react'
import './App.css'

export function App() {
  const { t } = useTranslation()

  const handleOpenSearch = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SEARCH_PANEL' })
    }
    window.close()
  }

  const handleOpenSidebar = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId })
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
        </button>

        <button className="popup-btn" onClick={handleOpenSidebar}>
          <span className="popup-btn-icon"><PanelLeft size={18} strokeWidth={2} /></span>
          <span className="popup-btn-text">{t.popupOpenSidebar}</span>
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
