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
    shortcut: { key: 'a', ctrl: true, meta: true }
  }
]

export function ShortcutSettings({ shortcuts, onChange, labels }: ShortcutSettingsProps) {
  const [conflictIndex, setConflictIndex] = useState<number | null>(null)

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
        return (
          <div key={shortcut.id} className="shortcut-item">
            <div className="shortcut-info">
              <div className="shortcut-label">{labels.toggleSearchPanel}</div>
              <div className="shortcut-desc">{labels.toggleSearchPanelDesc}</div>
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
