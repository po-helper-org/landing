import { defineConfig, devices } from '@playwright/test';

// Тесты идут против собранного Docker-образа с тем же nginx.conf, что на проде (scripts/e2e.mjs поднимает его).
const baseURL = process.env.BASE_URL ?? 'http://localhost:8080';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
