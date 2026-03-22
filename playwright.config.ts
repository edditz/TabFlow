import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        baseURL: 'http://localhost:4173',
      },
    },
  ],
  webServer: {
    command: 'npx vite preview --port 4173',
    url: 'http://localhost:4173/src/options/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
})
