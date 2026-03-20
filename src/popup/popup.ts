// Popup script

document.getElementById('openSearch')?.addEventListener('click', async () => {
  // Send message to toggle search panel in active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SEARCH_PANEL' })
  }
  // Close popup
  window.close()
})

document.getElementById('openOptions')?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage()
  window.close()
})

// Update version display
const manifest = chrome.runtime.getManifest()
const versionEl = document.getElementById('version')
if (versionEl) {
  versionEl.textContent = `v${manifest.version}`
}
