import type { ComponentProps } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary:
    'font-display bg-linear-to-b from-sol-300 to-sol-500 text-ink shadow-[0_5px_0_#a87e00,0_12px_16px_rgb(0_0_0/0.35)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_#a87e00,0_6px_10px_rgb(0_0_0/0.35)] disabled:translate-y-0 disabled:from-white/20 disabled:to-white/20 disabled:text-white/60 disabled:shadow-none',
  secondary:
    'font-semibold bg-white/12 text-white ring-1 ring-white/20 ring-inset hover:bg-white/20 disabled:text-white/50',
  ghost: 'font-semibold bg-transparent text-lila hover:bg-white/10 disabled:text-white/45',
}

type Props = ComponentProps<'button'> & { variant?: Variant }

/** Botón grande (mínimo 48 px de alto) para usar con el pulgar. */
export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      className={`min-h-12 rounded-2xl px-5 text-base transition-[background-color,transform,box-shadow] duration-100 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  )
}
