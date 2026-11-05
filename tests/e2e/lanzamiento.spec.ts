import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('aviso y privacidad (hito 6.2)', () => {
  test('se abre desde el inicio, dice lo esencial y no tiene problemas de accesibilidad', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Aviso y privacidad' }).click()
    const dialog = page.getByRole('dialog', { name: 'Aviso y privacidad' })
    await expect(
      dialog.getByText('Solo para mayores de 18', { exact: false }).first(),
    ).toBeVisible()
    await expect(dialog.getByText(/No hay cuentas, anuncios ni análisis de uso/)).toBeVisible()
    await expect(dialog.getByText(/Cómo borrar tus datos/)).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])

    await dialog.getByRole('button', { name: 'Cerrar' }).click()
    await expect(dialog).toHaveCount(0)
  })

  test('no está disponible dentro de la partida', async ({ page }) => {
    await page.goto('/?seed=7')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await page.getByLabel('Nombre del jugador 1', { exact: true }).fill('Ana')
    await page.getByLabel('Nombre del jugador 2', { exact: true }).fill('Beto')
    await page.getByRole('button', { name: 'Empezar partida' }).click()
    await expect(page.getByRole('button', { name: 'Aviso y privacidad' })).toHaveCount(0)
  })
})

test.describe('comparte el juego (hito 6.4)', () => {
  test('muestra el QR y el enlace del propio sitio, sin problemas de accesibilidad', async ({
    page,
    baseURL,
  }) => {
    await page.goto('/?seed=7')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Comparte el juego' }).click()
    const dialog = page.getByRole('dialog', { name: 'Comparte el juego' })
    await expect(dialog.getByRole('img', { name: /Código QR/ })).toBeVisible()
    // El enlace es el del sitio, sin parámetros como ?seed.
    await expect(dialog.getByText(`${baseURL}/`, { exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Copiar enlace|Enlace copiado/ })).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])

    await dialog.getByRole('button', { name: 'Cerrar' }).click()
    await expect(dialog).toHaveCount(0)
  })

  test('el QR dibuja módulos oscuros y no está dentro de la partida', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Comparte el juego' }).click()
    const d = await page
      .getByRole('img', { name: /Código QR/ })
      .locator('path')
      .getAttribute('d')
    expect((d ?? '').length).toBeGreaterThan(500)
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await page.getByLabel('Nombre del jugador 1', { exact: true }).fill('Ana')
    await page.getByLabel('Nombre del jugador 2', { exact: true }).fill('Beto')
    await page.getByRole('button', { name: 'Empezar partida' }).click()
    await expect(page.getByRole('button', { name: 'Comparte el juego' })).toHaveCount(0)
  })
})
