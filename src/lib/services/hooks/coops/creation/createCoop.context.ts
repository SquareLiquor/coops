import type { CoopCreateInput, ImageInput } from '$lib/schemas'

export interface CreateCoopHookContext {
  coop?: CoopCreateInput
  images?: ImageInput[]
}
