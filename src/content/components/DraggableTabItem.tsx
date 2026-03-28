// src/content/components/DraggableTabItem.tsx
import { useDraggable } from '@dnd-kit/core'
import { TabItem } from './TabItem'
import type { TabInfo } from '../../classification'

interface DraggableTabItemProps {
  tab: TabInfo
  isDragging: boolean
}

export function DraggableTabItem({ tab, isDragging }: DraggableTabItemProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `tab-${tab.id}`,
    data: { tab }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cp-draggable-tab ${isDragging ? 'dragging' : ''}`}
    >
      <TabItem tab={tab} showUrl={false} className="cp-tab-item" />
    </div>
  )
}
