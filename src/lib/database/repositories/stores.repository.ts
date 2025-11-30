import { toStoreEntities, toStoreEntity, toStoreMemberEntity } from '$lib/converters/store.converter'
import { BusinessLogicError } from '$lib/errors'
import type { StoreCreateInput, StoresFilterInput, StoreUpdateInput } from '$lib/schemas'
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

  const { storeName, type, page, pageSize } = filter

  let query = supabase.from('stores').select('*', { count: 'exact' })

  if (storeName) query = query.or(`name.ilike.%${storeName}%`)
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

  const { data, error } = await supabase.from('stores').select('*').eq('id', id).maybeSingle()

  if (error) throw error

  return { store: toStoreEntity(data) }
}

export const createStore = async (formData: StoreCreateInput) => {
  const supabase = createServerClient()

  const { name, type, phone, address } = formData

  
  const { data, error } = await supabase
    .from('stores')
    .insert({
      name,
      type,
      phone: phone || null,
      address: address?.address || null,
      address_detail: address?.addressDetail || null,
      address_type: address ? address.addressType : null,
      road_address: address?.roadAddress || null,
      jibun_address: address?.jibunAddress || null,
      zipcode: address?.zipcode || null,
      building_name: address?.buildingName || null,
      latitude: address?.latitude || null,
      longitude: address?.longitude || null,
    })
    .select('*')
    .maybeSingle()

  if (error) {
    throw new BusinessLogicError('매장 생성에 실패했습니다.', { 
      code: 'STORE_CREATE_FAILED', 
      details: { error: error.message }, })
  }

  return { store: toStoreEntity(data) }
}

export const updateStore = async (formData: StoreUpdateInput) => {
  const supabase = createServerClient()

  const { id, name, type, phone, address, active } = formData

  const { data, error } = await supabase
    .from('stores')
    .update({
      name,
      type,
      phone: phone || null,
      address: address?.address || null,
      address_detail: address?.addressDetail || null,
      address_type: address ? address.addressType : null,
      road_address: address?.roadAddress || null,
      jibun_address: address?.jibunAddress || null,
      zipcode: address?.zipcode || null,
      building_name: address?.buildingName || null,
      latitude: address?.latitude || null,
      longitude: address?.longitude || null,
      active
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    throw new BusinessLogicError('매장 수정에 실패했습니다.', { 
      code: 'STORE_UPDATE_FAILED', 
      details: { error: error.message }, })
  }

  return { store: toStoreEntity(data) }
}

export const getHQStore = async () => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('stores').select('*').eq('type', 'hq').maybeSingle()

  return { store: toStoreEntity(data) }
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
