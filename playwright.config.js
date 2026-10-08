import { defineConfig } from '@playwright/test';

// The smoke test renders the static site served from public/. A plain static
// server keeps the test independent of the Cloudflare tooling; the production
// headers are checked separately.
export default defineConfig({
  testDir: './test',
  testMatch: /.*\.spec\.js/,
  webServer: {
    command: 'python3 -m http.server 8788 --directory public',
    url: 'http://localhost:8788',
    reuseExistingServer: true,
    timeout: 60000,
  },
  use: { baseURL: 'http://localhost:8788' },
});
