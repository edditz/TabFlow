import './App.css'

export function App() {
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
        <div className="popup-icon">📋</div>
        <h1 className="popup-title">Tab Tool</h1>
      </header>

      <div className="popup-actions">
        <button className="popup-btn" onClick={handleOpenSearch}>
          <span className="popup-btn-icon">🔍</span>
          <span className="popup-btn-text">Search Tabs</span>
          <span className="popup-shortcut">Ctrl+Shift+F</span>
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
