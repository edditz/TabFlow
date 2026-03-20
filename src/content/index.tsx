import { createRoot } from 'react-dom/client'
import { SearchPanel } from './components/SearchPanel'
import './styles.css'

let root: ReturnType<typeof createRoot> | null = null
let container: HTMLDivElement | null = null

let isVisible = false

let keyboardListener: ((e: KeyboardEvent) => void) | null = null

function init() {
  if (root) return

  container = document.createElement('div')
  container.id = 'tab-tool-root'
  document.body.appendChild(container)

  root = createRoot(container)
}

function setupKeyboardListener() {
  keyboardListener = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
      toggle()
    }
  }
  document.addEventListener('keydown', keyboardListener)
}
function toggle() {
  isVisible = !isVisible
  render()
}
function render() {
  if (!root) return

  if (isVisible) {
    root.render(<SearchPanel onClose={hide} />)
  } else {
    root.render(null)
  }
}
function hide() {
  isVisible = false
  render()
}
// Initialize
init()
setupKeyboardListener()
// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_SEARCH_PANEL') {
    toggle()
  }
})
console.log('Tab Tool content script loaded')
