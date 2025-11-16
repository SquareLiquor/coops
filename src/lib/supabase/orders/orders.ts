import { orderDataConverter } from '$lib/converters'
import type { OrderCreateInput, OrdersFilterInput } from '$lib/schemas'
import { OrderStatus } from '$lib/types'
import { isBrowser } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '../clients'

const { convert, convertAll } = orderDataConverter()

const ordersSelectQuery = `
  *,
  store:store_id(*),
  items:order_items(*, coop:coop_id(*, images:coop_images(*)))
`

// order view를 조회
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

  if (error) throw error

  return { orders: data ? convertAll(data) : [] }
}

export const getOrdersByUserId = async (user: User) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('orders')
    .select(ordersSelectQuery)
    .eq('user_id', user.id)
    .order('ordered_at', { ascending: false })

  if (error) throw error

  return { orders: data ? convertAll(data) : [] }
}

export const getOrderById = async (orderId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()

  if (error) throw error

  return { order: convert(data) }
}

export const createOrder = async (formData: OrderCreateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { user_id, user_name, store_id, total_price } = formData

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id,
      user_name,
      store_id,
      total_price,
      status: OrderStatus.ORDERED.code,
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
