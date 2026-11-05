import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/** Revisa la pantalla actual con axe-core: no debe haber errores de ningún nivel. */
async function expectAccessible(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()
  const summary = results.violations.map((v) => ({
    pantalla: label,
    regla: v.id,
    impacto: v.impact,
    elementos: v.nodes
      .slice(0, 3)
      .map((n) => n.target.join(' ') + ' → ' + (n.failureSummary ?? '').split('\n')[1]),
  }))
  expect(summary, `Problemas de accesibilidad en ${label}`).toEqual([])
}

async function startGame(page: Page, names: string[], seed = 7, laps = 1) {
  await page.goto(`/?seed=${seed}`)
  await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
  await page.getByRole('button', { name: 'Nueva partida' }).click()
  while ((await page.getByLabel(/^Nombre del jugador/).count()) < names.length) {
    await page.getByRole('button', { name: 'Agregar jugador' }).click()
  }
  for (const [i, name] of names.entries()) {
    await page.getByLabel(`Nombre del jugador ${i + 1}`, { exact: true }).fill(name)
  }
  for (let i = 1; i < laps; i++) await page.getByRole('button', { name: 'Más vueltas' }).click()
  await page.getByRole('button', { name: 'Empezar partida' }).click()
}

test.describe('accesibilidad con axe-core (hito 5.5)', () => {
  test('advertencia, inicio y reglas', async ({ page }) => {
    await page.goto('/')
    await expectAccessible(page, 'advertencia +18')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expectAccessible(page, 'inicio')
    await page.getByRole('button', { name: 'Reglas' }).click()
    await expectAccessible(page, 'reglamento')
  })

  test('acceso no permitido', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Soy menor de edad' }).click()
    await expectAccessible(page, 'acceso no permitido')
  })

  test('configurar partida', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await expectAccessible(page, 'configurar (vacía)')
    await page.getByLabel('Nombre del jugador 1').fill('Ana')
    await page.getByLabel('Nombre del jugador 2').fill('Beto')
    await expectAccessible(page, 'configurar (con jugadores)')
    await page.getByLabel('Nombre del jugador 2').fill('ana')
    await expectAccessible(page, 'configurar (con error)')
  })

  test('turno, tarjeta, ayuda, jugadores y mapa', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto', 'Carla'])
    await expectAccessible(page, 'turno')
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    await expectAccessible(page, 'tarjeta')

    await page.getByRole('button', { name: 'Ayuda' }).click()
    await expectAccessible(page, 'ayuda')
    await page.getByRole('button', { name: 'Cerrar' }).click()

    await page.getByRole('button', { name: 'Jugadores' }).click()
    await expectAccessible(page, 'jugadores')
    await page.getByRole('button', { name: 'Terminar partida' }).click()
    await expectAccessible(page, 'jugadores (confirmar fin)')
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await page.getByRole('button', { name: 'Cerrar' }).click()

    await page.getByRole('button', { name: 'Mapa' }).click()
    await expectAccessible(page, 'mapa')
    await page.getByRole('button', { name: 'Vista vertical' }).click()
    await expectAccessible(page, 'mapa (ver todo)')
  })

  test('resultados', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Jugadores' }).click()
    await page.getByRole('button', { name: 'Terminar partida' }).click()
    await page.getByRole('button', { name: 'Sí, terminar' }).click()
    await expect(page.getByText('La partida terminó')).toBeVisible()
    await expectAccessible(page, 'resultados')
  })

  test('la tarjeta de una acción larga y la de un retroceso', async ({ page }) => {
    test.setTimeout(240_000)
    await startGame(page, ['Ana', 'Beto'], 1, 3)
    let seenLong = false
    let seenMove = false
    for (let i = 0; i < 300 && !(seenLong && seenMove); i++) {
      const card = page.getByRole('region', { name: /^Tarjeta de la casilla/ })
      if ((await card.count()) > 0) {
        const text = (await card.textContent()) ?? ''
        if (!seenLong && text.length > 80) {
          seenLong = true
          await expectAccessible(page, 'tarjeta larga')
        }
        if (!seenMove && /RETROCEDE|VUELVE A LA SALIDA/.test(text)) {
          seenMove = true
          await expectAccessible(page, 'tarjeta de movimiento')
        }
        await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      } else {
        await page.getByRole('button', { name: 'Tirar dado' }).click()
      }
    }
    expect(seenLong || seenMove).toBe(true)
  })
})
