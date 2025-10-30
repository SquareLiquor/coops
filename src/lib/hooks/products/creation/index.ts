import { createHook } from '$lib/hooks/hooksManager'
import type { ApproveRequestHookContext } from '$lib/types'
import { createProductImagesHook } from './createProductImagesHook'
import { uploadImagesHook } from './uploadImagesHook'

export const createProductHook = createHook<ApproveRequestHookContext>()
createProductHook.after(uploadImagesHook)
createProductHook.after(createProductImagesHook)
