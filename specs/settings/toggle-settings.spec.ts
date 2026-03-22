import { test, expect } from '@playwright/test'
import { injectChromeMock } from '../helpers/chrome-mock'

const OPTIONS_PAGE_URL = '/src/options/index.html'

test.describe('开关设置功能', () => {
  test.beforeEach(async ({ page }) => {
    await injectChromeMock(page)
    await page.goto(OPTIONS_PAGE_URL)
    await page.waitForSelector('h1', { timeout: 10000 })
  })

  test('关闭启用搜索面板开关', async ({ page }) => {
    const switchButton = page.locator('.setting-item').filter({
      hasText: /Enable Search Panel|启用搜索面板/
    }).locator('button[role="switch"]')

    await expect(switchButton).toHaveAttribute('aria-checked', 'true')
    await switchButton.click()
    await expect(switchButton).toHaveAttribute('aria-checked', 'false')

    // 检查保存提示
    const saveIndicator = page.locator('.save-indicator')
    await expect(saveIndicator).toHaveClass(/show/)
  })

  test('打开显示标签页数量开关', async ({ page }) => {
    const switchButton = page.locator('.setting-item').filter({
      hasText: /Show Tab Count|显示标签页数量/
    }).locator('button[role="switch"]')

    await expect(switchButton).toHaveAttribute('aria-checked', 'false')
    await switchButton.click()
    await expect(switchButton).toHaveAttribute('aria-checked', 'true')
  })

  test('关闭仅搜索当前窗口开关', async ({ page }) => {
    const switchButton = page.locator('.setting-item').filter({
      hasText: /Search Current Window|仅搜索当前窗口/
    }).locator('button[role="switch"]')

    await expect(switchButton).toHaveAttribute('aria-checked', 'false')
    await switchButton.click()
    await expect(switchButton).toHaveAttribute('aria-checked', 'true')
    await switchButton.click()
    await expect(switchButton).toHaveAttribute('aria-checked', 'false')
  })
})
