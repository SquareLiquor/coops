import {
  getHQDashboardData,
  getRecentApprovalRequests,
  getRecentPurchaseRequests,
  getTopProducts,
  getTopPurchasedProducts,
  getTopStoresByRevenue,
} from '$lib/services/hqDashboard.service'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [dashboardData, topProducts, topPurchasedProducts, recentApprovals, recentPurchases, topStores] =
    await Promise.all([
      getHQDashboardData(),
      getTopProducts(5),
      getTopPurchasedProducts(5),
      getRecentApprovalRequests(5),
      getRecentPurchaseRequests(5),
      getTopStoresByRevenue(5),
    ])

  return {
    dashboardData,
    topProducts,
    topPurchasedProducts,
    recentApprovals,
    recentPurchases,
    topStores,
  }
}
