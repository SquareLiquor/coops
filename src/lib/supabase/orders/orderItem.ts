import { OrderStatus } from '$lib/types'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

export const getOrderItemById = async (orderItemId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('order_items').select('*').eq('id', orderItemId).maybeSingle()

  return { orderItem: data }
}

export const getOrderItemsByOrderId = async (orderId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId)

  return { orderItems: data }
}

export const checkOrderItemConfirmable = async (orderItemId: string) => {
  const { orderItem } = await getOrderItemById(orderItemId)

  return orderItem?.status === OrderStatus.CREATED.code
}
export const confirmOrderItem = async (orderItemId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const confirmable = await checkOrderItemConfirmable(orderItemId)

  if (!confirmable) {
    throw new Error('Order item is not confirmable')
  }

  const { data, error } = await supabase
    .from('order_items')
    .update({ status: OrderStatus.COMPLETED.code })
    .eq('id', orderItemId)
    .select()
    .maybeSingle()

  if (error) throw error

  return { orderItem: data }
}

export const checkOrderItemCancelable = async (orderItemId: string) => {
  const { orderItem } = await getOrderItemById(orderItemId)

  return orderItem?.status === OrderStatus.CREATED.code || orderItem?.status === OrderStatus.COMPLETED.code
}

export const cancelOrderItem = async (orderItemId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const cancelable = await checkOrderItemCancelable(orderItemId)

  if (!cancelable) {
    throw new Error('Order item is not cancelable')
  }

  const { data, error } = await supabase
    .from('order_items')
    .update({ status: OrderStatus.CANCELLED.code })
    .eq('id', orderItemId)
    .select()
    .maybeSingle()

  if (error) throw error

  return { orderItem: data }
}

export const checkOrderItemRestorable = async (orderItemId: string) => {
  const { orderItem } = await getOrderItemById(orderItemId)

  return orderItem?.status === OrderStatus.CANCELLED.code
}
export const restoreOrderItem = async (orderItemId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const restorable = await checkOrderItemRestorable(orderItemId)

  if (!restorable) {
    throw new Error('Order item is not restorable')
  }

  const { data, error } = await supabase
    .from('order_items')
    .update({ status: OrderStatus.CREATED.code })
    .eq('id', orderItemId)
    .select()
    .maybeSingle()

  if (error) throw error

  return { orderItem: data }
}
