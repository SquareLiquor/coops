import {
  getHQApprovalStatusSummary,
  getHQMonthlyStats,
  getHQOngoingCoopsCount,
  getHQPendingApprovalsCount,
  getHQPendingPurchasesCount,
  getHQPreviousMonthStats,
  getHQPurchaseStatusSummary,
  getHQRecentApprovalRequests,
  getHQRecentPurchaseRequests,
  getHQStoreStatusSummary,
  getHQTopProducts,
  getHQTopPurchasedProducts,
  getHQTopStoresByRevenue,
} from '$lib/database/repositories/hqDashboard.repository'
import type { PurchaseStatus } from '$lib/types'

// 승인 상태별 통계
export interface ApprovalStatusStat {
  approval_status: string // 'pending', 'approved', 'rejected'
  approval_count: number
}

// 발주 상태별 통계
export interface PurchaseStatusStat {
  status: PurchaseStatus
  purchase_count: number
  total_amount: number
}

// 가맹점 운영 현황
export interface StoreStatusData {
  total_stores: number
  active_stores: number
  inactive_stores: number
  branch_stores: number
  hq_stores: number
}

// 월별 통계
export interface MonthlyStatsData {
  month_start: string
  total_sales: number
  total_orders: number
  completed_orders: number
  active_store_count: number
}

// 대시보드 전체 데이터
export interface HQDashboardData {
  // 월별 통계
  monthlyStats: MonthlyStatsData
  previousMonthStats: MonthlyStatsData

  // 승인 상태별 집계
  approvalStatusSummary: ApprovalStatusStat[]

  // 발주 상태별 집계
  purchaseStatusSummary: PurchaseStatusStat[]

  // 가맹점 운영 현황
  storeStatus: StoreStatusData

  // 긴급 처리 카운트
  pendingApprovalsCount: number
  pendingPurchasesCount: number
  ongoingCoopsCount: number
}

// 본사 대시보드 데이터 조회
export async function getHQDashboardData(): Promise<HQDashboardData> {
  const [
    monthlyStats,
    previousMonthStats,
    approvalStatusSummary,
    purchaseStatusSummary,
    storeStatus,
    pendingApprovalsCount,
    pendingPurchasesCount,
    ongoingCoopsCount,
  ] = await Promise.all([
    getHQMonthlyStats(),
    getHQPreviousMonthStats(),
    getHQApprovalStatusSummary(),
    getHQPurchaseStatusSummary(),
    getHQStoreStatusSummary(),
    getHQPendingApprovalsCount(),
    getHQPendingPurchasesCount(),
    getHQOngoingCoopsCount(),
  ])

  return {
    monthlyStats,
    previousMonthStats,
    approvalStatusSummary,
    purchaseStatusSummary,
    storeStatus,
    pendingApprovalsCount,
    pendingPurchasesCount,
    ongoingCoopsCount,
  }
}

// 상품별 판매 현황 조회
export async function getTopProducts(limit: number = 5) {
  return await getHQTopProducts(limit)
}

// 발주가 많은 상품 조회
export async function getTopPurchasedProducts(limit: number = 5) {
  return await getHQTopPurchasedProducts(limit)
}

// 최근 승인 요청 조회
export async function getRecentApprovalRequests(limit: number = 5) {
  return await getHQRecentApprovalRequests(limit)
}

// 최근 발주 요청 조회
export async function getRecentPurchaseRequests(limit: number = 5) {
  return await getHQRecentPurchaseRequests(limit)
}

// 매출 상위 가맹점 조회
export async function getTopStoresByRevenue(limit: number = 5) {
  return await getHQTopStoresByRevenue(limit)
}
