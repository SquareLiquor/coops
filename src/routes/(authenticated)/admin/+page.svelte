<script lang="ts">
  import PageHeader from '$lib/components/layout/PageHeader.svelte'
  import type { DashboardData } from '$lib/services/dashboard.service'
  import type { CoopEntity, OrderEntity, PurchaseEntity } from '$lib/types'
  import { OrderStatus, PurchaseStatus } from '$lib/types'
  import dayjs from 'dayjs'

  interface PageData {
    dashboardData: DashboardData
    activeProducts: CoopEntity[]
    recentOrders: OrderEntity[]
    recentPurchases: PurchaseEntity[]
  }

  let { data }: { data: PageData } = $props()

  let dashboardData = $derived(data?.dashboardData)
  let activeProducts = $derived(data?.activeProducts ?? [])
  let recentOrders = $derived(data?.recentOrders ?? [])
  let recentPurchases = $derived(data?.recentPurchases ?? [])

  // 통계 데이터
  let monthlyStats = $derived(dashboardData?.monthlyStats)
  let orderStatusStats = $derived(dashboardData?.orderStatusStats ?? [])
  let purchaseStatusStats = $derived(dashboardData?.purchaseStatusStats ?? [])
  let unconfirmedOrdersCount = $derived(dashboardData?.unconfirmedOrdersCount ?? 0)
  let pendingPurchasesCount = $derived(dashboardData?.pendingPurchasesCount ?? 0)

  // 주문 상태별 레이블 매핑
  const orderStatusLabels: Record<string, string> = {
    CREATED: OrderStatus.CREATED.label,
    COMPLETED: OrderStatus.COMPLETED.label,
    CANCELLED: OrderStatus.CANCELLED.label,
    PARTIAL_CANCELLED: OrderStatus.PARTIAL_CANCELLED.label,
  }

  // 발주 상태별 레이블 매핑
  const purchaseStatusLabels: Record<string, string> = {
    REQUESTED: PurchaseStatus.REQUESTED.label,
    APPROVED: PurchaseStatus.APPROVED.label,
    DELIVERY_STARTED: PurchaseStatus.DELIVERY_STARTED.label,
    DELIVERED: PurchaseStatus.DELIVERED.label,
    REJECTED: PurchaseStatus.REJECTED.label,
    CANCELLED: PurchaseStatus.CANCELLED.label,
  }

  function getPurchaseStatusBadge(statusCode: string) {
    switch (statusCode) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERY_STARTED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
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
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ENDED':
        return 'bg-gray-100 text-gray-800'
      case 'CREATED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
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

  function formatNumber(num: number): string {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  function getProgressPercentage(current: number, max: number): number {
    if (max === 0) return 0
    return Math.min((current / max) * 100, 100)
  }

  function getGrowthIcon(rate: number): string {
    if (rate > 0) return '↑'
    if (rate < 0) return '↓'
    return '→'
  }

  function getGrowthColor(rate: number): string {
    if (rate > 0) return 'text-green-600'
    if (rate < 0) return 'text-red-600'
    return 'text-gray-600'
  }
</script>

<svelte:head>
  <title>대시보드 | 가맹점 관리</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <div class="mb-6">
    <PageHeader title="대시보드" />
    <p class="text-gray-600 mt-1">매장 운영 현황을 한눈에 확인하세요</p>
  </div>

  {#if monthlyStats}
    <div class="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">이번달 총 매출</p>
            <p class="text-gray-900 mt-2 text-2xl font-bold">{formatCurrency(monthlyStats.totalSales)}</p>
            {#if monthlyStats.totalSales > 0}
              <p class="mt-1 text-sm {getGrowthColor(monthlyStats.salesGrowthRate)}">
                {getGrowthIcon(monthlyStats.salesGrowthRate)}
                {Math.abs(monthlyStats.salesGrowthRate)}% 전월대비
              </p>
            {:else}
              <p class="text-gray-500 mt-1 text-sm">데이터 없음</p>
            {/if}
          </div>
          <div class="bg-primary-100 text-primary-600 rounded-full p-3">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">이번달 주문 건수</p>
            <p class="text-gray-900 mt-2 text-2xl font-bold">{formatNumber(monthlyStats.totalOrders)}건</p>
            {#if monthlyStats.totalOrders > 0}
              <p class="mt-1 text-sm {getGrowthColor(monthlyStats.ordersGrowthRate)}">
                {getGrowthIcon(monthlyStats.ordersGrowthRate)}
                {Math.abs(monthlyStats.ordersGrowthRate)}% 전월대비
              </p>
            {:else}
              <p class="text-gray-500 mt-1 text-sm">데이터 없음</p>
            {/if}
          </div>
          <div class="bg-blue-100 text-blue-600 rounded-full p-3">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">평균 주문 금액</p>
            <p class="text-gray-900 mt-2 text-2xl font-bold">{formatCurrency(monthlyStats.avgOrderAmount)}</p>
            <p class="text-gray-500 mt-1 text-sm">완료된 주문 기준</p>
          </div>
          <div class="bg-green-100 text-green-600 rounded-full p-3">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">미확인 주문</p>
            <p class="text-gray-900 mt-2 text-2xl font-bold">{formatNumber(unconfirmedOrdersCount)}건</p>
            {#if unconfirmedOrdersCount > 0}
              <p class="text-orange-600 mt-1 text-sm font-medium">확인이 필요합니다</p>
            {:else}
              <p class="text-gray-500 mt-1 text-sm">처리 완료</p>
            {/if}
          </div>
          <div class="bg-orange-100 text-orange-600 rounded-full p-3">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div class="mb-6 grid gap-6 lg:grid-cols-2">
    <div class="rounded-xl bg-white p-6 shadow-sm">
      <h3 class="text-gray-900 mb-4 text-lg font-semibold">주문 상태별 현황</h3>
      {#if orderStatusStats.length > 0}
        <div class="space-y-3">
          {#each orderStatusStats as stat}
            <div class="border-gray-100 flex items-center justify-between rounded-lg border p-4">
              <div class="flex items-center gap-3">
                <span
                  class={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(stat.status)}`}
                >
                  {orderStatusLabels[stat.status] || stat.status}
                </span>
                <span class="text-gray-900 font-semibold">{formatNumber(stat.count)}건</span>
              </div>
              <span class="text-gray-600 text-sm">{formatCurrency(stat.amount)}</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-gray-400 py-8 text-center">주문 데이터가 없습니다.</div>
      {/if}
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-gray-900 text-lg font-semibold">발주 상태별 현황</h3>
        {#if pendingPurchasesCount > 0}
          <span
            class="bg-yellow-100 text-yellow-800 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
          >
            승인대기 {pendingPurchasesCount}건
          </span>
        {/if}
      </div>
      {#if purchaseStatusStats.length > 0}
        <div class="space-y-3">
          {#each purchaseStatusStats as stat}
            <div class="border-gray-100 flex items-center justify-between rounded-lg border p-4">
              <div class="flex items-center gap-3">
                <span
                  class={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getPurchaseStatusBadge(stat.status)}`}
                >
                  {purchaseStatusLabels[stat.status] || stat.status}
                </span>
                <span class="text-gray-900 font-semibold">{formatNumber(stat.count)}건</span>
              </div>
              <span class="text-gray-600 text-sm">{formatCurrency(stat.amount)}</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-gray-400 py-8 text-center">발주 데이터가 없습니다.</div>
      {/if}
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
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
              <div class="hover:bg-gray-50 space-y-3 rounded-lg border border-gray-100 p-3 transition-colors">
                <div class="flex items-start gap-2.5">
                  <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {#if product.images && product.images.length > 0}
                      <img
                        src={product.images.find((img) => img.representative)?.url || product.images[0]?.url}
                        alt={product.name}
                        class="h-full w-full object-cover"
                      />
                    {:else}
                      <div class="flex h-full w-full items-center justify-center text-sm">📦</div>
                    {/if}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                      <h4 class="text-gray-900 text-sm font-medium truncate">{product.name}</h4>
                      <span
                        class={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.status?.badgeClass || getStatusBadge(product.status.code)}`}
                      >
                        {product.status.label}
                      </span>
                    </div>

                    <div class="text-gray-500 text-xs mb-2">
                      <span>마감: {dayjs(product.salesDate).format('MM/DD HH:mm')}</span>
                      {#if product.category?.name}
                        <span class="mx-1">·</span>
                        <span>{product.category.name}</span>
                      {/if}
                    </div>

                    <div class="space-y-1.5">
                      <div class="flex justify-between text-xs">
                        <span class="text-gray-600">주문 진행률</span>
                        <span class="text-gray-900 font-medium">
                          {formatNumber(product.orderedQuantity)} / {formatNumber(product.maxQuantity)}
                          <span class="text-gray-500 ml-1"
                            >({Math.round((product.orderedQuantity / product.maxQuantity) * 100)}%)</span
                          >
                        </span>
                      </div>
                      <div class="bg-gray-100 h-1.5 w-full rounded-full overflow-hidden">
                        <div
                          class="bg-primary-500 h-full rounded-full transition-all duration-300"
                          style="width: {getProgressPercentage(product.orderedQuantity, product.maxQuantity)}%"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

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
              <div class="hover:bg-gray-50 rounded-lg border border-gray-100 p-3 transition-colors">
                <div class="flex items-start gap-2.5">
                  <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {#if order.items[0]?.coop?.images && order.items[0].coop.images.length > 0}
                      <img
                        src={order.items[0].coop.images.find((img) => img.representative)?.url ||
                          order.items[0].coop.images[0]?.url}
                        alt={order.items[0]?.coop.name}
                        class="h-full w-full object-cover"
                      />
                    {:else}
                      <div class="flex h-full w-full items-center justify-center text-sm">📦</div>
                    {/if}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                      <div class="flex-1 min-w-0">
                        <h4 class="text-gray-900 text-sm font-medium truncate">
                          {order.items[0]?.coop.name}
                          {#if order.items.length > 1}
                            <span class="text-gray-500">외 {order.items.length - 1}건</span>
                          {/if}
                        </h4>
                        <p class="text-gray-600 text-xs mt-0.5">{order.userName}</p>
                      </div>
                      <span
                        class={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${order.status?.badgeClass || getStatusBadge(order.status.code)}`}
                      >
                        {order.status.label}
                      </span>
                    </div>

                    <div class="flex items-center justify-between mt-2">
                      <span class="text-gray-500 text-xs">{dayjs(order.createdAt).format('MM/DD HH:mm')}</span>
                      <span class="text-gray-900 text-sm font-semibold">{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

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
              <div class="hover:bg-gray-50 rounded-lg border border-gray-100 p-3 transition-colors">
                <div class="flex items-start gap-2.5">
                  <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {#if purchase.originProductRepresentativeImage}
                      <img
                        src={purchase.originProductRepresentativeImage}
                        alt={purchase.originProductName}
                        class="h-full w-full object-cover"
                      />
                    {:else}
                      <div class="flex h-full w-full items-center justify-center text-sm">📦</div>
                    {/if}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                      <div class="flex-1 min-w-0">
                        <h4 class="text-gray-900 text-sm font-medium truncate">{purchase.originProductName}</h4>
                        <p class="text-gray-600 text-xs mt-0.5 truncate">
                          <span class="font-medium">판매 상품명:</span>
                          {purchase.coopName || '미등록'}
                        </p>
                      </div>
                      {#if purchase.status}
                        <span
                          class={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${purchase.status?.badgeClass || getPurchaseStatusBadge(purchase.status.code)}`}
                        >
                          {purchase.status.label}
                        </span>
                      {:else}
                        <span
                          class="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          발주 전
                        </span>
                      {/if}
                    </div>

                    <div class="flex items-center justify-between mt-2">
                      <span class="text-gray-500 text-xs">
                        {#if purchase.status && purchase.requestedDate}
                          {dayjs(purchase.requestedDate).format('MM/DD HH:mm')}
                        {:else}
                          판매일: {purchase.salesDate ? dayjs(purchase.salesDate).format('MM/DD') : '-'}
                        {/if}
                      </span>
                      {#if purchase.status && purchase.quantity}
                        <span class="text-gray-900 text-xs font-medium">
                          {formatNumber(purchase.quantity)}{purchase.unit || ''}
                          <span class="text-gray-500 ml-1">·</span>
                          <span class="ml-1">{formatCurrency(purchase.price || 0)}</span>
                        </span>
                      {:else}
                        <span class="text-gray-500 text-xs">발주 신청 대기</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
