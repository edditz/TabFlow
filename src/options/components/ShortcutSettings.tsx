import { useState, useEffect } from 'react'
import { ShortcutRecorder, ShortcutKey, toChromeFormat, isValidShortcut } from './ShortcutRecorder'

export interface ShortcutConfig {
  id: string
  shortcut: ShortcutKey | null
}

interface ShortcutSettingsProps {
  shortcuts: ShortcutConfig[]
  onChange: (shortcuts: ShortcutConfig[]) => void
  labels: {
    toggleSearchPanel: string
    toggleSearchPanelDesc: string
    toggleSidePanel: string
    toggleSidePanelDesc: string
    clickToRecord: string
    recording: string
    resetToDefault: string
    shortcutConflict: string
  }
}

// Default shortcuts configuration
export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  {
    id: 'toggle-search-panel',
    shortcut: { key: 'z', ctrl: true, shift: true }
  },
  {
    id: 'toggle-side-panel',
    shortcut: { key: 'l', alt: true }
  }
]

export function ShortcutSettings({ shortcuts, onChange, labels }: ShortcutSettingsProps) {
  const [conflictIndex, setConflictIndex] = useState<number | null>(null)

  const shortcutLabelMap: Record<string, { label: string; desc: string }> = {
    'toggle-search-panel': { label: labels.toggleSearchPanel, desc: labels.toggleSearchPanelDesc },
    'toggle-side-panel': { label: labels.toggleSidePanel, desc: labels.toggleSidePanelDesc }
  }

  // Check for conflicts
  useEffect(() => {
    for (let i = 0; i < shortcuts.length; i++) {
      for (let j = i + 1; j < shortcuts.length; j++) {
        if (isValidShortcut(shortcuts[i].shortcut) && isValidShortcut(shortcuts[j].shortcut)) {
          const s1 = toChromeFormat(shortcuts[i].shortcut)
          const s2 = toChromeFormat(shortcuts[j].shortcut)
          if (s1 === s2) {
            setConflictIndex(j)
            return
          }
        }
      }
    }
    setConflictIndex(null)
  }, [shortcuts])

  const handleShortcutChange = (index: number, newShortcut: ShortcutKey | null) => {
    const updated = shortcuts.map((s, i) => (i === index ? { ...s, shortcut: newShortcut } : s))
    onChange(updated)
  }

  const handleReset = () => {
    onChange(DEFAULT_SHORTCUTS)
  }

  return (
    <div className="shortcut-settings">
      {shortcuts.map((shortcut, index) => {
        const info = shortcutLabelMap[shortcut.id]
        return (
          <div key={shortcut.id} className="shortcut-item">
            <div className="shortcut-info">
              <div className="shortcut-label">{info?.label ?? shortcut.id}</div>
              <div className="shortcut-desc">{info?.desc ?? ''}</div>
              {conflictIndex === index && (
                <div className="shortcut-error">{labels.shortcutConflict}</div>
              )}
            </div>
            <ShortcutRecorder
              value={shortcut.shortcut}
              onChange={newShortcut => handleShortcutChange(index, newShortcut)}
              placeholder={labels.clickToRecord}
            />
          </div>
        )
      })}

      <div className="shortcut-actions">
        <button className="shortcut-reset-btn" onClick={handleReset}>
          {labels.resetToDefault}
        </button>
      </div>
    </div>
  )
}
