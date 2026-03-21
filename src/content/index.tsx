import { createRoot } from 'react-dom/client'
import { SearchPanel } from './components/SearchPanel'
import { createAgentationInstance, type Annotation } from '../shared'
import type { Language } from '../i18n'
import type { ShortcutConfig } from '../options/components/ShortcutSettings'
import type { ShortcutKey } from '../options/components/ShortcutRecorder'
import './styles.css'

// Dev-only - uses custom VITE_DEV env var instead of built-in DEV
// This ensures Agentation is bundled in dev mode but tree-shaken in production
const isDev = import.meta.env.VITE_DEV === 'true'

// Default shortcuts
const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { id: 'toggle-search-panel', shortcut: { key: 'a', ctrl: true, meta: true } },
  { id: '_execute_action', shortcut: { key: 'h', meta: true } },
]

// DOM containers and React roots
let searchRoot: ReturnType<typeof createRoot> | null = null
let searchContainer: HTMLDivElement | null = null

// Agentation instance
let agentationInstance: ReturnType<typeof createAgentationInstance> | null = null

// State
let isVisible = false
let keyboardListener: ((e: KeyboardEvent) => void) | null = null
let currentTheme: 'system' | 'light' | 'dark' = 'system'
let currentLanguage: Language = 'en'
let currentShortcut: ShortcutKey | null = DEFAULT_SHORTCUTS[0].shortcut

// Get actual theme based on setting and system preference
function getActualTheme(): 'light' | 'dark' {
  if (currentTheme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return currentTheme
}

// Check if keyboard event matches the shortcut
function matchesShortcut(e: KeyboardEvent, shortcut: ShortcutKey | null): boolean {
  if (!shortcut || !shortcut.key) return false

  const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
  const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey
  const altMatch = shortcut.alt ? e.altKey : !e.altKey
  const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
  const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey

  return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch
}

function init(): void {
  searchContainer = document.createElement('div')
  searchContainer.id = 'tab-tool-root'
  document.body.appendChild(searchContainer)
  searchRoot = createRoot(searchContainer)

  // Load theme, language and shortcuts settings
  chrome.storage.sync.get(
    { theme: 'system', language: 'en', shortcuts: DEFAULT_SHORTCUTS },
    (data) => {
      currentTheme = data.theme
      currentLanguage = data.language
      if (data.shortcuts && data.shortcuts.length > 0) {
        currentShortcut = data.shortcuts[0].shortcut
      }
      render()
    }
  )

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.theme) {
      currentTheme = changes.theme.newValue
      render()
    }
    if (changes.language) {
      currentLanguage = changes.language.newValue
      render()
    }
    if (changes.shortcuts) {
      const shortcuts = changes.shortcuts.newValue as ShortcutConfig[]
      if (shortcuts && shortcuts.length > 0) {
        currentShortcut = shortcuts[0].shortcut
      }
    }
  })

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      render()
    }
  })

  // Initialize Agentation instance (dev only)
  if (isDev) {
    agentationInstance = createAgentationInstance({
      containerId: 'tab-tool-agentation',
      zIndex: 2147483647,
      visible: false,
      onAnnotationAdd: (annotation: Annotation) => {
        console.log('Agentation annotation:', annotation)
      }
    })
  }
}

function setupKeyboardListener(): void {
  keyboardListener = (e: KeyboardEvent) => {
    if (matchesShortcut(e, currentShortcut)) {
      e.preventDefault()
      toggle()
    }
  }
  document.addEventListener('keydown', keyboardListener)
}

function toggle(): void {
  isVisible = !isVisible
  render()
}

function render(): void {
  if (!searchRoot) return

  if (isVisible) {
    searchRoot.render(<SearchPanel onClose={hide} theme={getActualTheme()} language={currentLanguage} />)
    // Show Agentation when SearchPanel opens
    if (isDev && agentationInstance) {
      agentationInstance.show()
    }
  } else {
    searchRoot.render(null)
    // Hide Agentation when SearchPanel closes
    if (isDev && agentationInstance) {
      agentationInstance.hide()
    }
  }
}

function hide(): void {
  isVisible = false
  render()
}

// Initialize
init()
setupKeyboardListener()
render()

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_SEARCH_PANEL') {
    toggle()
  }
})

console.log('Tab Tool content script loaded')
