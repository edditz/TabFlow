import { useState, useEffect, useCallback, useRef } from 'react'

export interface ShortcutKey {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

interface ShortcutRecorderProps {
  value: ShortcutKey | null
  onChange: (shortcut: ShortcutKey | null) => void
  placeholder?: string
  disabled?: boolean
}

// Check if a shortcut has a valid key
export function isValidShortcut(shortcut: ShortcutKey | null): boolean {
  return shortcut !== null && shortcut.key !== ''
}

// Convert ShortcutKey to display string
export function formatShortcut(shortcut: ShortcutKey | null): string {
  if (!isValidShortcut(shortcut)) return ''

  const parts: string[] = []
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  if (shortcut!.ctrl) parts.push(isMac ? '⌃' : 'Ctrl')
  if (shortcut!.alt) parts.push(isMac ? '⌥' : 'Alt')
  if (shortcut!.shift) parts.push(isMac ? '⇧' : 'Shift')
  if (shortcut!.meta) parts.push(isMac ? '⌘' : 'Meta')

  // Format the key
  let keyDisplay = shortcut!.key.toUpperCase()
  if (keyDisplay === ' ') keyDisplay = 'Space'
  if (keyDisplay === 'ARROWUP') keyDisplay = '↑'
  if (keyDisplay === 'ARROWDOWN') keyDisplay = '↓'
  if (keyDisplay === 'ARROWLEFT') keyDisplay = '←'
  if (keyDisplay === 'ARROWRIGHT') keyDisplay = '→'

  parts.push(keyDisplay)

  return parts.join(' + ')
}

// Convert ShortcutKey to Chrome extension format
export function toChromeFormat(shortcut: ShortcutKey | null): string {
  if (!isValidShortcut(shortcut)) return ''

  const parts: string[] = []

  if (shortcut!.ctrl) parts.push('Ctrl')
  if (shortcut!.alt) parts.push('Alt')
  if (shortcut!.shift) parts.push('Shift')
  if (shortcut!.meta) parts.push('Command')

  let key = shortcut!.key.toUpperCase()
  // Normalize key names for Chrome
  if (key === ' ') key = 'Space'
  if (key.startsWith('ARROW')) key = key.replace('ARROW', '')
  if (key === 'ESCAPE') key = 'Escape'

  parts.push(key)

  return parts.join('+')
}

// Parse Chrome format to ShortcutKey
export function fromChromeFormat(shortcut: string): ShortcutKey | null {
  if (!shortcut) return null

  const parts = shortcut.split('+')
  const result: ShortcutKey = { key: '' }

  for (const part of parts) {
    const normalized = part.trim().toLowerCase()
    if (normalized === 'ctrl') result.ctrl = true
    else if (normalized === 'alt') result.alt = true
    else if (normalized === 'shift') result.shift = true
    else if (normalized === 'command' || normalized === 'meta') result.meta = true
    else result.key = part.trim()
  }

  return result
}

export function ShortcutRecorder({
  value,
  onChange,
  placeholder = 'Press shortcut keys...',
  disabled = false
}: ShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [hasError, setHasError] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isRecording || disabled) return

      e.preventDefault()
      e.stopPropagation()

      // Escape to cancel - restore previous value
      if (e.key === 'Escape') {
        setIsRecording(false)
        return
      }

      // Only modifier keys pressed, don't record
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return
      }

      // Must have at least one modifier key (Ctrl, Alt, Meta, or Shift)
      if (!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        setHasError(true)
        setTimeout(() => setHasError(false), 1000)
        return
      }

      const shortcut: ShortcutKey = {
        key: e.key,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey
      }

      onChange(shortcut)
      setIsRecording(false)
    },
    [isRecording, disabled, onChange]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!isRecording || disabled) return
      e.preventDefault()
      e.stopPropagation()
    },
    [isRecording, disabled]
  )

  useEffect(() => {
    if (isRecording) {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isRecording, handleKeyDown, handleKeyUp])

  const handleClick = () => {
    if (!disabled) {
      setIsRecording(true)
      setHasError(false)
      inputRef.current?.focus()
    }
  }

  const handleBlur = () => {
    setIsRecording(false)
  }

  return (
    <div
      ref={inputRef}
      className={`shortcut-recorder ${isRecording ? 'recording' : ''} ${hasError ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onBlur={handleBlur}
      tabIndex={disabled ? -1 : 0}
    >
      {isRecording ? (
        <span className="shortcut-placeholder recording-text">Recording...</span>
      ) : isValidShortcut(value) ? (
        <span className="shortcut-value">{formatShortcut(value)}</span>
      ) : (
        <span className="shortcut-placeholder">{placeholder}</span>
      )}
    </div>
  )
}
