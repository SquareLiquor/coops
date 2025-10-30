import type { HookContext } from '$lib/hooks/hooksManager'
import type { ApproveRequestHookContext } from '$lib/types'

const uploadImages = async () => {}

const deleteImages = async () => {}

export const uploadImagesHook: HookContext<ApproveRequestHookContext> = {
  hook: uploadImages,
  cleanup: deleteImages,
}
