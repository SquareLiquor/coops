import { PurchaseStatus, SalesStatus, type PurchaseEntity } from '$lib/types'
import { lookupEnum } from '$lib/utils/enum'
import { toCategoryEntity } from './category.converter'
import { toCoopEntity } from './coop.converter'
import { toProductEntity } from './product.converter'
import { toStoreEntity } from './store.converter'

export const toPurchaseEntity = (data: any): PurchaseEntity | undefined => {
  if (!data) return undefined

  const {
    coop_id,
    coop_name,
    coop_description,
    coop_status,
    coop,
    sales_date,
    sales_price,
    max_quantity,
    store_id,
    store_name,
    store,
    product_id,
    product_name,
    product,
    origin_product_id,
    origin_product_name,
    origin_product_unit,
    origin_product_price,
    origin_product,
    category_id,
    category_name,
    category,
    ordered_quantity,
    purchase_id,
    purchase_status,
    purchase_price,
    purchase_quantity,
    purchase_unit,
    requested_date,
    approved_date,
    shipped_date,
    cancelled_date,
    rejected_date,
    rejection_reason,
    created_at,
    updated_at,
  } = data

  return {
    coopId: coop_id,
    coopName: coop_name,
    coopDescription: coop_description,
    coopStatus: lookupEnum(SalesStatus, coop_status)!,
    salesDate: sales_date,
    salesPrice: sales_price,
    maxQuantity: max_quantity,
    coop: toCoopEntity(coop),
    storeId: store_id,
    storeName: store_name,
    store: toStoreEntity(store),
    productId: product_id,
    productName: product_name,
    product: toProductEntity(product),
    originProductId: origin_product_id,
    originProductName: origin_product_name,
    originProductUnit: origin_product_unit,
    originProductPrice: origin_product_price,
    originProduct: toProductEntity(origin_product),
    categoryId: category_id,
    categoryName: category_name,
    category: toCategoryEntity(category),
    orderedQuantity: ordered_quantity,
    purchaseId: purchase_id,
    purchaseStatus: lookupEnum(PurchaseStatus, purchase_status)!,
    purchasePrice: purchase_price,
    purchaseQuantity: purchase_quantity,
    purchaseUnit: purchase_unit,
    requestedDate: requested_date,
    approvedDate: approved_date,
    shippedDate: shipped_date,
    cancelledDate: cancelled_date,
    rejectedDate: rejected_date,
    rejectionReason: rejection_reason,
    createdAt: created_at,
    updatedAt: updated_at,
  }
}

export const toPurchaseEntities = (datas: any[] | null): PurchaseEntity[] => {
  if (!datas) return []

  return datas.map(toPurchaseEntity).filter((item): item is PurchaseEntity => item !== null)
}
