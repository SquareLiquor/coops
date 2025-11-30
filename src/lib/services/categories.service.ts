import { toCategoryEntities, toCategoryEntity } from '$lib/converters/category.converter'
import type { CategoryInput } from '$lib/database/repositories/categories.repository'
import * as categoriesRepository from '$lib/database/repositories/categories.repository'

/**
 * 카테고리 목록 조회
 */
export const getCategories = async (storeId: string) => {
  const result = await categoriesRepository.getCategories(storeId)
  return { categories: toCategoryEntities(result.categories) }
}

/**
 * 카테고리 생성
 */
export const createCategory = async ({ name, store_id }: Pick<CategoryInput, 'name' | 'store_id'>) => {
  const result = await categoriesRepository.createCategory({ name, store_id })
  return { category: toCategoryEntity(result.category) }
}

/**
 * 카테고리 삭제
 */
export const deleteCategory = async ({ id }: Pick<CategoryInput, 'id'>) => {
  return await categoriesRepository.deleteCategory({ id })
}
