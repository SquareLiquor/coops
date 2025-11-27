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
    product_price,
    product_capacity,
    product_sell_unit,
    product,
    origin_product_id,
    origin_product_name,
    origin_product_price,
    origin_product_capacity,
    origin_product_sell_unit,
    origin_product_purchase_unit,
    origin_product_purchase_qty,
    origin_product_representative_image,
    origin_product,
    category_id,
    category_name,
    category,
    ordered_quantity,
    id,
    status,
    price,
    quantity,
    unit,
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
    productPrice: product_price,
    productCapacity: product_capacity,
    productSellUnit: product_sell_unit,
    product: toProductEntity(product),
    originProductId: origin_product_id,
    originProductName: origin_product_name,
    originProductCapacity: origin_product_capacity,
    originProductSellUnit: origin_product_sell_unit,
    originProductPurchaseUnit: origin_product_purchase_unit,
    originProductPurchaseQty: origin_product_purchase_qty,
    originProductPrice: origin_product_price,
    originProductRepresentativeImage: origin_product_representative_image,
    originProduct: toProductEntity(origin_product),

    categoryId: category_id,
    categoryName: category_name,
    category: toCategoryEntity(category),
    orderedQuantity: ordered_quantity,

    id: id,
    status: lookupEnum(PurchaseStatus, status)!,
    price: price,
    quantity: quantity,
    unit: unit,
    totalPrice: data.total_price || 0,
    notes: data.notes,

    requestedDate: requested_date,
    approvedDate: approved_date,
    shippedDate: shipped_date,
    cancelledDate: cancelled_date,
    rejectedDate: rejected_date,
    rejectionReason: rejection_reason,
    createdAt: created_at,
    updatedAt: updated_at,
    // Action flags based on status
    editable: status === PurchaseStatus.REQUESTED.code,
    cancelable: status === PurchaseStatus.REQUESTED.code || status === PurchaseStatus.APPROVED.code,
    approvable: status === PurchaseStatus.REQUESTED.code,
    rejectable: status === PurchaseStatus.REQUESTED.code,
    shippable: status === PurchaseStatus.APPROVED.code,
    deliverable: status === PurchaseStatus.DELIVERY_STARTED.code,
    reRequestable: status === PurchaseStatus.CANCELLED.code || status === PurchaseStatus.REJECTED.code,
  }
}

export const toPurchaseEntities = (datas: any[] | null): PurchaseEntity[] => {
  if (!datas) return []

  return datas.map(toPurchaseEntity).filter((item): item is PurchaseEntity => item !== null)
}
