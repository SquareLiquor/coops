import * as coopsRepository from '$lib/database/repositories/coops.repository'
import type { ConsumerCoopsFilterSchema, CoopCreateInput, CoopsFilterInput, CoopUpdateInput } from '$lib/schemas'

/**
 * 매장의 공동구매 목록 조회 (필터 및 페이징)
 */
export const getCoopsByStore = async (filter: CoopsFilterInput) => {
  return await coopsRepository.getCoopsByStore(filter)
}

/**
 * 소비자용 공동구매 목록 조회
 */
export const getCoopsForUser = async (filter: ConsumerCoopsFilterSchema) => {
  return await coopsRepository.getCoopsForUser(filter)
}

/**
 * 공동구매 상세 조회
 */
export const getCoopById = async (coopId: string) => {
  return await coopsRepository.getCoopById(coopId)
}

/**
 * 공동구매 생성
 */
export const createCoop = async (formData: CoopCreateInput, productId: string) => {
  // 비즈니스 로직: 필요시 유효성 검증, 데이터 가공 등
  return await coopsRepository.createCoop(formData, productId)
}

/**
 * 공동구매 수정
 */
export const updateCoop = async (formData: CoopUpdateInput) => {
  // 비즈니스 로직: 필요시 수정 가능 여부 검증 등
  return await coopsRepository.updateCoop(formData)
}

/**
 * 공동구매 삭제
 */
export const deleteCoop = async (coopId: string) => {
  // 비즈니스 로직: 삭제 가능 여부 검증 등
  return await coopsRepository.deleteCoop(coopId)
}
