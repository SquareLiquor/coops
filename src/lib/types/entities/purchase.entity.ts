import type { PurchaseStatus, SalesStatus } from '../common'
import type { CoopEntity } from './coop.entity'
import type { CategoryEntity, ProductEntity } from './product.entity'
import type { StoreEntity } from './store.entity'

export interface PurchaseEntity {
  coopId: string
  coopName: string
  coopDescription: string
  coopStatus: SalesStatus
  salesDate: string
  salesPrice: number
  maxQuantity: number
  coop?: CoopEntity

  storeId: string
  storeName: string
  store?: StoreEntity

  productId: string
  productName: string
  productPrice: number
  productCapacity: string
  productSellUnit: string
  product?: ProductEntity

  originProductId: string
  originProductName: string
  originProductPrice: number
  originProductCapacity: string
  originProductSellUnit: string
  originProductPurchaseUnit: string
  originProductPurchaseQty: number
  originProduct?: ProductEntity

  categoryId: string
  categoryName: string
  category?: CategoryEntity

  orderedQuantity: number

  purchaseId: string
  purchaseStatus: PurchaseStatus
  purchasePrice: number
  purchaseQuantity: number
  purchaseUnit: string
  requestedDate: string
  approvedDate: string
  shippedDate: string
  cancelledDate: string
  rejectedDate: string
  rejectionReason: string
  createdAt: string
  updatedAt: string
}
