import { isBrowser } from '@supabase/ssr'
import dayjs from 'dayjs'
import { createBrowserClient, createServerClient } from '../clients'

/**
 * 이번달 매출 및 주문 통계 조회
 */
export const getMonthlyStats = async (storeId: string, yearMonth?: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const targetMonth = yearMonth
    ? dayjs(yearMonth).startOf('month').toISOString()
    : dayjs().startOf('month').toISOString()

  const { data, error } = await supabase
    .from('store_monthly_sales_stats')
    .select('*')
    .eq('store_id', storeId)
    .eq('month_start', targetMonth)
    .maybeSingle()

  if (error) throw error

  return (
    data || {
      store_id: storeId,
      month_start: targetMonth,
      total_sales: 0,
      total_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      pending_orders: 0,
      avg_order_amount: 0,
    }
  )
}

/**
 * 전월 매출 및 주문 통계 조회 (비교용)
 */
export const getPreviousMonthStats = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const previousMonth = dayjs().subtract(1, 'month').startOf('month').toISOString()

  const { data, error } = await supabase
    .from('store_monthly_sales_stats')
    .select('*')
    .eq('store_id', storeId)
    .eq('month_start', previousMonth)
    .maybeSingle()

  if (error) throw error

  return (
    data || {
      store_id: storeId,
      month_start: previousMonth,
      total_sales: 0,
      total_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      pending_orders: 0,
      avg_order_amount: 0,
    }
  )
}

/**
 * 주문 상태별 집계 조회
 */
export const getOrderStatusSummary = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('store_order_status_summary').select('*').eq('store_id', storeId)

  if (error) throw error

  return data || []
}

/**
 * 발주 상태별 집계 조회
 */
export const getPurchaseStatusSummary = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('store_purchase_status_summary').select('*').eq('store_id', storeId)

  if (error) throw error

  return data || []
}

/**
 * 진행중인 공동구매 통계 조회
 */
export const getActiveCoopsStats = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('store_active_coops_stats').select('*').eq('store_id', storeId)

  if (error) throw error

  return data || []
}

/**
 * 미확인 주문 건수 조회 (CREATED 상태)
 */
export const getUnconfirmedOrdersCount = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('status', 'CREATED')

  if (error) throw error

  return count || 0
}

/**
 * 마감 임박 공동구매 조회 (48시간 이내)
 */
export const getClosingSoonCoops = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const now = dayjs()
  const after48Hours = now.add(48, 'hour').toISOString()

  const { data, error } = await supabase
    .from('coop_overview_view')
    .select('id, name, sales_date, max_quantity, ordered_quantity')
    .eq('store_id', storeId)
    .eq('status', 'ONGOING')
    .lte('sales_date', after48Hours)
    .gte('sales_date', now.toISOString())
    .order('sales_date', { ascending: true })
    .limit(5)

  if (error) throw error

  return data || []
}

/**
 * 승인 대기중인 발주 건수 조회
 */
export const getPendingPurchasesCount = async (storeId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { count, error } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('status', 'REQUESTED')

  if (error) throw error

  return count || 0
}
