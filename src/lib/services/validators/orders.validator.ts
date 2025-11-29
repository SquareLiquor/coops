import * as coopsRepository from '$lib/database/repositories/coops.repository'
import { BusinessLogicError, QuantityExceededError } from '$lib/errors'
import type { OrderItemCreateInput } from '$lib/schemas'

/**
 * 주문 생성 전 검증
 */
export const validateOrderCreation = async (items: OrderItemCreateInput[]) => {
  for (const item of items) {
    await checkCoopAvailability(item.coopId, item.quantity)
  }
}

/**
 * 공동구매 주문 가능 여부 체크
 */
const checkCoopAvailability = async (coopId: string, requestedQuantity: number) => {
  const quantityInfo = await coopsRepository.getCoopQuantityInfo(coopId)

  // 공동구매 상태 체크
  if (quantityInfo.status !== 'ONGOING') {
    throw new BusinessLogicError(`'${quantityInfo.coopName}'는 현재 주문할 수 없습니다`, {
      code: 'COOP_NOT_ORDERABLE',
      details: { coopId, coopName: quantityInfo.coopName, status: quantityInfo.status },
    })
  }

  // 수량 체크
  if (requestedQuantity > quantityInfo.availableQuantity) {
    throw new QuantityExceededError(requestedQuantity, quantityInfo.availableQuantity, coopId, quantityInfo.coopName)
  }

  return quantityInfo
}
