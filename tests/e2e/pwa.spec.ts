import { expect, test, type Page } from '@playwright/test'

// Estas pruebas necesitan el service worker real.
test.use({ serviceWorkers: 'allow' })

async function startGame(page: Page, names: string[], seed = 7) {
  await page.goto(`/?seed=${seed}`)
  await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
  await page.getByRole('button', { name: 'Nueva partida' }).click()
  while ((await page.getByLabel(/^Nombre del jugador/).count()) < names.length) {
    await page.getByRole('button', { name: 'Agregar jugador' }).click()
  }
  for (const [i, name] of names.entries()) {
    await page.getByLabel(`Nombre del jugador ${i + 1}`, { exact: true }).fill(name)
  }
  await page.getByRole('button', { name: 'Empezar partida' }).click()
}

/** Espera a que el service worker esté activo y controlando la página. */
async function waitForServiceWorker(page: Page) {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    if (!registration.active) throw new Error('el service worker no está activo')
  })
  // Recarga para que la página quede controlada por el service worker.
  await page.reload()
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true)
}

test.describe('manifest e instalación (hito 5.1)', () => {
  test('el manifest tiene nombre, colores, modo app e íconos que existen', async ({
    page,
    request,
  }) => {
    await page.goto('/')
    const href = await page.locator('link[rel="manifest"]').getAttribute('href')
    expect(href).toBeTruthy()
    const response = await request.get(href!)
    expect(response.ok()).toBe(true)
    const manifest = await response.json()

    expect(manifest.name).toBe('Tablero')
    expect(manifest.short_name).toBe('Tablero')
    expect(manifest.display).toBe('standalone')
    expect(manifest.orientation).toBe('portrait')
    expect(manifest.lang).toBe('es')
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i)
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i)

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
    for (const icon of manifest.icons as Array<{ src: string }>) {
      const png = await request.get(new URL(icon.src, page.url()).toString())
      expect(png.ok(), icon.src).toBe(true)
      expect(png.headers()['content-type']).toContain('image/png')
    }
  })

  test('la página trae el ícono de iPhone y los datos para abrirse como app', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1)
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      'content',
      'yes',
    )
  })
})

test.describe('guía de instalación (hito 5.3)', () => {
  test('aparece en el inicio, se puede descartar y no vuelve', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    const guide = page.getByRole('region', { name: /^Instala Tablero/ })
    await expect(guide).toBeVisible()
    await page.getByRole('button', { name: 'No mostrar más' }).click()
    await expect(guide).toHaveCount(0)

    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible()
    await expect(page.getByRole('region', { name: /^Instala Tablero/ })).toHaveCount(0)
  })

  test('es una barra pequeña que no mueve el resto del inicio y abre los pasos si se piden', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    const newGame = page.getByRole('button', { name: 'Nueva partida' })
    const guide = page.getByRole('region', { name: /^Instala Tablero/ })
    await expect(guide).toBeVisible()
    const withGuide = (await newGame.boundingBox())!.y
    expect((await guide.boundingBox())!.height).toBeLessThan(90)

    // Los pasos se abren y se cierran sin mover nada más.
    const how = guide.getByRole('button', { name: /Ver cómo|Instalar/ })
    if ((await how.textContent())?.includes('Ver cómo')) {
      await how.click()
      await expect(guide.getByRole('listitem').first()).toBeVisible()
      expect((await newGame.boundingBox())!.y).toBe(withGuide)
    }

    await page.getByRole('button', { name: 'No mostrar más' }).click()
    expect((await newGame.boundingBox())!.y).toBe(withGuide)
  })

  test('no aparece cuando la app ya se abrió como app instalada', async ({ page }) => {
    await page.addInitScript(() => {
      const original = window.matchMedia.bind(window)
      window.matchMedia = (query: string) =>
        query.includes('display-mode: standalone')
          ? ({ ...original(query), matches: true } as MediaQueryList)
          : original(query)
      Object.defineProperty(navigator, 'standalone', { configurable: true, value: true })
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible()
    await expect(page.getByRole('region', { name: /^Instala Tablero/ })).toHaveCount(0)
  })
})

test.describe('sin conexión (hitos 5.2 y 5.8)', () => {
  test('después de la primera carga la app abre y se juega sin red', async ({ page, context }) => {
    test.setTimeout(90_000)
    await page.goto('/')
    await waitForServiceWorker(page)

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByText('Solo para mayores de 18 años')).toBeVisible()

    // Se juega una partida completa de varios turnos sin red.
    await startGame(page, ['Ana', 'Beto', 'Carla'])
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: 'Tirar dado' }).click()
      await expect(page.getByRole('region', { name: /^Tarjeta de la casilla/ })).toBeVisible()
      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      let guard = 0
      while (
        (await page.getByRole('button', { name: 'Tirar dado' }).count()) === 0 &&
        guard++ < 5
      ) {
        await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      }
    }

    // El mapa, la ayuda y el guardado también funcionan sin red.
    await page.getByRole('button', { name: 'Mapa' }).click()
    await expect(page.getByRole('dialog', { name: 'Mapa' }).locator('[data-position]')).toHaveCount(
      60,
    )
    await page.getByRole('button', { name: 'Cerrar' }).click()
    await page.getByRole('button', { name: 'Ayuda' }).click()
    await expect(page.getByRole('dialog', { name: 'Ayuda' })).toBeVisible()
    await page.getByRole('button', { name: 'Cerrar' }).click()

    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByText('Tienes una partida sin terminar')).toBeVisible()
    await page.getByRole('button', { name: 'Continuar partida' }).click()
    await expect(page.getByRole('button', { name: 'Tirar dado' })).toBeVisible()
  })

  test('las fuentes y los íconos también quedan guardados', async ({ page, context }) => {
    await page.goto('/')
    await waitForServiceWorker(page)
    await context.setOffline(true)
    const failed: string[] = []
    page.on('requestfailed', (r) => failed.push(r.url()))
    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(failed).toEqual([])
  })
})

test.describe('privacidad (hito 5.9, parte automática)', () => {
  test('una partida completa no hace ninguna petición fuera de la propia app', async ({ page }) => {
    const origin = new URL(page.url() === 'about:blank' ? 'http://localhost:4173' : page.url())
      .origin
    const outside: string[] = []
    page.on('request', (request) => {
      const url = new URL(request.url())
      if (url.origin !== origin && !['data:', 'blob:', 'about:'].includes(url.protocol)) {
        outside.push(request.url())
      }
    })
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await page.getByRole('button', { name: 'Mapa' }).click()
    await page.getByRole('button', { name: 'Cerrar' }).click()
    expect(outside).toEqual([])
  })
})
