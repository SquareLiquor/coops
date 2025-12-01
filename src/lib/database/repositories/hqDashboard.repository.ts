import { isBrowser } from '@supabase/ssr'
import dayjs from 'dayjs'
import { createBrowserClient, createServerClient } from '../clients'

// 이번달 통합 매출 통계
export async function getHQMonthlyStats() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const currentMonthStart = dayjs().startOf('month').toISOString()

  const { data, error } = await supabase
    .from('hq_total_monthly_sales')
    .select('*')
    .eq('month_start', currentMonthStart)
    .single()

  if (!data || error) {
    console.error('Failed to fetch HQ monthly stats:', error)
    return {
      month_start: currentMonthStart,
      total_sales: 0,
      total_orders: 0,
      completed_orders: 0,
      active_store_count: 0,
    }
  }

  return data
}

// 지난달 통합 매출 통계
export async function getHQPreviousMonthStats() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const previousMonthStart = dayjs().subtract(1, 'month').startOf('month').toISOString()

  const { data, error } = await supabase
    .from('hq_total_monthly_sales')
    .select('*')
    .eq('month_start', previousMonthStart)
    .single()

  if (error) {
    console.error('Failed to fetch HQ previous month stats:', error)
    return {
      month_start: previousMonthStart,
      total_sales: 0,
      total_orders: 0,
      completed_orders: 0,
      active_store_count: 0,
    }
  }

  return data
}

// 가맹점 승인 상태별 집계
export async function getHQApprovalStatusSummary() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase.from('hq_approval_status_summary').select('*')

  if (error) {
    console.error('Failed to fetch HQ approval status summary:', error)
    return []
  }

  return data || []
}

// 발주 상태별 집계
export async function getHQPurchaseStatusSummary() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase.from('hq_purchase_status_summary').select('*')

  if (error) {
    console.error('Failed to fetch HQ purchase status summary:', error)
    return []
  }

  return data || []
}

// 가맹점 운영 현황
export async function getHQStoreStatusSummary() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase.from('hq_store_status_summary').select('*').single()

  if (error) {
    console.error('Failed to fetch HQ store status summary:', error)
    return {
      total_stores: 0,
      active_stores: 0,
      inactive_stores: 0,
      branch_stores: 0,
      hq_stores: 0,
    }
  }

  return data
}

// 미승인 가맹점 매니저 수
export async function getHQPendingApprovalsCount() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { count, error } = await supabase
    .from('signup_approval_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  if (error) {
    console.error('Failed to fetch pending approvals count:', error)
    return 0
  }

  return count || 0
}

// 승인 대기중인 발주 수
export async function getHQPendingPurchasesCount() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { count, error } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'REQUESTED')

  if (error) {
    console.error('Failed to fetch pending purchases count:', error)
    return 0
  }

  return count || 0
}

// 진행중인 공동구매 수
export async function getHQOngoingCoopsCount() {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { count, error } = await supabase
    .from('coops')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ONGOING')

  if (error) {
    console.error('Failed to fetch ongoing coops count:', error)
    return 0
  }

  return count || 0
}

// 상품별 판매 현황 (상위 5개)
export async function getHQTopProducts(limit: number = 5) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase
    .from('hq_product_sales_summary')
    .select('*')
    .order('total_ordered_quantity', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch HQ top products:', error)
    return []
  }

  return data || []
}

// 발주가 많은 상품 (상위 5개)
export async function getHQTopPurchasedProducts(limit: number = 5) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase.from('hq_top_purchased_products').select('*').limit(limit)

  if (error) {
    console.error('Failed to fetch HQ top purchased products:', error)
    return []
  }

  return data || []
}

// 최근 승인 요청 (상위 5개)
export async function getHQRecentApprovalRequests(limit: number = 5) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase
    .from('signup_approval_requests')
    .select(
      `
			id,
			applicant_id,
			store_id,
			status,
			reason,
			created_at,
			applicant:applicant_id (
				id,
				name,
				email,
				phone
			),
			store:store_id (
				id,
				name,
				type
			)
		`
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch HQ recent approval requests:', error)
    return []
  }

  return data || []
}

// 최근 발주 요청 (상위 5개)
export async function getHQRecentPurchaseRequests(limit: number = 5) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { data, error } = await supabase
    .from('purchases')
    .select(
      `
			id,
			store_id,
			product_id,
			quantity,
			total_price,
			status,
			created_at,
			store:store_id (
				id,
				name
			),
			product:product_id (
				id,
				name,
				images:product_images(*)
			)
		`
    )
    .eq('status', 'REQUESTED')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch HQ recent purchase requests:', error)
    return []
  }

  return data || []
}

// 이번달 가맹점별 매출 (상위 5개)
export async function getHQTopStoresByRevenue(limit: number = 5) {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const currentMonthStart = dayjs().startOf('month').toISOString()

  const { data, error } = await supabase
    .from('hq_monthly_store_sales')
    .select('*')
    .eq('month_start', currentMonthStart)
    .order('total_sales', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch HQ top stores by revenue:', error)
    return []
  }

  return data || []
}
