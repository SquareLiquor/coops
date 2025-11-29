import { toCoopEntities, toCoopEntity } from '$lib/converters/coop.converter'
import { BusinessLogicError, NotFoundError } from '$lib/errors'
import type { ConsumerCoopsFilterSchema, CoopCreateInput, CoopsFilterInput, CoopUpdateInput } from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import dayjs from 'dayjs'
import { createBrowserClient } from '../clients/browser'
import { createServerClient } from '../clients/server'
import { paginate } from '../utils/pagination.util'

const coopSelectQuery = `
  *,
  store:store_id(*),
  images:coop_images(*),
  product:product_id(*),
  category:category_id(*)
`

export const getCoopsByStore = async (filter: CoopsFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, name, status, dateFrom, dateTo, page, pageSize } = filter

  let query = supabase.from('coop_overview_view').select(coopSelectQuery, { count: 'exact' }).eq('store_id', storeId)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (name) query = query.ilike('name', `%${name}%`)
  if (status) query = query.eq('status', status)
  if (dateFrom) query = query.gte('sales_date', dayjs(dateFrom).startOf('day').toISOString())
  if (dateTo) query = query.lte('sales_date', dayjs(dateTo).endOf('day').toISOString())

  const result = await paginate(
    query.order('sales_date', { ascending: false }).order('created_at', { ascending: false }),
    { page, pageSize }
  ).execute()

  return {
    coops: toCoopEntities(result.data),
    pagination: result.pagination,
  }
}

export const getCoopsForUser = async (filter: ConsumerCoopsFilterSchema) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, dateAt } = filter
  const query = supabase
    .from('coop_overview_view')
    .select(coopSelectQuery)
    .eq('store_id', storeId)
    .eq('status', 'ONGOING')

  if (categoryId) query.eq('category_id', categoryId)
  if (dateAt) {
    const start = dayjs(dateAt).startOf('day').toISOString()
    const end = dayjs(dateAt).endOf('day').toISOString()

    query.gte('sales_date', start).lte('sales_date', end)
  }

  const { data, error } = await query
    .order('sales_date', { ascending: false })
    .order('created_at', { ascending: false })

  return { coops: toCoopEntities(data) }
}

export const getCoopById = async (coopId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('coops').select(coopSelectQuery).eq('id', coopId).maybeSingle()

  return { coop: toCoopEntity(data) }
}

export const createCoop = async (formData: CoopCreateInput, productId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, name, categoryId, status, maxQuantity, salesPrice, salesDate, description } = formData

  const { data, error } = await supabase
    .from('coops')
    .insert({
      store_id: storeId,
      product_id: productId,
      category_id: categoryId,
      status,
      max_quantity: maxQuantity,
      sales_price: salesPrice,
      sales_date: salesDate,
      name,
      description,
    })
    .select('*')
    .maybeSingle()

  if (error) throw error

  return { coop: toCoopEntity(data) }
}

export const updateCoop = async (formData: CoopUpdateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { id, storeId, categoryId, name, description, status, maxQuantity, salesPrice, salesDate } = formData

  const { error: updateError } = await supabase
    .from('coops')
    .update({
      category_id: categoryId,
      name,
      description,
      status,
      max_quantity: maxQuantity,
      sales_price: salesPrice,
      sales_date: salesDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) throw updateError
}

export const deleteCoop = async (coopId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { error } = await supabase.from('coops').delete().eq('id', coopId)

  if (error) throw error
}

/**
 * 공동구매의 현재 주문량과 최대 수량 조회
 */
export const getCoopQuantityInfo = async (coopId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('coop_overview_view')
    .select('id, name, max_quantity, status, ordered_quantity')
    .eq('id', coopId)
    .maybeSingle()

  if (error || !data) {
    throw error
      ? new BusinessLogicError('판매 상품 조회에 실패했습니다', {
          code: 'COOP_QUERY_FAILED',
          details: { coopId, error: error.message },
        })
      : new NotFoundError('판매 상품을 찾을 수 없습니다', {
          code: 'COOP_NOT_FOUND',
          details: { coopId },
        })
  }

  return {
    coopId: data.id,
    coopName: data.name,
    maxQuantity: data.max_quantity,
    currentQuantity: data.ordered_quantity,
    status: data.status,
    availableQuantity: data.max_quantity - data.ordered_quantity,
  }
}
