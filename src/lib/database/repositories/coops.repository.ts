import { toCoopEntities, toCoopEntity } from '$lib/converters/coop.converter'
import type {
  ConsumerCoopsFilterSchema,
  CoopCreateInput,
  CoopsFilterInput,
  CoopUpdateInput,
  ImageInput,
} from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import dayjs from 'dayjs'
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
  const query = supabase.from('coop_list_view').select(coopSelectQuery).eq('store_id', storeId)

  if (categoryId) query.eq('category_id', categoryId)
  if (name) query.ilike('name', `%${name}%`)
  if (status) query.eq('status', status)
  if (dateFrom) query.gte('sales_date', dayjs(dateFrom).startOf('day').toISOString())
  if (dateTo) query.lte('sales_date', dayjs(dateTo).endOf('day').toISOString())

  const { data, error } = await query
    .order('sales_date', { ascending: false })
    .order('created_at', { ascending: false })

  return { coops: toCoopEntities(data) }
}

export const getCoopsForUser = async (filter: ConsumerCoopsFilterSchema) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, dateAt } = filter
  const query = supabase.from('coop_list_view').select(coopSelectQuery).eq('store_id', storeId).eq('status', 'ONGOING')

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

export const updateCoopImages = async (coopId: string, images: ImageInput[]) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { error: deleteError } = await supabase.from('coop_images').delete().eq('coop_id', coopId)

  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from('coop_images').insert(
    images
      .filter((image) => image.use)
      .map((image, index) => ({
        coop_id: coopId,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sort_order: index,
      }))
  )

  if (insertError) throw insertError
}
