import { test, expect } from '@playwright/test'
import { injectChromeMock, getMockStorage } from '../helpers/chrome-mock'

const OPTIONS_PAGE_URL = '/src/options/index.html'

test.describe('设置持久化', () => {
  test.beforeEach(async ({ page }) => {
    await injectChromeMock(page)
    await page.goto(OPTIONS_PAGE_URL)
    await page.waitForSelector('h1', { timeout: 10000 })
  })

  test('修改多个设置项并验证保存', async ({ page }) => {
    // 修改主题
    const themeSelect = page.locator('.setting-item').filter({
      hasText: /Theme|主题/
    }).locator('select')
    await themeSelect.selectOption('dark')

    // 修改语言
    const languageSelect = page.locator('.setting-item').filter({
      hasText: /Language|语言/
    }).locator('select')
    await languageSelect.selectOption('zh')

    // 修改开关
    const enableSearchPanelSwitch = page.locator('.setting-item').filter({
      hasText: /Enable Search Panel|启用搜索面板/
    }).locator('button[role="switch"]')
    await enableSearchPanelSwitch.click()

    // 等待保存
    await page.waitForTimeout(500)

    // 验证 mock storage 中的数据
    const storage = await getMockStorage(page)
    expect(storage.theme).toBe('dark')
    expect(storage.language).toBe('zh')
    expect(storage.enableSearchPanel).toBe(false)
  })

  test('主题设置保存', async ({ page }) => {
    const themeSelect = page.locator('.setting-item').filter({
      hasText: /Theme|主题/
    }).locator('select')

    await themeSelect.selectOption('light')
    await page.waitForTimeout(300)

    const storage = await getMockStorage(page)
    expect(storage.theme).toBe('light')
  })

  test('语言设置保存', async ({ page }) => {
    const languageSelect = page.locator('.setting-item').filter({
      hasText: /Language|语言/
    }).locator('select')

    await languageSelect.selectOption('zh')
    await page.waitForTimeout(300)

    const storage = await getMockStorage(page)
    expect(storage.language).toBe('zh')
  })

  test('开关状态保存', async ({ page }) => {
    const searchCurrentWindowSwitch = page.locator('.setting-item').filter({
      hasText: /Search Current Window|仅搜索当前窗口/
    }).locator('button[role="switch"]')

    await searchCurrentWindowSwitch.click()
    await page.waitForTimeout(300)

    const storage = await getMockStorage(page)
    expect(storage.searchCurrentWindow).toBe(true)
  })
})
