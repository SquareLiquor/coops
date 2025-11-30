import { getCoopsByStore } from '$lib/services/coops.service'
import { getOrders } from '$lib/services/orders.service'
import { getPurchasesForStore } from '$lib/services/purchases.service'
import dayjs from 'dayjs'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();
  const store = parentData.store;
  const storeId = store?.id ?? '';
  const now = dayjs();
  const monthStart = now.startOf('month').toISOString();
  const monthEnd = now.endOf('month').toISOString();

  // 이번달 주문/매출
  const ordersResult = await getOrders({
    storeId,
    dateFrom: monthStart,
    dateTo: monthEnd,
    page: 1,
    pageSize: 5,
  });


  // 진행중 판매상품
  const coopsResult = await getCoopsByStore({
    storeId,
    status: 'ONGOING',
    page: 1,
    pageSize: 5,
  });

  // 최근 주문 현황
  const recentOrders = ordersResult.orders.slice(0, 5);

  // 최근 발주 현황
  const purchasesResult = await getPurchasesForStore({
    storeId,
    page: 1,
    pageSize: 5,
  });
  const recentPurchases = purchasesResult.purchases;

  return {
    activeProducts: coopsResult.coops, // 판매 상품
    recentOrders,
    recentPurchases,
    store,
  };
};
