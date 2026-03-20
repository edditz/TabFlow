// Options page script

// Default settings
const DEFAULT_SETTINGS = {
  enableSearchPanel: true,
  showTabCount: false,
  theme: 'system',
  searchCurrentWindow: false,
  maxResults: '10',
}

// Load settings from storage
async function loadSettings(): Promise<void> {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS)

  // Apply settings to form elements
  const elements = {
    enableSearchPanel: document.getElementById('enableSearchPanel') as HTMLInputElement,
    showTabCount: document.getElementById('showTabCount') as HTMLInputElement,
    theme: document.getElementById('theme') as HTMLSelectElement,
    searchCurrentWindow: document.getElementById('searchCurrentWindow') as HTMLInputElement,
    maxResults: document.getElementById('maxResults') as HTMLSelectElement,
  }

  if (elements.enableSearchPanel) {
    elements.enableSearchPanel.checked = settings.enableSearchPanel
  }
  if (elements.showTabCount) {
    elements.showTabCount.checked = settings.showTabCount
  }
  if (elements.theme) {
    elements.theme.value = settings.theme
  }
  if (elements.searchCurrentWindow) {
    elements.searchCurrentWindow.checked = settings.searchCurrentWindow
  }
  if (elements.maxResults) {
    elements.maxResults.value = settings.maxResults
  }
}

// Save settings to storage
async function saveSettings(): Promise<void> {
  const settings = {
    enableSearchPanel: (document.getElementById('enableSearchPanel') as HTMLInputElement)?.checked ?? true,
    showTabCount: (document.getElementById('showTabCount') as HTMLInputElement)?.checked ?? false,
    theme: (document.getElementById('theme') as HTMLSelectElement)?.value ?? 'system',
    searchCurrentWindow: (document.getElementById('searchCurrentWindow') as HTMLInputElement)?.checked ?? false,
    maxResults: (document.getElementById('maxResults') as HTMLSelectElement)?.value ?? '10',
  }

  await chrome.storage.sync.set(settings)
  showSaveIndicator()
}

// Show save indicator
function showSaveIndicator(): void {
  const indicator = document.getElementById('saveIndicator')
  if (indicator) {
    indicator.classList.add('show')
    setTimeout(() => {
      indicator.classList.remove('show')
    }, 2000)
  }
}

// Setup event listeners
function setupListeners(): void {
  const formElements = ['enableSearchPanel', 'showTabCount', 'theme', 'searchCurrentWindow', 'maxResults']

  formElements.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.addEventListener('change', saveSettings)
    }
  })
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings()
  setupListeners()
})
