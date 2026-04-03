// src/content/components/DroppableCategoryGroup.tsx
import { useDroppable } from '@dnd-kit/core'
import { ChevronDown } from 'lucide-react'
import type { CategoryGroup } from '../../classification'

interface DroppableCategoryGroupProps {
  group: CategoryGroup
  isOver: boolean
  getCategoryLabel: (name: string) => string
  moveToCategoryLabel: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  children: React.ReactNode
}

export function DroppableCategoryGroup({
  group,
  isOver,
  getCategoryLabel,
  moveToCategoryLabel,
  isCollapsed,
  onToggleCollapse,
  children
}: DroppableCategoryGroupProps) {
  const { setNodeRef } = useDroppable({
    id: `group-${group.name}`,
    data: { group }
  })

  const dropHintText = moveToCategoryLabel.replace('{category}', getCategoryLabel(group.name))

  return (
    <div
      ref={setNodeRef}
      className={`cp-group ${isOver ? 'drop-target' : ''}`}
    >
      {/* Header */}
      <div
        className="cp-group-header"
        onClick={onToggleCollapse}
        role="button"
        aria-expanded={!isCollapsed}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleCollapse()
          }
        }}
      >
        <button
          className="cp-collapse-btn"
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          tabIndex={-1}
        >
          <ChevronDown size={16} strokeWidth={2} className={isCollapsed ? 'cp-collapse-icon-collapsed' : ''} />
        </button>
        <span className={`cp-group-color cp-color-${group.color}`} />
        <span className="cp-group-name">{getCategoryLabel(group.name)}</span>
        <span className="cp-group-count">{group.tabs.length}</span>
      </div>

      {/* Drop hint */}
      {isOver && (
        <div className="cp-drop-hint">
          {dropHintText}
        </div>
      )}

      {/* Tabs */}
      <div className={`cp-group-tabs-wrapper ${isCollapsed ? 'cp-collapsed' : ''}`}>
        <div className="cp-group-tabs">
          {children}
        </div>
      </div>
    </div>
  )
}
