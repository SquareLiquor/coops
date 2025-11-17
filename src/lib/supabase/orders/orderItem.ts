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

export const cancelOrderItem = async (orderItemId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const cancelable = await checkCancelable(orderItemId)

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

const checkCancelable = async (orderItemId: string) => {
  const { orderItem } = await getOrderItemById(orderItemId)

  return orderItem?.status === OrderStatus.ORDERED.code
}
