import { test, expect } from '@playwright/test'
import { injectChromeMock } from '../helpers/chrome-mock'

const OPTIONS_PAGE_URL = '/src/options/index.html'

test.describe('语言切换功能', () => {
  test.beforeEach(async ({ page }) => {
    await injectChromeMock(page)
    await page.goto(OPTIONS_PAGE_URL)
    await page.waitForSelector('h1', { timeout: 10000 })
  })

  test('切换语言为中文', async ({ page }) => {
    const languageSelect = page.locator('.setting-item').filter({
      hasText: /Language|语言/
    }).locator('select')

    await languageSelect.selectOption('zh')
    await expect(languageSelect).toHaveValue('zh')

    const title = page.locator('h1')
    await expect(title).toContainText('TabFlow 设置')
  })

  test('切换语言为英文', async ({ page }) => {
    const languageSelect = page.locator('.setting-item').filter({
      hasText: /Language|语言/
    }).locator('select')

    // 先切换到中文
    await languageSelect.selectOption('zh')
    await page.waitForTimeout(100)

    // 再切换回英文
    await languageSelect.selectOption('en')
    await expect(languageSelect).toHaveValue('en')

    const title = page.locator('h1')
    await expect(title).toContainText('TabFlow Settings')
  })
})
