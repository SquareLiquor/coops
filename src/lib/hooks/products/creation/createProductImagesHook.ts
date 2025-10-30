import type { HookContext } from '$lib/hooks/hooksManager'
import type { ApproveRequestHookContext } from '$lib/types'

const createProductImages = async () => {}

const deleteProductImages = async () => {}

export const createProductImagesHook: HookContext<ApproveRequestHookContext> = {
  hook: createProductImages,
  cleanup: deleteProductImages,
}
