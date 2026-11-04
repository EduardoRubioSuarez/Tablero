import { expect, test } from '@playwright/test'

test('la página principal muestra el título', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tablero' })).toBeVisible()
})
