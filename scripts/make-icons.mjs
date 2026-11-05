// Genera los íconos PNG de la app a partir de public/icon.svg.
// Uso: npm run icons (requiere Chromium de Playwright; ya viene con el proyecto).
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'icon.svg'), 'utf8')

const targets = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  // El dibujo ya deja margen de seguridad, así que el mismo sirve como ícono "maskable".
  ['maskable-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]

const browser = await chromium.launch()
try {
  for (const [name, size] of targets) {
    const page = await browser.newPage({ viewport: { width: size, height: size } })
    await page.setContent(
      `<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
    )
    const png = await page.screenshot({ type: 'png' })
    writeFileSync(join(root, 'public', name), png)
    await page.close()
    console.log('listo', name)
  }
} finally {
  await browser.close()
}
copyFileSync(join(root, 'public', 'icon.svg'), join(root, 'public', 'favicon.svg'))
console.log('listo favicon.svg')
