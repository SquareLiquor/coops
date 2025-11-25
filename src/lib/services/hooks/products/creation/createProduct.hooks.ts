import { createHook } from '$lib/services/hooks/hooksManager'
import type { CreateProductHookContext } from './createProduct.context'
import { createProductImagesHook } from './hooks/createProductImages.hook'
import { deleteProductHook } from './hooks/deleteProduct.hook'

export const createProductHook = createHook<CreateProductHookContext>()

createProductHook.cleanup(deleteProductHook)
createProductHook.after(createProductImagesHook)
