import { expect, test, type Page } from '@playwright/test'

/** Guarda en la página cada violación de la política de seguridad de contenido. */
async function watchPolicyViolations(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] }
    w.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__csp.push(`${e.violatedDirective}: ${e.blockedURI}`)
    })
  })
}
const violations = (page: Page) =>
  page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)

test.describe('seguridad (hito 5.9)', () => {
  test('la página trae las cabeceras de seguridad', async ({ request }) => {
    const response = await request.get('/')
    const h = response.headers()
    const csp = h['content-security-policy']
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).not.toContain('unsafe-eval')
    expect(csp).not.toContain('unsafe-inline')
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['referrer-policy']).toBe('no-referrer')
    expect(h['permissions-policy']).toContain('camera=()')
    expect(h['x-frame-options']).toBe('DENY')
  })

  test('toda la app funciona bajo esa política, sin una sola violación', async ({ page }) => {
    test.setTimeout(90_000)
    await watchPolicyViolations(page)
    const consoleErrors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
    })
    page.on('pageerror', (e) => consoleErrors.push(e.message))

    await page.goto('/?seed=7')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    for (const name of ['Reglas', 'Aviso y privacidad', 'Comparte el juego']) {
      await page.getByRole('button', { name }).click()
      await page.getByRole('button', { name: 'Cerrar' }).click()
    }
    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await page.getByLabel('Nombre del jugador 1', { exact: true }).fill('Ana')
    await page.getByLabel('Nombre del jugador 2', { exact: true }).fill('Beto')
    await page.getByRole('button', { name: 'Empezar partida' }).click()
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: 'Tirar dado' }).click()
      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      let guard = 0
      while (
        (await page.getByRole('button', { name: 'Tirar dado' }).count()) === 0 &&
        guard++ < 5
      ) {
        await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      }
    }
    await page.getByRole('button', { name: 'Mapa' }).click()
    await page.getByRole('button', { name: 'Vista vertical' }).click()
    await page.getByRole('button', { name: 'Cerrar' }).click()
    await page.getByRole('button', { name: 'Ayuda' }).click()
    await page.getByRole('button', { name: 'Cerrar' }).click()
    await page.getByRole('button', { name: 'Jugadores' }).click()
    await page.getByRole('button', { name: 'Cerrar' }).click()

    expect(await violations(page)).toEqual([])
    expect(consoleErrors).toEqual([])
  })

  test('los nombres con código o HTML se muestran como texto, sin ejecutarse', async ({ page }) => {
    await watchPolicyViolations(page)
    const dialogs: string[] = []
    page.on('dialog', async (d) => {
      dialogs.push(d.message())
      await d.dismiss()
    })
    const first = '<img src=x onerror=alert(1)>'
    const second = '<script>alert(2)</script>'
    await page.goto('/?seed=7')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await page.getByLabel('Nombre del jugador 1', { exact: true }).fill(first)
    await page.getByLabel('Nombre del jugador 2', { exact: true }).fill(second)
    await page.getByRole('button', { name: 'Empezar partida' }).click()
    const name = await page.getByRole('heading', { level: 1 }).textContent()
    expect([first, second]).toContain(name)
    await expect(page.locator('img[src="x"]')).toHaveCount(0)
    expect(dialogs).toEqual([])
    expect(await violations(page)).toEqual([])
  })

  test('un guardado manipulado se descarta sin romper la app', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem(
        'tablero:partida:v1',
        '{"version":1,"players":[{"name":"<b>x</b>","position":"999"}]}',
      )
      localStorage.setItem('tablero:ajustes:v1', '{"sound":{"a":1},"vibration":"x"}')
    })
    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible()
    await expect(page.getByText(/estaba dañada/)).toBeVisible()
  })

  test('una semilla rara en la dirección se ignora', async ({ page }) => {
    for (const seed of ['abc', '-1', '1e9', '99999999999999', '<script>']) {
      await page.goto(`/?seed=${encodeURIComponent(seed)}`)
      await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
      await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible()
    }
  })
})
