import * as coopItemsRepository from '$lib/database/repositories/coopItems.repository'
import type { ImageInput } from '$lib/schemas'
import dayjs from 'dayjs'
import { copyFile, deleteFile } from './storages.service'

/**
 * 공동구매 이미지 업데이트
 */

export const updateCoopImages = async (coopId: string, images: ImageInput[]) => {
  // 비즈니스 로직: 이미지 개수 제한, 파일 크기 검증 등
  return await coopItemsRepository.updateCoopImages(coopId, images)
}
/**
 * 공동구매 이미지 삭제
 */

export const deleteCoopImages = async (coopId: string) => {
  return await coopItemsRepository.deleteCoopImages(coopId)
} /**
 * 공동구매 이미지 생성 처리
 * - 사용하지 않는 이미지 삭제
 * - 기존 이미지 복사 (products -> coops)
 * - 새 이미지와 복사된 이미지를 DB에 저장
 */

export const processCoopImages = async (coopId: string, images: ImageInput[]) => {
  if (images.length === 0) return { processedImages: [] }

  const PRODUCTS_BUCKET = 'products'
  const COOPS_BUCKET = 'coops'

  // 이미지 분류
  const imagesToDelete = images.filter((image) => !image.use)
  const imagesToCopy = images.filter((image) => !image.new && image.use)
  const imagesToNew = images.filter((image) => image.new && image.use)

  // 사용하지 않는 이미지 삭제
  if (imagesToDelete.length > 0) {
    await Promise.all(imagesToDelete.map((image) => deleteFile(COOPS_BUCKET, [image.path])))
  }

  // 기존 상품 이미지를 coops 버킷으로 복사
  const imagesCopied: ImageInput[] = []
  if (imagesToCopy.length > 0) {
    await Promise.all(
      imagesToCopy.map(async (image) => {
        const { path, publicUrl } = await copyFile(
          PRODUCTS_BUCKET,
          COOPS_BUCKET,
          image.path,
          `${dayjs().format('YYYY-MM-DD')}/${crypto.randomUUID()}`
        )
        imagesCopied.push({
          ...image,
          url: publicUrl,
          path,
        })
      })
    )
  }

  // 처리된 모든 이미지 (새 이미지 + 복사된 이미지)
  const processedImages = [...imagesToNew, ...imagesCopied]

  // DB에 이미지 정보 저장
  if (processedImages.length > 0) {
    await coopItemsRepository.createCoopImages(coopId, processedImages)
  }

  return { processedImages }
}
/**
 * 공동구매 이미지 정리 (롤백용)
 */

export const cleanupCoopImages = async (images: ImageInput[]) => {
  if (!images || images.length === 0) return

  const paths = images.map((image) => image.path)
  await deleteFile('coops', paths)
}
