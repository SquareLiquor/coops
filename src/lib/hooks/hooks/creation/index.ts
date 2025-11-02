import { createHook } from '$lib/hooks/hooksManager'
import type { CreateCoopHookContext } from '$lib/types'
import { copyProductHook } from './copyProductHook'
import { copyProductImagesHook } from './copyProductImagesHook'

export const createCoopHook = createHook<CreateCoopHookContext>()

createCoopHook.before(copyProductHook)
createCoopHook.before(copyProductImagesHook)
