import { toStoreEntities, toStoreMemberEntity } from '$lib/converters/store.converter'
import type { StoresFilterInput } from '$lib/schemas'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'
import { paginate } from '../utils/pagination.util'

const storeSelectQuery = `
  *,
  store:store_id(*),
  profile:user_id(*)
`

export const getStores = async (filter: StoresFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { search, type, page, pageSize } = filter

  let query = supabase.from('stores').select('*', { count: 'exact' })

  if (search) query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`)
  if (type && type !== 'all') query = query.eq('type', type)

  query = query.order('type', { ascending: true }).order('name', { ascending: true })

  const result = await paginate(query, { page, pageSize }).execute()

  return {
    stores: toStoreEntities(result.data),
    pagination: result.pagination,
  }
}

export const getStoreById = async (id: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('stores_public').select('*').eq('id', id).maybeSingle()

  if (error) throw error

  return { store: data }
}

export const getHQStore = async () => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('stores').select('*').eq('type', 'hq').maybeSingle()

  return { store: data }
}

export const getStoreMemberByUserId = async (userId: string | undefined) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('store_members')
    .select(storeSelectQuery)
    .eq('user_id', userId)
    .maybeSingle()

  return { storeMember: toStoreMemberEntity(data) }
}

export const checkStoreMemberExists = async (storeId: string, userId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('store_members')
    .select('*')
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  return !!data
}

export const insertStoreMember = async (storeId: string, userId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('store_members')
    .insert({
      store_id: storeId,
      user_id: userId,
    })
    .select()

  if (error) throw error

  return { data }
}

export const deleteStoreMember = async (storeId: string, userId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('store_members')
    .delete()
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .select()

  if (error) throw error

  return { data }
}
