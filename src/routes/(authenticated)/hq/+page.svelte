<script lang="ts">
  import PageHeader from '$lib/components/layout/PageHeader.svelte'
  import { ApprovalStatus, PurchaseStatus } from '$lib/types'
  import { formatCurrency, formatNumberWithCommas } from '$lib/utils'
  import dayjs from 'dayjs'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let dashboardData = $derived(data.dashboardData)
  let monthlyStats = $derived(dashboardData.monthlyStats)
  let previousMonthStats = $derived(dashboardData.previousMonthStats)
  let approvalStatusSummary = $derived(dashboardData.approvalStatusSummary)
  let purchaseStatusSummary = $derived(dashboardData.purchaseStatusSummary)
  let storeStatus = $derived(dashboardData.storeStatus)
  let pendingApprovalsCount = $derived(dashboardData.pendingApprovalsCount)
  let pendingPurchasesCount = $derived(dashboardData.pendingPurchasesCount)
  let ongoingCoopsCount = $derived(dashboardData.ongoingCoopsCount)

  let topProducts = $derived(data.topProducts)
  let topPurchasedProducts = $derived(data.topPurchasedProducts)
  let recentApprovals = $derived(data.recentApprovals)
  let recentPurchases = $derived(data.recentPurchases)
  let topStores = $derived(data.topStores)

  // 전월 대비 성장률 계산
  function calculateGrowthRate(current: number, previous: number): string {
    if (previous === 0) return '+0%'
    const rate = ((current - previous) / previous) * 100
    const sign = rate >= 0 ? '+' : ''
    return `${sign}${rate.toFixed(1)}%`
  }

  // 승인 상태 조회 헬퍼
  function getApprovalStatusEnum(statusCode: string | any) {
    const code = typeof statusCode === 'string' ? statusCode : statusCode?.code || statusCode
    return (
      Object.values(ApprovalStatus).find((s) => s.code === code || s.code === code?.toLowerCase()) ||
      ApprovalStatus.PENDING
    )
  }

  // 발주 상태 조회 헬퍼
  function getPurchaseStatusEnum(statusCode: string | any) {
    const code = typeof statusCode === 'string' ? statusCode : statusCode?.code || statusCode
    return Object.values(PurchaseStatus).find((s) => s.code === code) || PurchaseStatus.REQUESTED
  }

  // 평균 주문 금액
  let avgOrderAmount = $derived(
    monthlyStats.completed_orders > 0 ? monthlyStats.total_sales / monthlyStats.completed_orders : 0
  )
</script>

<svelte:head>
  <title>본사 대시보드</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <PageHeader title="본사 대시보드">
    {#snippet actions()}
      <div class="text-sm text-gray-500">
        {dayjs().format('YYYY년 M월 D일')}
      </div>
    {/snippet}
  </PageHeader>

  <div class="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-600">총 매출</h3>
        <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="mb-1 text-2xl font-bold text-gray-900">
        {formatCurrency(monthlyStats.total_sales)}
      </div>
      {#if monthlyStats.total_sales > 0}
        <div
          class="text-sm {calculateGrowthRate(monthlyStats.total_sales, previousMonthStats.total_sales).startsWith('+')
            ? 'text-green-600'
            : 'text-red-600'}"
        >
          전월 대비 {calculateGrowthRate(monthlyStats.total_sales, previousMonthStats.total_sales)}
        </div>
      {/if}
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-600">총 주문 건수</h3>
        <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      </div>
      <div class="mb-1 text-2xl font-bold text-gray-900">
        {formatNumberWithCommas(monthlyStats.total_orders)}건
      </div>
      {#if monthlyStats.total_orders > 0}
        <div
          class="text-sm {calculateGrowthRate(monthlyStats.total_orders, previousMonthStats.total_orders).startsWith(
            '+'
          )
            ? 'text-green-600'
            : 'text-red-600'}"
        >
          전월 대비 {calculateGrowthRate(monthlyStats.total_orders, previousMonthStats.total_orders)}
        </div>
      {/if}
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-600">미승인 매니저</h3>
        <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
      <div class="mb-1 text-2xl font-bold text-gray-900">
        {formatNumberWithCommas(pendingApprovalsCount)}건
      </div>
      <div class="text-sm text-gray-500">승인 대기중</div>
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-600">미승인 발주</h3>
        <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <div class="mb-1 text-2xl font-bold text-gray-900">
        {formatNumberWithCommas(pendingPurchasesCount)}건
      </div>
      <div class="text-sm text-gray-500">승인 대기중</div>
    </div>
  </div>

  <div class="mb-6 grid gap-6 lg:grid-cols-2">
    <div class="rounded-xl bg-white p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-gray-900">승인 상태별 현황</h3>
      <div class="space-y-3">
        {#each approvalStatusSummary as stat}
          {@const statusEnum = getApprovalStatusEnum(stat.approval_status)}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {statusEnum.badgeClass}">
                {statusEnum.label}
              </span>
            </div>
            <span class="text-lg font-semibold text-gray-900">
              {formatNumberWithCommas(stat.approval_count)}건
            </span>
          </div>
        {/each}
      </div>
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-gray-900">발주 상태별 현황</h3>
      <div class="space-y-3">
        {#each purchaseStatusSummary as stat}
          {@const statusEnum = getPurchaseStatusEnum(stat.status)}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {statusEnum.badgeClass}">
                {statusEnum.label}
              </span>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold text-gray-900">
                {formatNumberWithCommas(stat.purchase_count)}건
              </div>
              <div class="text-sm text-gray-500">{formatCurrency(stat.total_amount)}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <div class="rounded-xl bg-white p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-gray-900">이번달 매출 상위 가맹점</h3>
      <div class="space-y-3">
        {#if topStores.length === 0}
          <div class="py-8 text-center text-gray-400">데이터가 없습니다.</div>
        {:else}
          {#each topStores as store}
            <div class="rounded-lg border border-gray-100 p-4">
              <div class="space-y-1">
                <div class="font-medium text-gray-900">{store.store_name}</div>
                <div class="text-sm text-gray-600">
                  매출: {formatCurrency(store.total_sales)}
                </div>
                <div class="text-sm text-gray-600">
                  주문: {formatNumberWithCommas(store.completed_orders)}건
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-gray-900">최근 승인 요청</h3>
      <div class="space-y-3">
        {#if recentApprovals.length === 0}
          <div class="py-8 text-center text-gray-400">데이터가 없습니다.</div>
        {:else}
          {#each recentApprovals as approval}
            {@const statusEnum = getApprovalStatusEnum(approval.status)}
            <div class="rounded-lg border border-gray-100 p-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">{(approval.store as any)?.name}</span>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusEnum.badgeClass}"
                  >
                    {statusEnum.label}
                  </span>
                </div>
                <div class="text-sm text-gray-600">{(approval.applicant as any)?.name}</div>
                <div class="text-xs text-gray-400">
                  {dayjs(approval.created_at).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="rounded-xl bg-white p-6 shadow-sm">
      <h3 class="mb-4 text-lg font-semibold text-gray-900">최근 발주 요청</h3>
      <div class="space-y-3">
        {#if recentPurchases.length === 0}
          <div class="py-8 text-center text-gray-400">데이터가 없습니다.</div>
        {:else}
          {#each recentPurchases as purchase}
            {@const statusEnum = getPurchaseStatusEnum(purchase.status)}
            <div class="rounded-lg border border-gray-100 p-4">
              <div class="flex gap-3">
                {#if (purchase.product as any)?.images?.[0]}
                  <img
                    src={(purchase.product as any).images[0]}
                    alt={(purchase.product as any).name}
                    class="h-12 w-12 rounded-lg object-cover"
                  />
                {:else}
                  <div class="h-12 w-12 rounded-lg bg-gray-200"></div>
                {/if}
                <div class="flex-1 space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900">{(purchase.store as any)?.name}</span>
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusEnum.badgeClass}"
                    >
                      {statusEnum.label}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">판매 상품명:</span>
                    {(purchase.product as any)?.name}
                  </div>
                  <div class="text-sm text-gray-500">
                    {formatNumberWithCommas(purchase.quantity)}개 · {formatCurrency(purchase.total_price)}
                  </div>
                  <div class="text-xs text-gray-400">
                    {dayjs(purchase.created_at).format('YYYY-MM-DD')}
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
