import { getCoopsByStore } from '$lib/services/coops.service'
import { getDashboardData } from '$lib/services/dashboard.service'
import { getOrders } from '$lib/services/orders.service'
import { getPurchasesForStore } from '$lib/services/purchases.service'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent()
  const store = parentData.store
  const storeId = store?.id ?? ''

  // 대시보드 통계 데이터 조회
  const dashboardData = await getDashboardData(storeId)

  // 진행중 판매상품 (최대 5개)
  const coopsResult = await getCoopsByStore({
    storeId,
    status: 'ONGOING',
    page: 1,
    pageSize: 5,
  })

  // 최근 주문 현황 (최대 5개)
  const ordersResult = await getOrders({
    storeId,
    page: 1,
    pageSize: 5,
  })

  // 최근 발주 현황 (최대 5개)
  const purchasesResult = await getPurchasesForStore({
    storeId,
    page: 1,
    pageSize: 5,
  })

  return {
    dashboardData,
    activeProducts: coopsResult.coops,
    recentOrders: ordersResult.orders,
    recentPurchases: purchasesResult.purchases,
    store,
  }
}
