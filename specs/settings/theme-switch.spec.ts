import { test, expect } from '@playwright/test'
import { injectChromeMock } from '../helpers/chrome-mock'

const OPTIONS_PAGE_URL = '/src/options/index.html'

test.describe('主题切换功能', () => {
  test.beforeEach(async ({ page }) => {
    await injectChromeMock(page)
    await page.goto(OPTIONS_PAGE_URL)
    await page.waitForSelector('h1', { timeout: 10000 })
  })

  test('切换主题为浅色模式', async ({ page }) => {
    const themeSelect = page.locator('.setting-item').filter({
      hasText: /Theme|主题/
    }).locator('select')

    await themeSelect.selectOption('light')
    await expect(themeSelect).toHaveValue('light')

    const htmlElement = page.locator('html')
    await expect(htmlElement).toHaveAttribute('data-theme', 'light')
  })

  test('切换主题为深色模式', async ({ page }) => {
    const themeSelect = page.locator('.setting-item').filter({
      hasText: /Theme|主题/
    }).locator('select')

    await themeSelect.selectOption('dark')
    await expect(themeSelect).toHaveValue('dark')

    const htmlElement = page.locator('html')
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark')
  })

  test('切换主题为跟随系统', async ({ page }) => {
    const themeSelect = page.locator('.setting-item').filter({
      hasText: /Theme|主题/
    }).locator('select')

    await themeSelect.selectOption('system')
    await expect(themeSelect).toHaveValue('system')
  })
})
