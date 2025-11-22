import type { ConsumerOrdersFilterInput, OrderCreateInput, OrdersFilterInput } from '$lib/schemas'
import { OrderStatus } from '$lib/types'
import { isBrowser } from '@supabase/ssr'
import dayjs from 'dayjs'
import { createBrowserClient, createServerClient } from '../clients'

const ordersSelectQuery = `
  *,
  store:store_id(*),
  items:order_items(*, coop:coop_id(*, images:coop_images(*)))
`

// TODO: order view를 조회
export const getOrders = async (filter: OrdersFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { storeId, name, categoryId, status, dateFrom, dateTo } = filter

  const query = supabase.from('orders').select(ordersSelectQuery)

  if (storeId) query.eq('store_id', storeId)
  if (name) query.ilike('user_name', `%${name}%`)
  if (categoryId) query.eq('category_id', categoryId)
  if (status) query.eq('status', status)
  if (dateFrom) query.gte('ordered_at', dayjs(dateFrom).startOf('day').toISOString())
  if (dateTo) query.lte('ordered_at', dayjs(dateTo).endOf('day').toISOString())

  const { data, error } = await query.order('ordered_at', { ascending: false })

  return { orders: data }
}

export const getOrdersByUserId = async (filter: ConsumerOrdersFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { userId, status, dateAt } = filter

  const query = supabase.from('orders').select(ordersSelectQuery).eq('user_id', userId)

  if (status) query.eq('status', status)
  if (dateAt) {
    const start = dayjs(dateAt).startOf('day').toISOString()
    const end = dayjs(dateAt).endOf('day').toISOString()

    query.gte('ordered_at', start).lte('ordered_at', end)
  }

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
