import type { ConsumerCoopsFilterSchema, CoopsFilterInput } from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient } from '../clients/browser'
import { createServerClient } from '../clients/server'

const coopSelectQuery = `
  *,
  store:store_id(*),
  images:coop_images(*),
  product:product_id(*),
  category:category_id(*)
`

export const getCoopsByStore = async (filter: CoopsFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, name, status, dateFrom, dateTo } = filter
  const query = supabase.from('coops').select(coopSelectQuery).eq('store_id', storeId)

  if (categoryId) query.eq('category_id', categoryId)
  if (name) query.ilike('name', `%${name}%`)
  if (status) query.eq('status', status)
  if (dateFrom) query.gte('sales_date', dateFrom)
  if (dateTo) query.lte('sales_date', dateTo)

  const { data, error } = await query
    .order('sales_date', { ascending: false })
    .order('created_at', { ascending: false })

  return { coops: data }
}

export const getCoopsForUser = async (filter: ConsumerCoopsFilterSchema) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, status, dateAt } = filter
  const query = supabase.from('coops').select(coopSelectQuery).eq('store_id', storeId)

  if (status) query.eq('status', status)
  if (dateAt) query.eq('sales_date', dateAt)

  const { data, error } = await query
    .order('sales_date', { ascending: false })
    .order('created_at', { ascending: false })

  return { coops: data }
}

export const getCoopById = async (coopId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('coops').select(coopSelectQuery).eq('id', coopId).maybeSingle()

  return { coop: data }
}
