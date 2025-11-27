import * as storesRepository from '$lib/database/repositories/stores.repository'
import type { StoresFilterInput } from '$lib/schemas'

/**
 * 매장 목록 조회
 */
export const getStores = async (filter: StoresFilterInput) => {
  return await storesRepository.getStores(filter)
}

/**
 * 매장 상세 조회
 */
export const getStoreById = async (id: string) => {
  return await storesRepository.getStoreById(id)
}

/**
 * 본사 매장 조회
 */
export const getHQStore = async () => {
  return await storesRepository.getHQStore()
}

/**
 * 사용자별 매장 멤버 정보 조회
 */
export const getStoreMemberByUserId = async (userId: string | undefined) => {
  return await storesRepository.getStoreMemberByUserId(userId)
}

/**
 * 매장 멤버 추가
 * - 중복 체크 후 추가
 */
export const addStoreMember = async (storeId: string, userId: string) => {
  if (!userId || !storeId) {
    throw new Error('Missing required parameters: storeId and userId')
  }

  // 중복 체크
  const existing = await storesRepository.checkStoreMemberExists(storeId, userId)
  if (existing) return { alreadyExists: true }

  // 멤버 추가
  await storesRepository.insertStoreMember(storeId, userId)
  return { alreadyExists: false }
}

/**
 * 매장 멤버 삭제
 */
export const deleteStoreMember = async (storeId: string, userId: string) => {
  if (!userId || !storeId) {
    throw new Error('Missing required parameters: storeId and userId')
  }

  // 존재 체크
  const existing = await storesRepository.checkStoreMemberExists(storeId, userId)
  if (!existing) return { notFound: true }

  // 멤버 삭제
  await storesRepository.deleteStoreMember(storeId, userId)
  return { notFound: false }
}
