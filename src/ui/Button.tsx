import type { ComponentProps } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-amber-400 text-black hover:bg-amber-300 disabled:bg-zinc-700 disabled:text-zinc-300',
  secondary: 'bg-zinc-800 text-zinc-50 hover:bg-zinc-700 disabled:text-zinc-400',
  ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800 disabled:text-zinc-500',
}

type Props = ComponentProps<'button'> & { variant?: Variant }

/** Botón grande (mínimo 48 px de alto) para usar con el pulgar. */
export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      className={`min-h-12 rounded-xl px-5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  )
}
