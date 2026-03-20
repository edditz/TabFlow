// Content script - injected into all web pages

import './styles.css'

class SearchPanel {
  private panel: HTMLElement | null = null
  private isVisible = false

  constructor() {
    this.createPanel()
    this.setupListeners()
  }

  private createPanel(): void {
    // Create panel container
    this.panel = document.createElement('div')
    this.panel.id = 'tab-tool-search-panel'
    this.panel.className = 'tab-tool-panel hidden'

    // Panel content
    this.panel.innerHTML = `
      <div class="tab-tool-overlay"></div>
      <div class="tab-tool-container">
        <div class="tab-tool-header">
          <input
            type="text"
            class="tab-tool-input"
            placeholder="Search tabs... (placeholder)"
            autocomplete="off"
          />
          <button class="tab-tool-close-btn" title="Close (Esc)">×</button>
        </div>
        <div class="tab-tool-results">
          <div class="tab-tool-result-item">
            <span class="tab-tool-result-icon">📄</span>
            <div class="tab-tool-result-info">
              <div class="tab-tool-result-title">Example Tab 1</div>
              <div class="tab-tool-result-url">https://example.com/page1</div>
            </div>
          </div>
          <div class="tab-tool-result-item">
            <span class="tab-tool-result-icon">📄</span>
            <div class="tab-tool-result-info">
              <div class="tab-tool-result-title">Example Tab 2</div>
              <div class="tab-tool-result-url">https://example.com/page2</div>
            </div>
          </div>
          <div class="tab-tool-result-item">
            <span class="tab-tool-result-icon">📄</span>
            <div class="tab-tool-result-info">
              <div class="tab-tool-result-title">Example Tab 3</div>
              <div class="tab-tool-result-url">https://example.com/page3</div>
            </div>
          </div>
        </div>
        <div class="tab-tool-footer">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    `

    document.body.appendChild(this.panel)

    // Setup close button
    const closeBtn = this.panel.querySelector('.tab-tool-close-btn')
    closeBtn?.addEventListener('click', () => this.hide())

    // Setup overlay click to close
    const overlay = this.panel.querySelector('.tab-tool-overlay')
    overlay?.addEventListener('click', () => this.hide())

    // Setup keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide()
      }
    })
  }

  private setupListeners(): void {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'TOGGLE_SEARCH_PANEL') {
        this.toggle()
      }
    })
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  public show(): void {
    if (this.panel) {
      this.panel.classList.remove('hidden')
      this.isVisible = true

      // Focus the input
      const input = this.panel.querySelector('.tab-tool-input') as HTMLInputElement
      input?.focus()
    }
  }

  public hide(): void {
    if (this.panel) {
      this.panel.classList.add('hidden')
      this.isVisible = false
    }
  }
}

// Initialize search panel
const searchPanel = new SearchPanel()

console.log('Tab Tool content script loaded')
