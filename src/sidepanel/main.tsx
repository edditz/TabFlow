import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// Get actual theme based on setting and system preference
function getActualTheme(themeSetting: string): 'light' | 'dark' {
  if (themeSetting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return themeSetting as 'light' | 'dark'
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
}

// Initialize theme
chrome.storage.sync.get({ theme: 'system' }, data => {
  applyTheme(getActualTheme(data.theme))
})

// Listen for theme setting changes
chrome.storage.onChanged.addListener(changes => {
  if (changes.theme) {
    applyTheme(getActualTheme(changes.theme.newValue))
  }
})

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  chrome.storage.sync.get({ theme: 'system' }, data => {
    if (data.theme === 'system') {
      applyTheme(getActualTheme('system'))
    }
  })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
