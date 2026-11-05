import { Fragment, type ReactNode } from 'react'

/** Texto con **negritas**. */
function inline(text: string): ReactNode[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
    )
}

/**
 * Mostrador mínimo de Markdown para el reglamento: títulos (#, ##), citas (>), listas
 * numeradas y con guion, párrafos y negritas. Genera elementos de React, nunca HTML crudo.
 */
export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = []
  const lines = source.split(/\r?\n/)
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') {
      i++
    } else if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={i} className="mt-3 font-semibold text-sol-300">
          {inline(line.slice(4))}
        </h4>,
      )
      i++
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={i} className="font-display mt-4 text-lg text-sol-400">
          {inline(line.slice(3))}
        </h3>,
      )
      i++
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={i} className="font-display text-2xl text-sol-400">
          {inline(line.slice(2))}
        </h2>,
      )
      i++
    } else if (line.startsWith('> ')) {
      blocks.push(
        <p key={i} className="rounded-xl bg-white/12 p-3 text-sm text-lila">
          {inline(line.slice(2))}
        </p>,
      )
      i++
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i]))
        items.push(lines[i++].replace(/^\d+\. /, ''))
      blocks.push(
        <ol key={i} className="list-decimal space-y-1 pl-6">
          {items.map((t, k) => (
            <li key={k}>{inline(t)}</li>
          ))}
        </ol>,
      )
    } else if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) items.push(lines[i++].slice(2))
      blocks.push(
        <ul key={i} className="list-disc space-y-1 pl-6">
          {items.map((t, k) => (
            <li key={k}>{inline(t)}</li>
          ))}
        </ul>,
      )
    } else {
      blocks.push(<p key={i}>{inline(line)}</p>)
      i++
    }
  }

  return <div className="flex flex-col gap-2">{blocks}</div>
}
