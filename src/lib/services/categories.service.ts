import type { CategoryInput } from '$lib/database/repositories/categories.repository'
import * as categoriesRepository from '$lib/database/repositories/categories.repository'

/**
 * 카테고리 목록 조회
 */
export const getCategories = async (storeId: string) => {
  return await categoriesRepository.getCategories(storeId)
}

/**
 * 카테고리 생성
 */
export const createCategory = async ({ name, store_id }: Pick<CategoryInput, 'name' | 'store_id'>) => {
  return await categoriesRepository.createCategory({ name, store_id })
}

/**
 * 카테고리 삭제
 */
export const deleteCategory = async ({ id }: Pick<CategoryInput, 'id'>) => {
  return await categoriesRepository.deleteCategory({ id })
}
