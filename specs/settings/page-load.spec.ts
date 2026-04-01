import { test, expect } from '@playwright/test'
import { injectChromeMock } from '../helpers/chrome-mock'

const OPTIONS_PAGE_URL = '/src/options/index.html'

test.describe('页面加载和初始状态', () => {
  test.beforeEach(async ({ page }) => {
    await injectChromeMock(page)
    await page.goto(OPTIONS_PAGE_URL)
    await page.waitForSelector('h1', { timeout: 10000 })
  })

  test('打开设置页面', async ({ page }) => {
    // 检查页面标题
    const title = page.locator('h1')
    await expect(title).toBeVisible()
    await expect(title).toContainText('TabFlow')

    // 检查版本号
    const footer = page.locator('.options-footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('TabFlow v')

    // 检查所有设置区域已加载
    const sections = page.locator('.options-section')
    await expect(sections).toHaveCount(3)
  })

  test('检查默认设置值', async ({ page }) => {
    // 检查启用搜索面板开关默认开启
    const enableSearchPanelSwitch = page.locator('.setting-item').filter({
      hasText: /Enable Search Panel|启用搜索面板/
    }).locator('button[role="switch"]')
    await expect(enableSearchPanelSwitch).toHaveAttribute('aria-checked', 'true')

    // 检查主题选择器默认为 system
    const themeSelect = page.locator('.setting-item').filter({
      hasText: /Theme|主题/
    }).locator('select')
    await expect(themeSelect).toHaveValue('system')

    // 检查语言选择器默认为 en
    const languageSelect = page.locator('.setting-item').filter({
      hasText: /Language|语言/
    }).locator('select')
    await expect(languageSelect).toHaveValue('en')
  })
})
