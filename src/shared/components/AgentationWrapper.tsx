import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Annotation } from 'agentation'

/**
 * Agentation 使用模式
 */
export type AgentationMode = 'inline' | 'portal'

/**
 * AgentationWrapper 组件属性
 */
export interface AgentationWrapperProps {
  /** 使用模式：inline 直接渲染，portal 注入到 body */
  mode?: AgentationMode
  /** 是否显示 */
  visible?: boolean
  /** 容器 ID（portal 模式） */
  containerId?: string
  /** z-index 层级 */
  zIndex?: number
  /** 注解添加回调 */
  onAnnotationAdd?: (annotation: Annotation) => void
  /** 注解删除回调 */
  onAnnotationDelete?: (annotation: Annotation) => void
  /** 注解更新回调 */
  onAnnotationUpdate?: (annotation: Annotation) => void
  /** 清空注解回调 */
  onAnnotationsClear?: (annotations: Annotation[]) => void
  /** 复制回调 */
  onCopy?: (markdown: string) => void
  /** 是否复制到剪贴板 */
  copyToClipboard?: boolean
}

// 模块级别的状态管理
let AgentationComponent: React.ComponentType<any> | null = null
let agentationLoaded = false

/**
 * 动态加载 Agentation 模块
 */
async function loadAgentationModule(): Promise<React.ComponentType<any> | null> {
  if (agentationLoaded) {
    return AgentationComponent
  }

  try {
    const mod = await import('agentation')
    AgentationComponent = mod.Agentation
    agentationLoaded = true
    return AgentationComponent
  } catch (error) {
    console.error('Failed to load Agentation:', error)
    return null
  }
}

/**
 * Agentation 内联渲染组件
 */
function AgentationInline(props: Omit<AgentationWrapperProps, 'mode' | 'containerId'>) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    loadAgentationModule().then(setComponent)
  }, [])

  if (!Component || !props.visible) {
    return null
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <Component
        onAnnotationAdd={props.onAnnotationAdd}
        onAnnotationDelete={props.onAnnotationDelete}
        onAnnotationUpdate={props.onAnnotationUpdate}
        onAnnotationsClear={props.onAnnotationsClear}
        onCopy={props.onCopy}
        copyToClipboard={props.copyToClipboard}
      />
    </div>
  )
}

/**
 * Agentation Portal 渲染组件
 */
function AgentationPortal(props: Omit<AgentationWrapperProps, 'mode'>) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    // 创建容器
    const el = document.createElement('div')
    el.id = props.containerId || 'agentation-root'
    el.style.cssText = `position: fixed; top: 0; left: 0; z-index: ${props.zIndex || 2147483647}; pointer-events: none;`
    document.body.appendChild(el)
    setContainer(el)

    // 加载模块
    loadAgentationModule().then(setComponent)

    return () => {
      // 清理容器
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }, [props.containerId, props.zIndex])

  useEffect(() => {
    if (!container || !Component) return

    const root = createRoot(container)

    if (props.visible) {
      root.render(
        <div style={{ pointerEvents: 'auto' }}>
          <Component
            onAnnotationAdd={props.onAnnotationAdd}
            onAnnotationDelete={props.onAnnotationDelete}
            onAnnotationUpdate={props.onAnnotationUpdate}
            onAnnotationsClear={props.onAnnotationsClear}
            onCopy={props.onCopy}
            copyToClipboard={props.copyToClipboard}
          />
        </div>
      )
    } else {
      root.render(null)
    }

    return () => {
      root.unmount()
    }
  }, [container, Component, props.visible, props.onAnnotationAdd, props.onAnnotationDelete, props.onAnnotationUpdate, props.onAnnotationsClear, props.onCopy, props.copyToClipboard])

  return null
}

/**
 * Agentation 通用封装组件
 *
 * 支持两种渲染模式：
 * - inline: 直接在当前位置渲染
 * - portal: 注入到 body 中（适合 content script 场景）
 *
 * @example
 * // Inline 模式
 * <AgentationWrapper mode="inline" visible={true} />
 *
 * @example
 * // Portal 模式
 * <AgentationWrapper
 *   mode="portal"
 *   visible={isVisible}
 *   containerId="my-agentation"
 *   zIndex={2147483647}
 *   onAnnotationAdd={(annotation) => console.log(annotation)}
 * />
 */
export function AgentationWrapper({
  mode = 'inline',
  visible = true,
  containerId = 'agentation-root',
  zIndex = 2147483647,
  ...callbacks
}: AgentationWrapperProps) {
  const props = { visible, zIndex, ...callbacks }

  if (mode === 'portal') {
    return <AgentationPortal containerId={containerId} {...props} />
  }

  return <AgentationInline {...props} />
}

/**
 * 创建独立的 Agentation 实例（非 React 方式）
 *
 * 适用于需要在非 React 环境中使用，或者需要完全控制生命周期的情况
 *
 * @param options 配置选项
 * @returns 控制对象
 *
 * @example
 * const agentation = createAgentationInstance({
 *   containerId: 'my-agentation',
 *   visible: false
 * })
 *
 * // 显示
 * agentation.show()
 *
 * // 隐藏
 * agentation.hide()
 *
 * // 销毁
 * agentation.destroy()
 */
export function createAgentationInstance(options: {
  containerId?: string
  zIndex?: number
  visible?: boolean
  onAnnotationAdd?: (annotation: Annotation) => void
  onAnnotationDelete?: (annotation: Annotation) => void
  onAnnotationUpdate?: (annotation: Annotation) => void
  onAnnotationsClear?: (annotations: Annotation[]) => void
  onCopy?: (markdown: string) => void
  copyToClipboard?: boolean
} = {}) {
  const {
    containerId = 'agentation-root',
    zIndex = 2147483647,
    visible = false,
    ...callbacks
  } = options

  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null
  let currentVisible = visible

  const createContainer = () => {
    if (container) return

    container = document.createElement('div')
    container.id = containerId
    container.style.cssText = `position: fixed; top: 0; left: 0; z-index: ${zIndex}; pointer-events: none;`
    document.body.appendChild(container)
    root = createRoot(container)
  }

  const render = async () => {
    if (!root) return

    const Component = await loadAgentationModule()
    if (!Component) return

    if (currentVisible) {
      root.render(
        <div style={{ pointerEvents: 'auto' }}>
          <Component {...callbacks} />
        </div>
      )
    } else {
      root.render(null)
    }
  }

  return {
    /** 显示 Agentation */
    show: () => {
      currentVisible = true
      createContainer()
      render()
    },

    /** 隐藏 Agentation */
    hide: () => {
      currentVisible = false
      render()
    },

    /** 切换显示状态 */
    toggle: () => {
      if (currentVisible) {
        // hide
        currentVisible = false
      } else {
        // show
        currentVisible = true
        createContainer()
      }
      render()
    },

    /** 获取当前显示状态 */
    isVisible: () => currentVisible,

    /** 销毁实例 */
    destroy: () => {
      if (root) {
        root.unmount()
        root = null
      }
      if (container && container.parentNode) {
        container.parentNode.removeChild(container)
        container = null
      }
    }
  }
}

export type { Annotation }
