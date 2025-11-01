import { createHook } from '$lib/hooks/hooksManager'
import type { CreateProductHookContext } from '$lib/types'
import { createProductImagesHook } from './createProductImagesHook'
import { deleteProductHook } from './deleteProductHook'

export const createProductHook = createHook<CreateProductHookContext>()

createProductHook.cleanup(deleteProductHook)
createProductHook.after(createProductImagesHook)
