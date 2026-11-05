import { z } from 'zod'

// Sin generación de código en tiempo de ejecución: la política de seguridad de la app no permite `eval`.
z.config({ jitless: true })

/** Tipos de acción. `movement` solo lo usan las casillas que mueven la ficha. */
export const ACTION_KINDS = ['drink', 'dare', 'truth', 'movement'] as const

/** Efecto de movimiento de una casilla. */
export const EffectSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('back'), steps: z.number().int().positive() }),
  z.object({ type: z.literal('toLapStart') }),
])

/** Una acción (casilla) del juego. */
export const ActionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+-\d{3}$/, 'El id debe verse como "base-014"'),
    text: z.string().min(1),
    pack: z.string().min(1),
    kind: z.enum(ACTION_KINDS),
    effect: EffectSchema.optional(),
  })
  .refine((a) => (a.kind === 'movement') === (a.effect !== undefined), {
    message: 'Las acciones de tipo "movement" deben tener efecto, y solo ellas',
    path: ['effect'],
  })

/** Lista de acciones de un pack. Los ids deben ser únicos. */
export const ActionListSchema = z.array(ActionSchema).superRefine((actions, ctx) => {
  const seen = new Set<string>()
  actions.forEach((action, index) => {
    if (seen.has(action.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `Id duplicado: ${action.id}`,
        path: [index, 'id'],
      })
    }
    seen.add(action.id)
  })
})

export type Effect = z.infer<typeof EffectSchema>
export type Action = z.infer<typeof ActionSchema>
export type ActionKind = (typeof ACTION_KINDS)[number]

/** Valida y devuelve una lista de acciones; lanza un error claro si algo no cumple el esquema. */
export function parseActions(data: unknown): Action[] {
  return ActionListSchema.parse(data)
}
