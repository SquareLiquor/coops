import type { PurchasesFilterInput } from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import dayjs from 'dayjs'
import { createBrowserClient, createServerClient } from '../clients'

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

  const { storeId, categoryId, status, dateFrom, dateTo } = filter

  const query = supabase.from('store_purchase_view').select('*')

  if (storeId) query.eq('store_id', storeId)
  if (categoryId) query.eq('category_id', categoryId)
  if (status) query.eq('status', status)
  if (dateFrom) query.gte('requested_date', dayjs(dateFrom).startOf('day').toISOString())
  if (dateTo) query.lte('requested_date', dayjs(dateTo).endOf('day').toISOString())

  const { data, error } = await query.order('requested_date', { ascending: false })

  return { purchases: data }
}

export const getPurchasesForHQ = async () => {}
