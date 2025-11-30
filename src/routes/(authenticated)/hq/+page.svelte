<script lang="ts">
  export let data
  let stores = data?.stores ?? []
  let recentPurchases = data?.recentPurchases ?? []
  let recentApprovals = data?.recentApprovals ?? []

  function getPurchaseStatusBadge(status: string) {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }
</script>

<svelte:head>
  <title>Dashboard - 본사</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">대시보드</h1>
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <!-- 매장 정보 -->
    <div class="rounded-xl bg-white shadow-sm">
      <div class="p-6">
        <div class="flex items-center justify-between pb-4">
          <h3 class="text-gray-900 text-lg font-semibold">매장 정보</h3>
          <a href="/hq/stores" class="text-primary-600 hover:text-primary-800 text-sm font-medium">더보기</a>
        </div>
        <div class="space-y-3">
          {#if stores.length === 0}
            <div class="text-gray-400 text-center py-8">등록된 매장이 없습니다.</div>
          {:else}
            {#each stores as store}
              <div
                class="hover:bg-gray-50 flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900 font-medium">{store.name}</span>
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {store.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-500'}"
                    >
                      {store.active ? '운영중' : '비활성'}
                    </span>
                  </div>
                  <div class="text-gray-600 text-sm">{store.address}</div>
                  <div class="text-gray-400 text-xs">{store.createdAt}</div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <!-- 최근 발주 현황 -->
    <div class="rounded-xl bg-white shadow-sm">
      <div class="p-6">
        <div class="flex items-center justify-between pb-4">
          <h3 class="text-gray-900 text-lg font-semibold">최근 발주 현황</h3>
          <a href="/hq/purchases" class="text-primary-600 hover:text-primary-800 text-sm font-medium">더보기</a>
        </div>
        <div class="space-y-3">
          {#if recentPurchases.length === 0}
            <div class="text-gray-400 text-center py-8">최근 발주 내역이 없습니다.</div>
          {:else}
            {#each recentPurchases as purchase}
              <div
                class="hover:bg-gray-50 flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900 font-medium">{purchase.storeName}</span>
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPurchaseStatusBadge(purchase.status.code)}`}
                    >
                      {purchase.status.label}
                    </span>
                  </div>
                  <div class="text-gray-600 text-sm">{purchase.productName} · {purchase.quantity}{purchase.unit}</div>
                  <div class="text-gray-400 text-xs">{purchase.requestedDate}</div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <!-- 승인 요청 현황 -->
    <div class="rounded-xl bg-white shadow-sm">
      <div class="p-6">
        <div class="flex items-center justify-between pb-4">
          <h3 class="text-gray-900 text-lg font-semibold">승인 요청 현황</h3>
          <a href="/hq/approvals" class="text-primary-600 hover:text-primary-800 text-sm font-medium">더보기</a>
        </div>
        <div class="space-y-3">
          {#if recentApprovals.length === 0}
            <div class="text-gray-400 text-center py-8">최근 승인 요청 내역이 없습니다.</div>
          {:else}
            {#each recentApprovals as approval}
              <div
                class="hover:bg-gray-50 flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900 font-medium">{approval.store?.name}</span>
                    <span class="text-gray-900 font-medium">{approval.applicant?.name}</span>
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(approval.status?.code)}`}
                    >
                      {approval.status?.label}
                    </span>
                  </div>
                  <div class="text-gray-600 text-sm">{approval.managerName ?? approval.manager}</div>
                  <div class="text-gray-600 text-sm">{approval.action}</div>
                  <div class="text-gray-400 text-xs">{approval.createdAt}</div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
