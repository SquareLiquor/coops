import * as ordersRepository from '$lib/database/repositories/orders.repository'
import type { ConsumerOrdersFilterInput, OrderCreateInput, OrdersFilterInput } from '$lib/schemas'
import { OrderStatus } from '$lib/types'

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
  return await ordersRepository.createOrder(formData)
}

/**
 * 주문 삭제
 */
export const deleteOrderById = async (orderId: string) => {
  return await ordersRepository.deleteOrderById(orderId)
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
  return await ordersRepository.restoreOrder(orderId)
}

/**
 * 주문 아이템 생성
 */
export const createOrderItems = async (
  orderId: string,
  items: Array<{ coopId: string; quantity: number; price: number }>
) => {
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

/**
 * 주문 삭제
 */
export const deleteOrder = async (orderId: string) => {
  return await ordersRepository.deleteOrder(orderId)
}
