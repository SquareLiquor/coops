import type { PurchasesFilterInput } from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import dayjs from 'dayjs'
import { createBrowserClient, createServerClient } from '../clients'
import { paginate } from '../utils/pagination.util'

const purchasesSelectQuery = `
  *,
  coop:coop_id(*),
  store:store_id(*),
  product:product_id(*),
  origin_product:origin_product_id(*),
  category:category_id(*)
`

export const getPurchasesForStore = async (filter: PurchasesFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, status, dateFrom, dateTo, page, pageSize } = filter

  let query = supabase.from('store_purchase_view').select('*', { count: 'exact' })

  if (storeId) query = query.eq('store_id', storeId)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (status) query = query.eq('status', status)
  if (dateFrom) query = query.gte('requested_date', dayjs(dateFrom).startOf('day').toISOString())
  if (dateTo) query = query.lte('requested_date', dayjs(dateTo).endOf('day').toISOString())

  const result = await paginate(query.order('requested_date', { ascending: false }), { page, pageSize }).execute()

  return {
    purchases: result.data,
    pagination: result.pagination,
  }
}

export const getPurchasesForHQ = async () => {}
