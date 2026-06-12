import { useEffect, useRef, useState } from 'react'

export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  danger?: boolean
  divider?: boolean
  children?: MenuItem[]
}

interface ContextMenuProps {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
  onAction: (actionId: string) => void
}

export function ContextMenu({ x, y, items, onClose, onAction }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [submenu, setSubmenu] = useState<{ items: MenuItem[]; x: number; y: number } | null>(
    null
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const adjustedY = Math.min(y, window.innerHeight - items.length * 32 - 20)
  const adjustedX = Math.min(x, window.innerWidth - 180)

  return (
    <div className="context-menu-overlay">
      <div className="context-menu" ref={menuRef} style={{ top: adjustedY, left: adjustedX }}>
        {items.map((item) => (
          <div key={item.id}>
            {item.divider && <div className="context-menu-divider" />}
            {!item.divider && (
              <button
                className={`context-menu-item ${item.danger ? 'danger' : ''}`}
                onClick={() => {
                  if (item.children) return
                  onAction(item.id)
                  onClose()
                }}
                onMouseEnter={(e) => {
                  if (item.children) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setSubmenu({ items: item.children, x: rect.right, y: rect.top })
                  } else {
                    setSubmenu(null)
                  }
                }}
              >
                <span className="context-menu-icon">{item.icon}</span>
                <span className="context-menu-label">{item.label}</span>
                {item.children && <span className="context-menu-arrow">›</span>}
              </button>
            )}
          </div>
        ))}
      </div>
      {submenu && (
        <div className="context-menu context-submenu" style={{ top: submenu.y, left: submenu.x }}>
          {submenu.items.map((item) => (
            <button
              key={item.id}
              className={`context-menu-item ${item.danger ? 'danger' : ''}`}
              onClick={() => {
                onAction(item.id)
                onClose()
              }}
            >
              <span className="context-menu-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
