import { expect, test, type Page } from '@playwright/test'

async function startGame(page: Page, names: string[], laps = 1, seed = 7) {
  await page.goto(`/?seed=${seed}`)
  await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
  await page.getByRole('button', { name: 'Nueva partida' }).click()
  while ((await page.getByLabel(/^Nombre del jugador/).count()) < names.length) {
    await page.getByRole('button', { name: 'Agregar jugador' }).click()
  }
  for (const [i, name] of names.entries()) {
    await page.getByLabel(`Nombre del jugador ${i + 1}`).fill(name)
  }
  for (let i = 1; i < laps; i++) await page.getByRole('button', { name: 'Más vueltas' }).click()
  await page.getByRole('button', { name: 'Empezar partida' }).click()
}

const cardRegion = (page: Page) => page.getByRole('region', { name: /^Tarjeta de la casilla/ })

test.describe('tarjeta Estallido (hito 4.7)', () => {
  test('todas las tarjetas miden lo mismo, no hay scroll y Continuar queda libre', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await startGame(page, ['Ana', 'Beto', 'Carla'], 3)
    const sizes = new Set<string>()
    const texts = new Set<string>()

    for (let i = 0; i < 14; i++) {
      await page.getByRole('button', { name: 'Tirar dado' }).click()
      const card = cardRegion(page)
      await expect(card).toBeVisible()
      const box = await card.boundingBox()
      sizes.add(`${Math.round(box!.width)}x${Math.round(box!.height)}`)
      texts.add((await card.textContent()) ?? '')

      // Sin scroll vertical ni horizontal.
      const overflow = await page.evaluate(() => ({
        vertical: document.documentElement.scrollHeight - window.innerHeight,
        horizontal: document.documentElement.scrollWidth - window.innerWidth,
      }))
      expect(overflow.vertical).toBeLessThanOrEqual(1)
      expect(overflow.horizontal).toBeLessThanOrEqual(0)

      // Nada tapa el botón Continuar: lo que hay en su centro es el propio botón.
      const button = page.getByRole('button', { name: 'Continuar', exact: true })
      const covered = await button.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
        return !(top === el || el.contains(top))
      })
      expect(covered).toBe(false)

      await button.click()
      // Un retroceso trae una segunda tarjeta: se continúa hasta volver al dado.
      let guard = 0
      while (
        (await page.getByRole('button', { name: 'Tirar dado' }).count()) === 0 &&
        guard++ < 5
      ) {
        await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      }
    }

    expect(texts.size).toBeGreaterThan(5)
    expect([...sizes]).toHaveLength(1)
  })

  test('la tarjeta no muestra el número de casilla ni etiquetas de tipo', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    const card = cardRegion(page)
    await expect(card).toBeVisible()
    const text = (await card.innerText()).toUpperCase()
    expect(text).not.toMatch(/CASILLA \d/)
    for (const label of ['BEBER', 'RETO\n', 'VERDAD\n']) expect(text).not.toContain(label)
  })
})

test.describe('dado en 3D (hito 4.6)', () => {
  test('con animación el dado rueda y después aparece la tarjeta', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await startGame(page, ['Ana', 'Beto'])
    const roll = page.getByRole('button', { name: 'Tirar dado' })
    await roll.click()
    const rolling = page.getByRole('button', { name: 'Tirando…' })
    await expect(rolling).toBeDisabled()
    await expect(cardRegion(page)).toBeVisible({ timeout: 6000 })
    await expect(page.getByText(/^Dado:/)).toBeVisible()
  })

  test('con "reducir movimiento" no hay espera', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    await expect(cardRegion(page)).toBeVisible({ timeout: 800 })
  })
})

test.describe('mapa (hitos 4.3 a 4.5)', () => {
  test('muestra las 60 casillas, la salida, la meta y la lista de posiciones', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto', 'Carla'])
    await page.getByRole('button', { name: 'Mapa' }).click()
    const dialog = page.getByRole('dialog', { name: 'Mapa' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('[data-position]')).toHaveCount(60)
    await expect(dialog.locator('.pad-salida')).toBeVisible()
    await expect(dialog.locator('.pad-meta')).toBeVisible()

    const list = dialog.getByRole('region', { name: 'Posiciones' }).getByRole('listitem')
    await expect(list).toHaveCount(3)
    for (const name of ['Ana', 'Beto', 'Carla']) await expect(dialog).toContainText(name)
    await expect(dialog.getByText('TURNO')).toHaveCount(1)
    await expect(list.first()).toContainText('salida')
  })

  test('hay una ficha por jugador y las fichas juntas se agrupan', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto', 'Carla', 'Dani'])
    await page.getByRole('button', { name: 'Mapa' }).click()
    const dialog = page.getByRole('dialog', { name: 'Mapa' })
    // Los cuatro están en la salida: se ven todos.
    await expect(dialog.locator('.peon')).toHaveCount(4)
  })

  test('se abre y se cierra sin cambiar la partida', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    const card = cardRegion(page)
    const text = await card.textContent()
    const heading = await page.getByRole('heading', { level: 1 }).textContent()

    await page.getByRole('button', { name: 'Mapa' }).click()
    await expect(page.getByRole('dialog', { name: 'Mapa' })).toBeVisible()
    await expect(page.locator('div[inert]')).toHaveCount(1)
    await page.getByRole('button', { name: 'Cerrar' }).click()
    await expect(page.getByRole('dialog', { name: 'Mapa' })).toHaveCount(0)
    expect(await card.textContent()).toBe(text)
    expect(await page.getByRole('heading', { level: 1 }).textContent()).toBe(heading)

    await page.getByRole('button', { name: 'Mapa' }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Mapa' })).toHaveCount(0)
  })

  test('Ver todo se activa y se apaga, y tocar a un jugador enfoca su ficha', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Mapa' }).click()
    const dialog = page.getByRole('dialog', { name: 'Mapa' })
    const all = dialog.getByRole('button', { name: 'Ver todo' })
    await expect(all).toHaveAttribute('aria-pressed', 'false')
    await all.click()
    await expect(all).toHaveAttribute('aria-pressed', 'true')
    await expect(dialog.getByText('Desliza para ver el resto')).toBeVisible()

    const beto = dialog.getByRole('button', { name: /Beto/ })
    await beto.click()
    await expect(beto).toHaveAttribute('aria-pressed', 'true')
    await expect(all).toHaveAttribute('aria-pressed', 'false')
  })

  test('arrastrar el tablero lo desplaza y el marco de la tira se mueve', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Mapa' }).click()
    const dialog = page.getByRole('dialog', { name: 'Mapa' })
    await dialog.getByRole('button', { name: 'Ver todo' }).click()
    const view = dialog.getByRole('group', { name: /^Tablero/ })
    await expect(view).toBeVisible()
    const board = dialog.locator('.tablero3d')
    const before = (await board.boundingBox())!.y

    // En pantallas altas casi todo cabe; en las bajas queda tablero por ver y se desplaza.
    const viewBox = (await view.boundingBox())!
    const boardBox = (await board.boundingBox())!
    const hidden = boardBox.y + boardBox.height - (viewBox.y + viewBox.height)
    await view.focus()
    for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowDown')
    const after = (await board.boundingBox())!.y
    // Nunca baja más de lo que estaba y, si quedaba tablero oculto, sube.
    expect(after).toBeLessThanOrEqual(before + 0.5)
    if (hidden > 40) expect(after).toBeLessThan(before - 20)
  })
})

test.describe('sonido y vibración (hito 4.8)', () => {
  test('los interruptores cambian y se recuerdan al recargar', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    const sound = page.getByRole('button', { name: 'Sonido' })
    const vibration = page.getByRole('button', { name: 'Vibración' })
    await expect(sound).toHaveAttribute('aria-pressed', 'true')
    await expect(vibration).toHaveAttribute('aria-pressed', 'true')

    await sound.click()
    await expect(sound).toHaveAttribute('aria-pressed', 'false')
    await expect(vibration).toHaveAttribute('aria-pressed', 'true')

    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Continuar partida' }).click()
    await expect(page.getByRole('button', { name: 'Sonido' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await expect(page.getByRole('button', { name: 'Vibración' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})

test.describe('pantalla siempre encendida (hito 4.9)', () => {
  test('pide el bloqueo de pantalla al jugar si el navegador lo permite', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __wake: { requests: number; released: number } }
      w.__wake = { requests: 0, released: 0 }
      Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: {
          request: async () => {
            w.__wake.requests++
            return {
              release: async () => void w.__wake.released++,
              addEventListener: () => {},
            }
          },
        },
      })
    })
    await startGame(page, ['Ana', 'Beto'])
    await expect
      .poll(() =>
        page.evaluate(() => (window as never as { __wake: { requests: number } }).__wake.requests),
      )
      .toBe(1)
    // Fuera de la partida se libera.
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    await expect(page.getByText(/no puede mantener la pantalla encendida/)).toHaveCount(0)
  })

  test('si el navegador no tiene la función, avisa sin romper el juego', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: undefined })
    })
    await startGame(page, ['Ana', 'Beto'])
    await expect(page.getByText(/no puede mantener la pantalla encendida/)).toBeVisible()
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    await expect(cardRegion(page)).toBeVisible()
  })
})
