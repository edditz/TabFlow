import { useState, useEffect, useCallback } from 'react'
import type { TabGroup } from '../types'

function buildGroups(tabs: chrome.tabs.Tab[], groups: chrome.tabGroups.TabGroup[]): TabGroup[] {
  const groupMap = new Map<number, TabGroup>()

  for (const group of groups) {
    groupMap.set(group.id, {
      id: group.id,
      title: group.title || 'Unnamed',
      color: group.color,
      collapsed: group.collapsed,
      tabs: []
    })
  }

  const ungroupedTabs: chrome.tabs.Tab[] = []

  for (const tab of tabs) {
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE && groupMap.has(tab.groupId)) {
      groupMap.get(tab.groupId)!.tabs.push(tab)
    } else if (tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE) {
      ungroupedTabs.push(tab)
    }
  }

  const result = Array.from(groupMap.values())

  if (ungroupedTabs.length > 0) {
    result.push({
      id: chrome.tabGroups.TAB_GROUP_ID_NONE,
      title: '',
      color: 'grey',
      collapsed: false,
      tabs: ungroupedTabs
    })
  }

  return result
}

export function useTabGroups(tabs: chrome.tabs.Tab[]) {
  const [groups, setGroups] = useState<TabGroup[]>([])

  const refreshGroups = useCallback(() => {
    chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, tabGroups => {
      setGroups(buildGroups(tabs, tabGroups))
    })
  }, [tabs])

  useEffect(() => {
    refreshGroups()

    chrome.tabGroups.onCreated.addListener(refreshGroups)
    chrome.tabGroups.onUpdated.addListener(refreshGroups)
    chrome.tabGroups.onRemoved.addListener(refreshGroups)

    return () => {
      chrome.tabGroups.onCreated.removeListener(refreshGroups)
      chrome.tabGroups.onUpdated.removeListener(refreshGroups)
      chrome.tabGroups.onRemoved.removeListener(refreshGroups)
    }
  }, [refreshGroups])

  const createGroup = useCallback(async (tabIds: number[], title: string, color: chrome.tabGroups.ColorEnum) => {
    const groupId = await chrome.tabs.group({ tabIds })
    await chrome.tabGroups.update(groupId, { title, color })
  }, [])

  const renameGroup = useCallback((groupId: number, title: string) => {
    chrome.tabGroups.update(groupId, { title })
  }, [])

  const changeGroupColor = useCallback((groupId: number, color: chrome.tabGroups.ColorEnum) => {
    chrome.tabGroups.update(groupId, { color })
  }, [])

  const ungroupTabs = useCallback((tabIds: number[]) => {
    chrome.tabs.ungroup(tabIds)
  }, [])

  const moveTabToGroup = useCallback(async (tabId: number, groupId: number) => {
    if (groupId === chrome.tabGroups.TAB_GROUP_ID_NONE) {
      const tab = await chrome.tabs.get(tabId)
      if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
        chrome.tabs.ungroup([tabId])
      }
    } else {
      await chrome.tabs.group({ tabIds: [tabId], groupId })
    }
  }, [])

  const closeGroupTabs = useCallback((groupTabs: chrome.tabs.Tab[]) => {
    const tabIds = groupTabs.map(tab => tab.id).filter((id): id is number => id !== undefined)
    chrome.tabs.remove(tabIds)
  }, [])

  return {
    groups,
    createGroup,
    renameGroup,
    changeGroupColor,
    ungroupTabs,
    moveTabToGroup,
    closeGroupTabs
  }
}
