import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // WebKit con el mapa y el dado en 3D gasta bastante memoria: con muchos procesos a la vez se cierra solo.
  workers: 3,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    // Las animaciones (dado, confeti, cámara) se apagan para que las partidas automáticas sean rápidas.
    // Las pruebas de animación la vuelven a activar con page.emulateMedia.
    reducedMotion: 'reduce',
    // El service worker solo se activa en pwa.spec.ts, para que las demás pruebas no dependan de la caché.
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 14'] } },
    { name: 'pixel', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
