import { createHook } from '$lib/hooks/hooksManager'
import type { CreateCoopHookContext } from '$lib/types'
import { createCoopImagesHook } from './createCoopImagesHook'
import { createProductHook } from './createProductHook'
import { deleteCoopHook } from './deleteCoopHook'

export const createCoopHook = createHook<CreateCoopHookContext>()

createCoopHook.cleanup(deleteCoopHook)
createCoopHook.before(createProductHook)
createCoopHook.after(createCoopImagesHook)
