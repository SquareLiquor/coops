import type { ConsumerOrdersFilterInput, OrderCreateInput, OrdersFilterInput } from '$lib/schemas'
import { OrderStatus } from '$lib/types'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

const ordersSelectQuery = `
  *,
  store:store_id(*),
  items:order_items(*, coop:coop_id(*, images:coop_images(*)))
`

// TODO: order view를 조회
export const getOrders = async (filter: OrdersFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const query = supabase.from('orders').select(ordersSelectQuery)

  if (filter.storeId) query.eq('store_id', filter.storeId)
  if (filter.name) query.ilike('user_name', `%${filter.name}%`)
  if (filter.categoryId) query.eq('category_id', filter.categoryId)
  if (filter.status) query.eq('status', filter.status)
  if (filter.dateFrom) query.gte('ordered_at', [filter.dateFrom, '00:00:00'].join(' '))
  if (filter.dateTo) query.lte('ordered_at', [filter.dateTo, '23:59:59'].join(' '))

  const { data, error } = await query.order('ordered_at', { ascending: false })

  return { orders: data }
}

export const getOrdersByUserId = async (filter: ConsumerOrdersFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const query = supabase.from('orders').select(ordersSelectQuery).eq('user_id', filter.userId)

  if (filter.status) query.eq('status', filter.status)
  if (filter.dateAt) query.eq('ordered_at', filter.dateAt)

  const { data, error } = await query.order('ordered_at', { ascending: false })

  return { orders: data }
}

export const getOrderById = async (orderId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()

  return { order: data }
}

export const createOrder = async (formData: OrderCreateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { userId, userName, storeId, totalPrice } = formData

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      user_name: userName,
      store_id: storeId,
      total_price: totalPrice,
      status: OrderStatus.CREATED.code,
    })
    .select()
    .maybeSingle()

  if (error) throw error

  return { data }
}

export const deleteOrderById = async (orderId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { error } = await supabase.from('orders').delete().eq('id', orderId)

  if (error) throw error
}

export const confirmOrder = async (orderId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const confimable = await checkConfirmable(orderId)

  if (!confimable) {
    throw new Error('Order is not confirmable')
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: OrderStatus.COMPLETED.code })
    .eq('id', orderId)
    .select()
    .maybeSingle()

  return { order: data }
}

export const cancelOrder = async (orderId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const cancelable = await checkCancelable(orderId)

  if (!cancelable) {
    throw new Error('Order is not cancelable')
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: OrderStatus.CANCELLED.code })
    .eq('id', orderId)
    .select()
    .maybeSingle()

  if (error) throw error

  return { order: data }
}

export const checkConfirmable = async (orderId: string) => {
  const { order } = await getOrderById(orderId)

  return order?.status === OrderStatus.CREATED.code
}

export const checkCancelable = async (orderId: string) => {
  const { order } = await getOrderById(orderId)

  return order?.status === OrderStatus.CREATED.code
}
