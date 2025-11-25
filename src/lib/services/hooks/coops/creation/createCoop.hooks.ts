import { createHook } from '$lib/services/hooks/hooksManager'
import type { CreateCoopHookContext } from './createCoop.context'
import { createCoopImagesHook } from './hooks/createCoopImages.hook'
import { createProductHook } from './hooks/createProduct.hook'
import { deleteCoopHook } from './hooks/deleteCoop.hook'

export const createCoopHook = createHook<CreateCoopHookContext>()

createCoopHook.cleanup(deleteCoopHook)
createCoopHook.before(createProductHook)
createCoopHook.after(createCoopImagesHook)
