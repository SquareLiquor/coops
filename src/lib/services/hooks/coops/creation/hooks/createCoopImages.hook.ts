import { cleanupCoopImages, processCoopImages } from '$lib/services/coopImages.service'
import type { HookContext } from '$lib/services/hooks/hooksManager'
import type { CreateCoopHookContext } from '../createCoop.context'

const createCoopImages = async ({ images }: CreateCoopHookContext, shared: any) => {
  if (!images || images.length === 0) return

  const coopId = shared.get('coopId')
  if (!coopId) return

  // service layer에서 모든 비즈니스 로직 처리
  const { processedImages } = await processCoopImages(coopId, images)

  // cleanup을 위해 처리된 이미지 정보 저장
  shared.set('coopImages', processedImages)
}

const deleteCoopImages = async (context: CreateCoopHookContext, shared: any) => {
  const coopImages = shared.get('coopImages')
  if (!coopImages) return

  // service layer에서 정리 로직 처리
  await cleanupCoopImages(coopImages)
}

export const createCoopImagesHook: HookContext<CreateCoopHookContext> = {
  hook: createCoopImages,
  cleanup: deleteCoopImages,
}
