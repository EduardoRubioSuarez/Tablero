import baseJson from './base.json'
import { parseActions } from './schema'

export type { Action, ActionKind, Effect } from './schema'

/** Las 80 acciones del pack "base", validadas contra el esquema al cargar. */
export const baseActions = parseActions(baseJson)
