// Hito 5.6. Comprueba que la primera carga pese menos de 300 KB comprimida.
// Uso: npm run build && npm run size
import { readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const LIMIT_KB = 300
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const html = readFileSync(join(dist, 'index.html'), 'utf8')

const files = new Map() // ruta -> bytes comprimidos
const add = (path, bytes) => files.set(path, bytes)
const gz = (buffer) => gzipSync(buffer, { level: 9 }).length

add('index.html', gz(Buffer.from(html)))

const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
for (const ref of refs) {
  const buffer = readFileSync(join(dist, ref))
  add(ref, gz(buffer))
  // Las fuentes que pide el CSS (solo woff2, que es lo que descargan los navegadores nuevos).
  if (ref.endsWith('.css')) {
    for (const m of buffer.toString().matchAll(/url\(["']?(\/assets\/[^)"']+\.woff2)["']?\)/g)) {
      const font = m[1]
      if (existsSync(join(dist, font))) add(font, readFileSync(join(dist, font)).length)
    }
  }
}

let total = 0
for (const [path, bytes] of files) {
  total += bytes
  console.log(`${(bytes / 1024).toFixed(1).padStart(7)} KB  ${path}`)
}
console.log(
  `${(total / 1024).toFixed(1).padStart(7)} KB  total de la primera carga (límite ${LIMIT_KB} KB)`,
)
if (total / 1024 > LIMIT_KB) {
  console.error('La primera carga pesa más del límite.')
  process.exit(1)
}
