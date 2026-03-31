const { devices } = require('@playwright/test');

module.exports = {
  webServer: {
    // serve repository root so `example/` can reference `../dist/` correctly
    command: 'npx http-server . -p 4173 -c-1',
    url: 'http://127.0.0.1:4173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  },
  testDir: 'playwright',
  retries: process.env.CI ? 2 : 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    navigationTimeout: 30000
  }
};
