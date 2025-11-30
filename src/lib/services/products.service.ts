import { toProductEntities, toProductEntity } from '$lib/converters/product.converter'
import * as productsRepository from '$lib/database/repositories/products.repository'
import type { ImageInput, ProductCreateInput, ProductsFilterInput, ProductUpdateInput } from '$lib/schemas'

/**
 * 상품 목록 조회 (페이징)
 */
export const getProducts = async (filter: ProductsFilterInput) => {
  const result = await productsRepository.getProducts(filter)
  return {
    products: toProductEntities(result.products),
    pagination: result.pagination,
  }
}

/**
 * 상품 상세 조회
 */
export const getProductById = async (productId: string) => {
  const result = await productsRepository.getProductById(productId)
  return { product: toProductEntity(result.product) }
}

/**
 * 상품 생성
 */
export const createProduct = async (formData: ProductCreateInput) => {
  return await productsRepository.createProduct(formData)
}

/**
 * 상품 수정
 */
export const updateProduct = async (formData: ProductUpdateInput) => {
  return await productsRepository.updateProduct(formData)
}

/**
 * 상품 이미지 업데이트
 */
export const updateProductImages = async (productId: string, images: ImageInput[]) => {
  return await productsRepository.updateProductImages(productId, images)
}

/**
 * 상품 이미지 생성
 */
export const createProductImages = async (productId: string, images: ImageInput[]) => {
  return await productsRepository.insertProductImages(productId, images)
}

/**
 * 상품 복사 (공동구매용)
 */
export const copyProductForCoop = async (productData: {
  storeId: string
  originId?: string
  categoryId?: string
  name: string
  description?: string
  price: number
  capacity?: string
  sellUnit?: string
  purchaseUnit?: string
  purchaseQty?: number
}) => {
  return await productsRepository.insertProduct({
    store_id: productData.storeId,
    origin_id: productData.originId,
    category_id: productData.categoryId,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    capacity_text: productData.capacity,
    sell_unit_text: productData.sellUnit,
    purchase_unit: productData.purchaseUnit,
    purchase_qty: productData.purchaseQty,
    initial_stock: 0,
    active: true,
  })
}

/**
 * 상품 삭제
 */
export const deleteProduct = async (productId: string) => {
  return await productsRepository.deleteProduct(productId)
}
