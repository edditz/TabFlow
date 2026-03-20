import { createRoot } from 'react-dom/client'
import { SearchPanel } from './components/SearchPanel'
import { createAgentationInstance, type Annotation } from '../shared'
import './styles.css'

// Dev-only - uses custom VITE_DEV env var instead of built-in DEV
// This ensures Agentation is bundled in dev mode but tree-shaken in production
const isDev = import.meta.env.VITE_DEV === 'true'

// DOM containers and React roots
let searchRoot: ReturnType<typeof createRoot> | null = null
let searchContainer: HTMLDivElement | null = null

// Agentation instance
let agentationInstance: ReturnType<typeof createAgentationInstance> | null = null

// State
let isVisible = false
let keyboardListener: ((e: KeyboardEvent) => void) | null = null

function init(): void {
  searchContainer = document.createElement('div')
  searchContainer.id = 'tab-tool-root'
  document.body.appendChild(searchContainer)
  searchRoot = createRoot(searchContainer)

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
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Z') {
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
    searchRoot.render(<SearchPanel onClose={hide} />)
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
