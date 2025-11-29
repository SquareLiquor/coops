import * as ordersRepository from '$lib/database/repositories/orders.repository'
import { BusinessLogicError } from '$lib/errors'
import type { ConsumerOrdersFilterInput, OrderCreateInput, OrderItemCreateInput, OrdersFilterInput } from '$lib/schemas'
import { OrderStatus } from '$lib/types'
import * as ordersValidator from './validators/orders.validator'

/**
 * 주문 목록 조회 (관리자용, 페이징)
 */
export const getOrders = async (filter: OrdersFilterInput) => {
  return await ordersRepository.getOrders(filter)
}

/**
 * 사용자별 주문 목록 조회
 */
export const getOrdersByUserId = async (filter: ConsumerOrdersFilterInput) => {
  return await ordersRepository.getOrdersByUserId(filter)
}

/**
 * 주문 상세 조회
 */
export const getOrderById = async (orderId: string) => {
  return await ordersRepository.getOrderById(orderId)
}

/**
 * 주문 생성
 */
export const createOrder = async (formData: OrderCreateInput) => {
  // 주문 생성 전 검증
  await ordersValidator.validateOrderCreation(formData.items)

  // 주문 생성
  const orderResult = await ordersRepository.createOrder(formData)

  if (!orderResult.order) {
    throw new BusinessLogicError('주문 생성에 실패했습니다')
  }

  // 주문 아이템 생성
  await createOrderItems(orderResult.order.id, formData.items)

  return orderResult
}

/**
 * 주문 삭제
 */
export const deleteOrder = async (orderId: string) => {
  return await ordersRepository.deleteOrder(orderId)
}

/**
 * 주문 확인 가능 여부 체크
 */
export const checkConfirmable = async (orderId: string) => {
  return await ordersRepository.checkConfirmable(orderId)
}

/**
 * 주문 확인
 */
export const confirmOrder = async (orderId: string) => {
  const confirmable = await ordersRepository.checkConfirmable(orderId)

  if (!confirmable) {
    throw new BusinessLogicError('주문 확인이 불가능한 상태입니다', {
      code: 'ORDER_NOT_CONFIRMABLE',
    })
  }

  return await ordersRepository.confirmOrder(orderId)
}

/**
 * 주문 취소 가능 여부 체크
 */
export const checkCancelable = async (orderId: string) => {
  return await ordersRepository.checkCancelable(orderId)
}

/**
 * 주문 취소
 */
export const cancelOrder = async (orderId: string) => {
  const cancelable = await ordersRepository.checkCancelable(orderId)

  if (!cancelable) {
    throw new BusinessLogicError('주문 취소가 불가능한 상태입니다', {
      code: 'ORDER_NOT_CANCELABLE',
    })
  }

  return await ordersRepository.cancelOrder(orderId)
}

/**
 * 주문 복구 가능 여부 체크
 */
export const checkRestorable = async (orderId: string) => {
  return await ordersRepository.checkRestorable(orderId)
}

/**
 * 주문 복구
 */
export const restoreOrder = async (orderId: string) => {
  const restorable = await ordersRepository.checkRestorable(orderId)

  if (!restorable) {
    throw new BusinessLogicError('주문 복구가 불가능한 상태입니다', {
      code: 'ORDER_NOT_RESTORABLE',
    })
  }

  return await ordersRepository.restoreOrder(orderId)
}

/**
 * 주문 아이템 생성
 */
export const createOrderItems = async (orderId: string, items: OrderItemCreateInput[]) => {
  return await ordersRepository.createOrderItems(
    items.map((item) => ({
      order_id: orderId,
      coop_id: item.coopId,
      quantity: item.quantity,
      price: item.price,
      total_price: item.quantity * item.price,
      status: OrderStatus.CREATED.code,
    }))
  )
}
