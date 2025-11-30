<script lang="ts">
  let { data } = $props()
  let activeProducts = data?.activeProducts ?? []
  let recentOrders = data?.recentOrders ?? []
  let recentPurchases = data?.recentPurchases ?? []

  function getPurchaseStatusBadge(statusCode: string) {
    switch (statusCode) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusBadge(statusCode: string) {
    switch (statusCode) {
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800'
      case 'ALMOST_FULL':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
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

  function getProgressPercentage(current: number, min: number): number {
    return Math.min((current / min) * 100, 100)
  }
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">대시보드</h1>
  </div>
  <!-- 현황 3단 그리드 -->
  <div class="grid gap-6 lg:grid-cols-3">
    <!-- 진행중 판매 상품 현황 -->
    <div class="rounded-xl bg-white shadow-sm">
      <div class="p-6">
        <div class="flex items-center justify-between pb-4">
          <h3 class="text-gray-900 text-lg font-semibold">진행중 판매 상품</h3>
          <a href="/admin/coops" class="text-primary-600 hover:text-primary-800 text-sm font-medium">더보기</a>
        </div>
        <div class="space-y-3">
          {#if activeProducts.length === 0}
            <div class="text-gray-400 text-center py-8">진행중인 판매 상품이 없습니다.</div>
          {:else}
            {#each activeProducts as product}
              <div class="hover:bg-gray-50 space-y-3 rounded-lg border border-gray-100 p-4 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <div class="text-gray-900 font-medium">{product.name}</div>
                    <div class="text-gray-600 text-sm">마감: {product.salesDate}</div>
                  </div>
                  <span
                    class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(product.status.code)}`}
                  >
                    {product.status.label}
                  </span>
                </div>
                <div class="space-y-2">
                  <div class="text-gray-600 flex justify-between text-sm">
                    <span>주문량</span>
                    <span>{product.orderedQuantity}/{product.maxQuantity}</span>
                  </div>
                  <div class="bg-gray-100 h-2 w-full rounded-full">
                    <div
                      class="bg-primary-500 h-2 rounded-full transition-all"
                      style="width: {getProgressPercentage(product.orderedQuantity, product.maxQuantity)}%"
                    ></div>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <!-- 최근 주문 현황 -->
    <div class="rounded-xl bg-white shadow-sm">
      <div class="p-6">
        <div class="flex items-center justify-between pb-4">
          <h3 class="text-gray-900 text-lg font-semibold">최근 주문 현황</h3>
          <a href="/admin/orders" class="text-primary-600 hover:text-primary-800 text-sm font-medium">더보기</a>
        </div>
        <div class="space-y-3">
          {#if recentOrders.length === 0}
            <div class="text-gray-400 text-center py-8">최근 주문 내역이 없습니다.</div>
          {:else}
            {#each recentOrders as order}
              <div
                class="hover:bg-gray-50 flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900 font-medium">{order.id}</span>
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(order.status.code)}`}
                    >
                      {order.status.label}
                    </span>
                  </div>
                  <div class="text-gray-600 text-sm">{order.userName} · {order.items?.[0]?.coop?.name ?? ''}</div>
                  <div class="text-gray-400 text-xs">{order.createdAt}</div>
                </div>
                <div class="text-right">
                  <div class="text-gray-900 font-semibold">{formatCurrency(order.totalPrice)}</div>
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
          <a href="/admin/purchases" class="text-primary-600 hover:text-primary-800 text-sm font-medium">더보기</a>
        </div>
        <div class="space-y-3">
          {#if recentPurchases.length === 0}
            <div class="text-gray-400 text-center py-8">최근 발주 내역이 없습니다.</div>
          {:else}
            {#each recentPurchases as purchase}
              <div
                class="hover:bg-gray-50 flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors"
              >
                <div class="space-y-1 w-full">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600 text-sm">
                      <span class="font-medium">신청 매장:</span>
                      {purchase.storeName ?? '-'}
                    </div>
                    {#if purchase.status}
                      <span
                        class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPurchaseStatusBadge(purchase.status.code)}`}
                      >
                        {purchase.status.label}
                      </span>
                    {:else}
                      <span
                        class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-300`}
                      >
                        발주 신청 전
                      </span>
                    {/if}
                  </div>
                  <div class="text-gray-600 text-sm">
                    <span class="font-medium">신청 상품:</span>
                    {purchase.coopName ?? '-'} · {purchase.quantity}{purchase.unit}
                  </div>
                  <div class="text-gray-400 text-xs">{purchase.requestedDate}</div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
