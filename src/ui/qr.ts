import qrcode from 'qrcode-generator'

/** Hito 6.4. Matriz del código QR de un texto (true = cuadro oscuro). Se genera en el celular, sin conexión. */
export function qrModules(text: string): boolean[][] {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const size = qr.getModuleCount()
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => qr.isDark(row, col)),
  )
}

/** Trazo SVG del código: un cuadrado por cada módulo oscuro, con 4 módulos de margen alrededor. */
export function qrPath(modules: boolean[][]): { path: string; size: number } {
  const quiet = 4
  let path = ''
  modules.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) path += `M${c + quiet} ${r + quiet}h1v1h-1z`
    }),
  )
  return { path, size: modules.length + quiet * 2 }
}
