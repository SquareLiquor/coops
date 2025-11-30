import { toStoreEntities, toStoreEntity, toStoreMemberEntity } from '$lib/converters/store.converter'
import * as storesRepository from '$lib/database/repositories/stores.repository'
import type { StoreCreateInput, StoresFilterInput, StoreUpdateInput } from '$lib/schemas'

/**
 * 매장 목록 조회
 */
export const getStores = async (filter: StoresFilterInput) => {
  const result = await storesRepository.getStores(filter)
  return {
    stores: toStoreEntities(result.stores),
    pagination: result.pagination,
  }
}

/**
 * 매장 상세 조회
 */
export const getStoreById = async (id: string) => {
  const result = await storesRepository.getStoreById(id)
  return { store: toStoreEntity(result.store) }
}

/**
 * 매장 생성
 */
export const createStore = async (formData: StoreCreateInput) => {
  const result = await storesRepository.createStore(formData)
  return { store: toStoreEntity(result.store) }
}

/**
 * 매장 수정
 */
export const updateStore = async (formData: StoreUpdateInput) => {
  const result = await storesRepository.updateStore(formData)
  return { store: toStoreEntity(result.store) }
}

/**
 * 본사 매장 조회
 */
export const getHQStore = async () => {
  const result = await storesRepository.getHQStore()
  return { store: toStoreEntity(result.store) }
}

/**
 * 사용자별 매장 멤버 정보 조회
 */
export const getStoreMemberByUserId = async (userId: string | undefined) => {
  const result = await storesRepository.getStoreMemberByUserId(userId)
  return { storeMember: toStoreMemberEntity(result.storeMember) }
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
