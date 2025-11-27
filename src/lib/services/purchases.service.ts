import { toPurchaseEntities, toPurchaseEntity } from '$lib/converters/purchase.converter'
import {
  approvePurchase as _approvePurchase,
  cancelPurchase as _cancelPurchase,
  createPurchase as _createPurchase,
  deliverPurchase as _deliverPurchase,
  getPurchasesForHQ as _getPurchasesForHQ,
  getPurchasesForStore as _getPurchasesForStore,
  rejectPurchase as _rejectPurchase,
  shipPurchase as _shipPurchase,
  updatePurchase as _updatePurchase,
  getPurchaseById,
} from '$lib/database'
import { InvalidStatusTransitionError, NotFoundError } from '$lib/errors'
import type { PurchaseCreateInput, PurchaseUpdateInput, PurchasesFilterInput } from '$lib/schemas'
import { PurchaseStatus, type PurchaseEntity } from '$lib/types'
import { equalsEnum } from '$lib/utils/enum'

/**
 * 발주 상태 유효성 검증 헬퍼 함수
 */
const validatePurchaseStatus = (
  purchase: PurchaseEntity,
  allowedStatuses: (typeof PurchaseStatus)[keyof typeof PurchaseStatus][],
  actionName: string
) => {
  const isAllowed = allowedStatuses.some((status) => equalsEnum(purchase.status, status))

  if (!isAllowed) {
    const allowedLabels = allowedStatuses.map((s) => s.label).join(', ')
    throw new InvalidStatusTransitionError(
      `현재 상태(${purchase.status.label})에서는 ${actionName}할 수 없습니다. ${allowedLabels} 상태일 때만 가능합니다.`,
      {
        code: `INVALID_PURCHASE_${actionName.toUpperCase()}`,
        details: {
          currentStatus: purchase.status.code,
          allowedStatuses: allowedStatuses.map((s) => s.code),
        },
      }
    )
  }
}

/**
 * 발주 ID로 엔티티 조회 및 존재 여부 검증
 */
const getPurchaseEntityById = async (purchaseId: string): Promise<PurchaseEntity> => {
  const purchase = await getPurchaseById(purchaseId)

  if (!purchase) {
    throw new NotFoundError('발주를 찾을 수 없습니다')
  }

  const purchaseEntity = toPurchaseEntity(purchase)
  if (!purchaseEntity) {
    throw new NotFoundError('발주를 찾을 수 없습니다')
  }

  return purchaseEntity
}

export const getPurchasesForStore = async (filter: PurchasesFilterInput) => {
  const { purchases, pagination } = await _getPurchasesForStore(filter)

  return { purchases: toPurchaseEntities(purchases), pagination }
}

export const getPurchasesForHQ = async (filter: PurchasesFilterInput) => {
  const { purchases, pagination } = await _getPurchasesForHQ(filter)

  return { purchases: toPurchaseEntities(purchases), pagination }
}

export const updatePurchase = async (input: PurchaseUpdateInput) => {
  const purchaseEntity = await getPurchaseEntityById(input.id)

  // 요청/취소/거부 상태일 때 수정 가능 (취소/거부는 재신청)
  validatePurchaseStatus(
    purchaseEntity,
    [PurchaseStatus.REQUESTED, PurchaseStatus.CANCELLED, PurchaseStatus.REJECTED],
    '수정/재신청'
  )

  const updated = await _updatePurchase(input)

  return toPurchaseEntity(updated)
}

export const createPurchase = async (input: PurchaseCreateInput) => {
  const purchase = await _createPurchase(input)

  return toPurchaseEntity(purchase)
}

/**
 * 발주 승인
 * - 요청(REQUESTED) 상태일 때만 승인 가능
 */
export const approvePurchase = async (purchaseId: string) => {
  const purchaseEntity = await getPurchaseEntityById(purchaseId)

  validatePurchaseStatus(purchaseEntity, [PurchaseStatus.REQUESTED], '승인')

  const updated = await _approvePurchase(purchaseId)

  return toPurchaseEntity(updated)
}

/**
 * 발주 거부
 * - 요청(REQUESTED) 상태일 때만 거부 가능
 */
export const rejectPurchase = async (purchaseId: string, rejectionReason: string) => {
  const purchaseEntity = await getPurchaseEntityById(purchaseId)

  validatePurchaseStatus(purchaseEntity, [PurchaseStatus.REQUESTED], '거부')

  if (!rejectionReason || rejectionReason.trim() === '') {
    throw new InvalidStatusTransitionError('거부 사유를 입력해주세요', {
      code: 'REJECTION_REASON_REQUIRED',
    })
  }

  const updated = await _rejectPurchase(purchaseId, rejectionReason)

  return toPurchaseEntity(updated)
}

/**
 * 출고 처리
 * - 승인(APPROVED) 상태일 때만 출고 가능
 */
export const shipPurchase = async (purchaseId: string) => {
  const purchaseEntity = await getPurchaseEntityById(purchaseId)

  validatePurchaseStatus(purchaseEntity, [PurchaseStatus.APPROVED], '출고')

  const updated = await _shipPurchase(purchaseId)

  return toPurchaseEntity(updated)
}

/**
 * 입고(배송완료) 처리
 * - 출고(DELIVERY_STARTED) 상태일 때만 입고 가능
 */
export const deliverPurchase = async (purchaseId: string) => {
  const purchaseEntity = await getPurchaseEntityById(purchaseId)

  validatePurchaseStatus(purchaseEntity, [PurchaseStatus.DELIVERY_STARTED], '입고')

  const updated = await _deliverPurchase(purchaseId)

  return toPurchaseEntity(updated)
}

/**
 * 발주 취소
 * - 요청(REQUESTED), 승인(APPROVED) 상태일 때만 취소 가능
 * - 출고, 입고, 거부, 이미 취소된 상태에서는 취소 불가
 */
export const cancelPurchase = async (purchaseId: string) => {
  const purchaseEntity = await getPurchaseEntityById(purchaseId)

  validatePurchaseStatus(purchaseEntity, [PurchaseStatus.REQUESTED, PurchaseStatus.APPROVED], '취소')

  const updated = await _cancelPurchase(purchaseId)

  return toPurchaseEntity(updated)
}
