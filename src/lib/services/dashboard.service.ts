import * as dashboardRepository from '$lib/database/repositories/dashboard.repository'

export interface MonthlyStatsData {
  totalSales: number
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  pendingOrders: number
  avgOrderAmount: number
  salesGrowthRate: number // 전월 대비 증감률
  ordersGrowthRate: number // 전월 대비 증감률
}

export interface OrderStatusStat {
  status: string
  count: number
  amount: number
}

export interface PurchaseStatusStat {
  status: string
  count: number
  amount: number
}

export interface ActiveCoopsStat {
  status: string
  count: number
  totalMaxQuantity: number
  totalOrderedQuantity: number
  achievementRate: number // 달성률
}

export interface DashboardData {
  monthlyStats: MonthlyStatsData
  orderStatusStats: OrderStatusStat[]
  purchaseStatusStats: PurchaseStatusStat[]
  activeCoopsStats: ActiveCoopsStat[]
  unconfirmedOrdersCount: number
  closingSoonCoops: any[]
  pendingPurchasesCount: number
}

/**
 * 대시보드 전체 데이터 조회
 */
export const getDashboardData = async (storeId: string): Promise<DashboardData> => {
  // 병렬로 모든 데이터 조회
  const [
    currentMonthStats,
    previousMonthStats,
    orderStatusStats,
    purchaseStatusStats,
    activeCoopsStats,
    unconfirmedOrdersCount,
    closingSoonCoops,
    pendingPurchasesCount,
  ] = await Promise.all([
    dashboardRepository.getMonthlyStats(storeId),
    dashboardRepository.getPreviousMonthStats(storeId),
    dashboardRepository.getOrderStatusSummary(storeId),
    dashboardRepository.getPurchaseStatusSummary(storeId),
    dashboardRepository.getActiveCoopsStats(storeId),
    dashboardRepository.getUnconfirmedOrdersCount(storeId),
    dashboardRepository.getClosingSoonCoops(storeId),
    dashboardRepository.getPendingPurchasesCount(storeId),
  ])

  // 전월 대비 증감률 계산
  const salesGrowthRate =
    previousMonthStats.total_sales > 0
      ? ((currentMonthStats.total_sales - previousMonthStats.total_sales) / previousMonthStats.total_sales) * 100
      : currentMonthStats.total_sales > 0
        ? 100
        : 0

  const ordersGrowthRate =
    previousMonthStats.total_orders > 0
      ? ((currentMonthStats.total_orders - previousMonthStats.total_orders) / previousMonthStats.total_orders) * 100
      : currentMonthStats.total_orders > 0
        ? 100
        : 0

  // 월간 통계 데이터 가공
  const monthlyStats: MonthlyStatsData = {
    totalSales: Number(currentMonthStats.total_sales),
    totalOrders: Number(currentMonthStats.total_orders),
    completedOrders: Number(currentMonthStats.completed_orders),
    cancelledOrders: Number(currentMonthStats.cancelled_orders),
    pendingOrders: Number(currentMonthStats.pending_orders),
    avgOrderAmount: Number(currentMonthStats.avg_order_amount),
    salesGrowthRate: Number(salesGrowthRate.toFixed(1)),
    ordersGrowthRate: Number(ordersGrowthRate.toFixed(1)),
  }

  // 주문 상태별 통계 데이터 가공
  const orderStats: OrderStatusStat[] = orderStatusStats.map((stat) => ({
    status: stat.status,
    count: Number(stat.order_count),
    amount: Number(stat.total_amount),
  }))

  // 발주 상태별 통계 데이터 가공
  const purchaseStats: PurchaseStatusStat[] = purchaseStatusStats.map((stat) => ({
    status: stat.status,
    count: Number(stat.purchase_count),
    amount: Number(stat.total_amount),
  }))

  // 진행중인 공동구매 통계 데이터 가공
  const coopsStats: ActiveCoopsStat[] = activeCoopsStats.map((stat) => ({
    status: stat.status,
    count: Number(stat.coop_count),
    totalMaxQuantity: Number(stat.total_max_quantity),
    totalOrderedQuantity: Number(stat.total_ordered_quantity),
    achievementRate:
      stat.total_max_quantity > 0
        ? Number(((stat.total_ordered_quantity / stat.total_max_quantity) * 100).toFixed(1))
        : 0,
  }))

  return {
    monthlyStats,
    orderStatusStats: orderStats,
    purchaseStatusStats: purchaseStats,
    activeCoopsStats: coopsStats,
    unconfirmedOrdersCount,
    closingSoonCoops,
    pendingPurchasesCount,
  }
}
