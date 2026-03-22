import { test, expect } from '@playwright/test'
import { injectChromeMock } from '../helpers/chrome-mock'

const OPTIONS_PAGE_URL = '/src/options/index.html'

test.describe('下拉选择功能', () => {
  test.beforeEach(async ({ page }) => {
    await injectChromeMock(page)
    await page.goto(OPTIONS_PAGE_URL)
    await page.waitForSelector('h1', { timeout: 10000 })
  })

  test('切换 URL 显示样式为仅域名', async ({ page }) => {
    const urlSelect = page.locator('.setting-item').filter({
      hasText: /URL Display|URL 显示/
    }).locator('select')

    await urlSelect.selectOption('domain')
    await expect(urlSelect).toHaveValue('domain')
  })

  test('切换 URL 显示样式为完整 URL', async ({ page }) => {
    const urlSelect = page.locator('.setting-item').filter({
      hasText: /URL Display|URL 显示/
    }).locator('select')

    await urlSelect.selectOption('full')
    await expect(urlSelect).toHaveValue('full')
  })

  test('切换 URL 显示样式为不显示', async ({ page }) => {
    const urlSelect = page.locator('.setting-item').filter({
      hasText: /URL Display|URL 显示/
    }).locator('select')

    await urlSelect.selectOption('none')
    await expect(urlSelect).toHaveValue('none')
  })

  test('URL 显示样式循环切换', async ({ page }) => {
    const urlSelect = page.locator('.setting-item').filter({
      hasText: /URL Display|URL 显示/
    }).locator('select')

    await urlSelect.selectOption('domain')
    await expect(urlSelect).toHaveValue('domain')

    await urlSelect.selectOption('full')
    await expect(urlSelect).toHaveValue('full')

    await urlSelect.selectOption('none')
    await expect(urlSelect).toHaveValue('none')
  })
})
