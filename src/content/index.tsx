import { createRoot } from 'react-dom/client'
import { SearchPanel } from './components/SearchPanel'
import { createAgentationInstance, type Annotation } from '../shared'
import { translations, type Language } from '../i18n'
import type { ShortcutConfig } from '../options/components/ShortcutSettings'
import type { ShortcutKey } from '../options/components/ShortcutRecorder'
import type { UrlDisplayStyle } from '../options/App'

// Import CSS as raw string for Shadow DOM injection
import cssText from './components/SearchPanel.css?inline'
import toastCssText from './styles.css?inline'

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
let shadowHost: HTMLDivElement | null = null
let shadowRoot: ShadowRoot | null = null
let appContainer: HTMLDivElement | null = null
let closePanelCallback: (() => void) | null = null

// Agentation instance
let agentationInstance: ReturnType<typeof createAgentationInstance> | null = null

// State
let isVisible = false
let keyboardListener: ((e: KeyboardEvent) => void) | null = null
let currentEnableSearchPanel: boolean = true
let currentTheme: 'system' | 'light' | 'dark' = 'system'
let currentLanguage: Language = 'en'
let currentUrlDisplayStyle: UrlDisplayStyle = 'domain'
let currentSearchCurrentWindow: boolean = false
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
  // Create shadow DOM host
  shadowHost = document.createElement('div')
  shadowHost.id = 'tab-tool-root'
  document.body.appendChild(shadowHost)

  // Create Shadow DOM for style isolation
  shadowRoot = shadowHost.attachShadow({ mode: 'open' })

  // Inject styles into Shadow DOM
  const styleElement = document.createElement('style')
  styleElement.textContent = cssText + '\n' + toastCssText
  shadowRoot.appendChild(styleElement)

  // Create container for React app inside Shadow DOM
  appContainer = document.createElement('div')
  appContainer.id = 'tab-tool-app'
  shadowRoot.appendChild(appContainer)

  searchRoot = createRoot(appContainer)

  // Load theme, language and shortcuts settings
  chrome.storage.sync.get(
    { theme: 'system', language: 'en', urlDisplayStyle: 'domain', searchCurrentWindow: false, enableSearchPanel: true, shortcuts: DEFAULT_SHORTCUTS },
    (data) => {
      currentEnableSearchPanel = data.enableSearchPanel
      currentTheme = data.theme
      currentLanguage = data.language
      currentUrlDisplayStyle = data.urlDisplayStyle
      currentSearchCurrentWindow = data.searchCurrentWindow
      if (data.shortcuts && data.shortcuts.length > 0) {
        currentShortcut = data.shortcuts[0].shortcut
      }
      updateHostTheme()
      render()
    }
  )

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enableSearchPanel) {
      currentEnableSearchPanel = changes.enableSearchPanel.newValue
      // Hide panel if disabled while visible
      if (!currentEnableSearchPanel && isVisible) {
        hide()
      }
    }
    if (changes.theme) {
      currentTheme = changes.theme.newValue
      updateHostTheme()
      render()
    }
    if (changes.language) {
      currentLanguage = changes.language.newValue
      render()
    }
    if (changes.urlDisplayStyle) {
      currentUrlDisplayStyle = changes.urlDisplayStyle.newValue
      render()
    }
    if (changes.searchCurrentWindow) {
      currentSearchCurrentWindow = changes.searchCurrentWindow.newValue
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
      updateHostTheme()
      render()
    }
  })

  // Close panel when switching to another tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isVisible) {
      hide()
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

// Update theme attribute on shadow host for CSS variable switching
function updateHostTheme(): void {
  if (shadowHost) {
    shadowHost.setAttribute('data-theme', getActualTheme())
  }
}

function setupKeyboardListener(): void {
  keyboardListener = (e: KeyboardEvent) => {
    if (matchesShortcut(e, currentShortcut)) {
      e.preventDefault()
      if (!currentEnableSearchPanel) {
        showDisabledToast()
        return
      }
      toggle()
    }
  }
  document.addEventListener('keydown', keyboardListener)
}

function toggle(): void {
  if (isVisible) {
    // Trigger close animation instead of hiding immediately
    if (closePanelCallback) {
      closePanelCallback()
    }
  } else {
    isVisible = true
    render()
  }
}

function render(): void {
  if (!searchRoot) return

  if (isVisible) {
    searchRoot.render(
      <SearchPanel
        onCloseComplete={hide}
        registerCloseCallback={(callback) => {
          closePanelCallback = callback
        }}
        theme={getActualTheme()}
        language={currentLanguage}
        urlDisplayStyle={currentUrlDisplayStyle}
        searchCurrentWindow={currentSearchCurrentWindow}
      />
    )
    // Show Agentation when SearchPanel opens
    if (isDev && agentationInstance) {
      agentationInstance.show()
    }
  } else {
    searchRoot.render(null)
    closePanelCallback = null
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

// Show toast notification when search panel is disabled
let toastTimeout: ReturnType<typeof setTimeout> | null = null
function showDisabledToast(): void {
  if (!shadowRoot) return

  // Remove existing toast if any
  const existingToast = shadowRoot.querySelector('.tt-toast')
  if (existingToast) {
    existingToast.remove()
  }
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }

  const t = translations[currentLanguage]
  const toast = document.createElement('div')
  toast.className = 'tt-toast'
  toast.setAttribute('data-theme', getActualTheme())
  toast.innerHTML = `
    <div class="tt-toast-title">${t.searchPanelDisabled}</div>
    <div class="tt-toast-hint">${t.searchPanelDisabledHint}</div>
  `
  shadowRoot.appendChild(toast)

  toastTimeout = setTimeout(() => {
    toast.classList.add('hiding')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Initialize
init()
setupKeyboardListener()
render()

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_SEARCH_PANEL') {
    if (currentEnableSearchPanel) {
      toggle()
    } else {
      showDisabledToast()
    }
  }
})

console.log('Tab Tool content script loaded')
