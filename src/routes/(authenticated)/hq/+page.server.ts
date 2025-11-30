
import { getApprovalRequests } from '$lib/services/auth.service';
import { getPurchasesForHQ } from '$lib/services/purchases.service';
import { getStores } from '$lib/services/stores.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 매장 정보
  const storesResult = await getStores({ page: 1, pageSize: 5 });
  // 최근 발주 현황
  const purchasesResult = await getPurchasesForHQ({ page: 1, pageSize: 5 });

  // 최근 사용자 승인 요청 현황
  const approvalResult = await getApprovalRequests({ page: 1, pageSize: 5 });

  return {
    stores: storesResult?.stores ?? [],
    recentPurchases: purchasesResult?.purchases ?? [],
    recentApprovals: approvalResult?.data ?? [],
  };
};
