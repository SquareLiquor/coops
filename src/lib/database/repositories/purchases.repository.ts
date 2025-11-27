import type { PurchaseCreateInput, PurchaseUpdateInput, PurchasesFilterInput } from '$lib/schemas'
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

export const getPurchasesForHQ = async (filter: PurchasesFilterInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { storeId, categoryId, status, dateFrom, dateTo, page, pageSize } = filter

  let query = supabase.from('hq_purchase_view').select('*', { count: 'exact' })

  if (storeId) query = query.eq('store_id', storeId)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (status) query = query.eq('purchase_status', status)
  if (dateFrom) query = query.gte('requested_date', dayjs(dateFrom).startOf('day').toISOString())
  if (dateTo) query = query.lte('requested_date', dayjs(dateTo).endOf('day').toISOString())

  const result = await paginate(query.order('requested_date', { ascending: false }), { page, pageSize }).execute()

  return {
    purchases: result.data,
    pagination: result.pagination,
  }
}

export const getPurchaseById = async (purchaseId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('purchases').select('*').eq('id', purchaseId).maybeSingle()

  if (error) throw error

  return data
}

export const updatePurchase = async (input: PurchaseUpdateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  // 기존 상태 확인
  const { data: existing } = await supabase.from('purchases').select('status').eq('id', input.id).maybeSingle()

  // 취소/거부 상태에서 수정하는 경우 재신청으로 처리
  const isReRequest = existing?.status === 'CANCELLED' || existing?.status === 'REJECTED'

  const updateData: any = {
    quantity: input.quantity,
    price: input.price,
    unit: input.unit,
    total_price: input.totalPrice,
    notes: input.notes,
  }

  // 재신청 시 상태와 날짜 초기화
  if (isReRequest) {
    updateData.status = 'REQUESTED'
    updateData.requested_date = dayjs().toISOString()
    updateData.cancelled_date = null
    updateData.rejected_date = null
    updateData.rejection_reason = null
    updateData.approved_date = null
    updateData.shipped_date = null
  }

  const { data, error } = await supabase.from('purchases').update(updateData).eq('id', input.id).select().maybeSingle()

  if (error) throw error

  return data
}

export const createPurchase = async (input: PurchaseCreateInput) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('purchases')
    .insert({
      store_id: input.storeId,
      coop_id: input.coopId,
      product_id: input.productId,
      quantity: input.quantity,
      price: input.price,
      unit: input.unit,
      total_price: input.totalPrice,
      notes: input.notes,
      status: 'REQUESTED',
      requested_date: dayjs().toISOString(),
    })
    .select()
    .maybeSingle()

  if (error) throw error

  return data
}

export const approvePurchase = async (purchaseId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'APPROVED',
      approved_date: dayjs().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .maybeSingle()

  if (error) throw error

  return data
}

export const rejectPurchase = async (purchaseId: string, rejectionReason: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'REJECTED',
      rejected_date: dayjs().toISOString(),
      rejection_reason: rejectionReason,
    })
    .eq('id', purchaseId)
    .select()
    .maybeSingle()

  if (error) throw error

  return data
}

export const shipPurchase = async (purchaseId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'DELIVERY_STARTED',
      shipped_date: dayjs().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .maybeSingle()

  if (error) throw error

  return data
}

export const deliverPurchase = async (purchaseId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'DELIVERED',
      delivered_date: dayjs().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .maybeSingle()

  if (error) throw error

  return data
}

export const cancelPurchase = async (purchaseId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'CANCELLED',
      cancelled_date: dayjs().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .maybeSingle()

  if (error) throw error

  return data
}
