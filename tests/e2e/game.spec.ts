import { expect, test, type Page } from '@playwright/test'

/** Entra por la advertencia +18 y, si se pide, abre la configuración. */
async function enter(page: Page, url = '/?seed=7') {
  await page.goto(url)
  await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
}

async function startGame(page: Page, names: string[], laps = 1, seed = 7) {
  await enter(page, `/?seed=${seed}`)
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

test.describe('advertencia +18 (hito 3.2)', () => {
  test('aparece al abrir y bloquea el acceso hasta confirmar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Solo para mayores de 18 años')).toBeVisible()
    await expect(page.getByText(/alcohol/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toHaveCount(0)
  })

  test('confirmar lleva al inicio; ser menor muestra acceso no permitido', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Soy menor de edad' }).click()
    await expect(page.getByRole('heading', { name: 'Acceso no permitido' })).toBeVisible()

    await page.goto('/')
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible()
  })

  test('vuelve a aparecer cada vez que se abre la app', async ({ page }) => {
    await enter(page)
    await page.reload()
    await expect(page.getByText('Solo para mayores de 18 años')).toBeVisible()
  })
})

test.describe('configurar partida (hito 3.3)', () => {
  test('pide el orden de asientos y exige al menos 2 jugadores', async ({ page }) => {
    await enter(page)
    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await expect(page.getByText(/en el orden en que están sentados/)).toBeVisible()

    const start = page.getByRole('button', { name: 'Empezar partida' })
    await expect(start).toBeDisabled()
    await page.getByLabel('Nombre del jugador 1').fill('Ana')
    await expect(start).toBeDisabled()
    await page.getByLabel('Nombre del jugador 2').fill('Beto')
    await expect(start).toBeEnabled()
  })

  test('permite reordenar, quitar y agregar jugadores, y cambiar las vueltas', async ({ page }) => {
    await enter(page)
    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await page.getByLabel('Nombre del jugador 1').fill('Ana')
    await page.getByLabel('Nombre del jugador 2').fill('Beto')
    await page.getByRole('button', { name: 'Bajar a Ana' }).click()
    await expect(page.getByLabel('Nombre del jugador 1')).toHaveValue('Beto')
    await expect(page.getByLabel('Nombre del jugador 2')).toHaveValue('Ana')

    await page.getByRole('button', { name: 'Agregar jugador' }).click()
    await expect(page.getByLabel('Nombre del jugador 3')).toBeVisible()
    await page.getByRole('button', { name: 'Quitar a jugador 3' }).click()
    await expect(page.getByLabel('Nombre del jugador 3')).toHaveCount(0)

    await expect(page.getByLabel('Vueltas', { exact: true })).toHaveText('1')
    await page.getByRole('button', { name: 'Más vueltas' }).click()
    await expect(page.getByLabel('Vueltas', { exact: true })).toHaveText('2')
    await expect(page.getByRole('button', { name: 'Menos vueltas' })).toBeEnabled()
  })
})

test.describe('turnos y tarjetas (hitos 3.4 y 3.5)', () => {
  test('tirar el dado muestra la tarjeta y Continuar pasa al siguiente jugador', async ({
    page,
  }) => {
    await startGame(page, ['Ana', 'Beto'])
    const heading = page.getByRole('heading', { level: 1 })
    const first = (await heading.textContent()) ?? ''
    expect(['Ana', 'Beto']).toContain(first)

    await expect(page.getByText(/^Dado:/)).toHaveCount(0)
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    await expect(page.getByRole('region', { name: /^Tarjeta de la casilla/ })).toBeVisible()
    await expect(page.getByText(/^Dado:/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tirar dado' })).toHaveCount(0)

    // Un retroceso muestra una segunda tarjeta; se continúa hasta volver al dado.
    let guard = 0
    while ((await page.getByRole('button', { name: 'Tirar dado' }).count()) === 0 && guard++ < 5) {
      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    }
    await expect(page.getByRole('button', { name: 'Tirar dado' })).toBeVisible()
    const second = (await heading.textContent()) ?? ''
    expect(second).not.toBe(first)
  })
})

test.describe('reglamento (hito 3.6)', () => {
  test('se abre y se cierra durante la partida sin perder el turno', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    const card = page.getByRole('region', { name: /^Tarjeta de la casilla/ })
    const cardText = await card.textContent()
    const heading = await page.getByRole('heading', { level: 1 }).textContent()

    await page.getByRole('button', { name: 'Reglamento' }).click()
    const dialog = page.getByRole('dialog', { name: 'Reglamento' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/Cómo se juega/)).toBeVisible()
    await expect(dialog.getByText(/Juego responsable/)).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar' }).click()
    await expect(dialog).toHaveCount(0)
    expect(await card.textContent()).toBe(cardText)
    expect(await page.getByRole('heading', { level: 1 }).textContent()).toBe(heading)

    await page.getByRole('button', { name: 'Reglamento' }).click()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })
})

test.describe('guardado y continuar (hito 3.7)', () => {
  test('al recargar se puede continuar la partida donde se quedó', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    const card = page.getByRole('region', { name: /^Tarjeta de la casilla/ })
    const cardText = await card.textContent()
    const heading = await page.getByRole('heading', { level: 1 }).textContent()

    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByText('Tienes una partida sin terminar')).toBeVisible()
    await page.getByRole('button', { name: 'Continuar partida' }).click()

    await expect(card).toBeVisible()
    expect(await card.textContent()).toBe(cardText)
    expect(await page.getByRole('heading', { level: 1 }).textContent()).toBe(heading)
  })

  test('se puede descartar la partida guardada', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Descartar partida guardada' }).click()
    await expect(page.getByText('Tienes una partida sin terminar')).toHaveCount(0)
    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByText('Tienes una partida sin terminar')).toHaveCount(0)
  })

  test('un guardado dañado se descarta con un aviso', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('tablero:partida:v1', '{"version":1}'))
    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByText(/estaba dañada/)).toBeVisible()
  })
})

test.describe('fin de partida (hito 3.8)', () => {
  test('el ganador ve su tarjeta y, al continuar, aparece la tabla de posiciones', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await startGame(page, ['Ana', 'Beto', 'Carla'], 1)

    let sawWinnerCard = false
    for (let step = 0; step < 800; step++) {
      if ((await page.getByText('La partida terminó').count()) > 0) break
      if ((await page.getByText(/llegó a la meta/).count()) > 0) sawWinnerCard = true
      const roll = page.getByRole('button', { name: 'Tirar dado' })
      if ((await roll.count()) > 0) await roll.click()
      else await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    }

    expect(sawWinnerCard).toBe(true)
    await expect(page.getByText('La partida terminó')).toBeVisible()
    await expect(page.getByRole('heading', { name: /^Ganó / })).toBeVisible()
    const rows = page.getByRole('region', { name: 'Tabla de posiciones' }).getByRole('listitem')
    await expect(rows).toHaveCount(3)
    await expect(rows.first()).toContainText('Meta')
  })

  test('jugar otra vez empieza una partida nueva con los mismos jugadores', async ({ page }) => {
    test.setTimeout(120_000)
    await startGame(page, ['Ana', 'Beto'], 1)
    for (let step = 0; step < 800; step++) {
      if ((await page.getByText('La partida terminó').count()) > 0) break
      const roll = page.getByRole('button', { name: 'Tirar dado' })
      if ((await roll.count()) > 0) await roll.click()
      else await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Jugar otra vez' }).click()
    await expect(page.getByRole('button', { name: 'Tirar dado' })).toBeVisible()
    expect(['Ana', 'Beto']).toContain(await page.getByRole('heading', { level: 1 }).textContent())

    // La partida terminada no queda como guardada.
    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await expect(page.getByText('Tienes una partida sin terminar')).toBeVisible()
  })
})

/** Avanza (dado y Continuar) hasta que la tarjeta visible cumple la condición. */
async function playUntilCard(page: Page, matches: (text: string) => boolean, maxSteps = 400) {
  const card = page.getByRole('region', { name: /^Tarjeta de la casilla/ })
  for (let step = 0; step < maxSteps; step++) {
    if ((await card.count()) > 0) {
      const text = (await card.textContent()) ?? ''
      if (matches(text)) return text
      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    } else {
      await page.getByRole('button', { name: 'Tirar dado' }).click()
    }
  }
  throw new Error('No apareció la tarjeta buscada')
}

test.describe('efectos de movimiento en pantalla (hito 3.5)', () => {
  test('un retroceso muestra su tarjeta y luego la de la casilla de llegada', async ({ page }) => {
    test.setTimeout(120_000)
    // Con la semilla 1 el tablero trae un retroceso que sale en las primeras jugadas.
    await startGame(page, ['Ana', 'Beto'], 3, 1)
    const text = await playUntilCard(page, (t) => /RETROCEDE/.test(t) && !/Retrocediste/.test(t))
    expect(text).toMatch(/Al continuar, retrocedes [0-9]+ casillas/)

    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await expect(page.getByText(/^Retrocediste a la casilla/)).toBeVisible()
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Tirar dado' })).toBeVisible()
  })

  test('VUELVE A LA SALIDA regresa a la ficha a la salida de su vuelta', async ({ page }) => {
    test.setTimeout(120_000)
    await startGame(page, ['Ana', 'Beto'], 3, 1)
    const owner = await (async () => {
      await playUntilCard(page, (t) => /VUELVE A LA SALIDA/.test(t))
      return (await page.getByRole('heading', { level: 1 }).textContent()) ?? ''
    })()
    await expect(page.getByText('Al continuar, vuelves a la salida de esta vuelta.')).toBeVisible()
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()

    await page.getByRole('button', { name: 'Jugadores' }).click()
    const row = page
      .getByRole('dialog', { name: 'Jugadores' })
      .getByRole('listitem')
      .filter({ hasText: owner })
    await expect(row).toContainText('salida')
  })
})

test.describe('sacar y agregar jugadores (hito 3.9)', () => {
  test('se puede agregar un jugador al final y sacar a otro', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Jugadores' }).click()
    const dialog = page.getByRole('dialog', { name: 'Jugadores' })
    await expect(dialog.getByRole('listitem')).toHaveCount(2)
    await expect(dialog.getByRole('button', { name: /^Sacar a/ }).first()).toBeDisabled()

    await dialog.getByLabel('Agregar jugador').fill('Carla')
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).click()
    await expect(dialog.getByRole('listitem')).toHaveCount(3)
    await expect(dialog.getByRole('listitem').last()).toContainText('Carla')
    await expect(dialog.getByRole('listitem').last()).toContainText('salida')

    await dialog.getByRole('button', { name: 'Sacar a Beto' }).click()
    await expect(dialog.getByRole('listitem')).toHaveCount(2)
    await expect(dialog.getByText('Beto')).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: /^Sacar a/ }).first()).toBeDisabled()
  })

  test('el cambio de jugadores se guarda y sobrevive a recargar', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Jugadores' }).click()
    const dialog = page.getByRole('dialog', { name: 'Jugadores' })
    await dialog.getByLabel('Agregar jugador').fill('Carla')
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).click()
    await dialog.getByRole('button', { name: 'Cerrar' }).click()

    await page.reload()
    await page.getByRole('button', { name: 'Tengo 18 años o más' }).click()
    await page.getByRole('button', { name: 'Continuar partida' }).click()
    await page.getByRole('button', { name: 'Jugadores' }).click()
    await expect(page.getByRole('dialog', { name: 'Jugadores' }).getByRole('listitem')).toHaveCount(
      3,
    )
  })

  test('no deja cambiar la lista mientras hay una tarjeta pendiente', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto', 'Carla'])
    await page.getByRole('button', { name: 'Tirar dado' }).click()
    await page.getByRole('button', { name: 'Jugadores' }).click()
    const dialog = page.getByRole('dialog', { name: 'Jugadores' })
    await expect(
      dialog.getByText(/Solo se puede cambiar la lista antes de tirar el dado/),
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: /^Sacar a/ }).first()).toBeDisabled()
    await expect(dialog.getByLabel('Agregar jugador')).toBeDisabled()
  })

  test('si se saca al jugador en turno, el turno pasa al siguiente', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto', 'Carla'])
    const inTurn = (await page.getByRole('heading', { level: 1 }).textContent()) ?? ''
    await page.getByRole('button', { name: 'Jugadores' }).click()
    await page
      .getByRole('dialog', { name: 'Jugadores' })
      .getByRole('button', { name: `Sacar a ${inTurn}` })
      .click()
    await page
      .getByRole('dialog', { name: 'Jugadores' })
      .getByRole('button', { name: 'Cerrar' })
      .click()
    const now = (await page.getByRole('heading', { level: 1 }).textContent()) ?? ''
    expect(now).not.toBe(inTurn)
    expect(['Ana', 'Beto', 'Carla']).toContain(now)
  })
})

test.describe('paneles accesibles (revisión del bloque 3)', () => {
  test('escribir no roba el foco, Escape cierra y el foco vuelve al botón que abrió el panel', async ({
    page,
  }) => {
    await startGame(page, ['Ana', 'Beto'])
    const trigger = page.getByRole('button', { name: 'Jugadores' })
    // Se abre con el teclado: Safari no da foco a los botones al hacer clic.
    await trigger.focus()
    await page.keyboard.press('Enter')
    const input = page.getByLabel('Agregar jugador')
    await input.click()
    await input.pressSequentially('Carla')
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('Carla')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Jugadores' })).toHaveCount(0)
    await expect(trigger).toBeFocused()

    // Al reabrir, el nombre a medias no reaparece.
    await trigger.click()
    await expect(page.getByLabel('Agregar jugador')).toHaveValue('')
  })

  test('con un panel abierto, lo de atrás queda inerte', async ({ page }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Reglamento' }).click()
    await expect(page.locator('div[inert]')).toHaveCount(1)
    await page.getByRole('button', { name: 'Cerrar' }).click()
    await expect(page.locator('div[inert]')).toHaveCount(0)
  })

  test('no deja agregar un nombre repetido en la partida ni en la configuración', async ({
    page,
  }) => {
    await startGame(page, ['Ana', 'Beto'])
    await page.getByRole('button', { name: 'Jugadores' }).click()
    const dialog = page.getByRole('dialog', { name: 'Jugadores' })
    await dialog.getByLabel('Agregar jugador').fill('ana')
    await expect(dialog.getByText('Ya hay un jugador con ese nombre.')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Agregar', exact: true })).toBeDisabled()
  })

  test('la configuración avisa de nombres repetidos', async ({ page }) => {
    await enter(page)
    await page.getByRole('button', { name: 'Nueva partida' }).click()
    await page.getByLabel('Nombre del jugador 1').fill('Ana')
    await page.getByLabel('Nombre del jugador 2').fill('ana')
    await expect(page.getByRole('alert')).toContainText('nombres distintos')
    await expect(page.getByRole('button', { name: 'Empezar partida' })).toBeDisabled()
  })
})
