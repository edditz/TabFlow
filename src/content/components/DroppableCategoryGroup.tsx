// src/content/components/DroppableCategoryGroup.tsx
import { useDroppable } from '@dnd-kit/core'
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="16"
            height="16"
            className={isCollapsed ? 'cp-collapse-icon-collapsed' : ''}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
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
