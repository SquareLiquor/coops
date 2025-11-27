import * as storagesRepository from '$lib/database/repositories/storages.repository'

/**
 * 파일 업로드
 */
export const uploadFile = async (bucket: string = 'products', file: File, path: string) => {
  return await storagesRepository.uploadFile(bucket, file, path)
}

/**
 * 파일 삭제
 */
export const deleteFile = async (bucket: string = 'products', paths: string[]) => {
  return await storagesRepository.deleteFile(bucket, paths)
}

/**
 * 파일 복사
 */
export const copyFile = async (fromBucket: string, toBucket: string, fromPath: string, toPath: string) => {
  return await storagesRepository.copyFile(fromBucket, toBucket, fromPath, toPath)
}
