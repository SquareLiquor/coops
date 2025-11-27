<script lang="ts">
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import PurchaseModal from '$lib/components/modals/admin/PurchaseModal.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { PurchasesFilterSchema } from '$lib/schemas'
  import { PurchaseStatus, type PurchaseEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import { equalsEnum } from '$lib/utils/enum'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { categories, purchaseStatuses } = data
  let purchases: PurchaseEntity[] = $state([])
  let selectedPurchase: PurchaseEntity | null = $state(null)

  onMount(async () => {
    await tick()

    await asyncFilterSubmit()
  })

  onDestroy(() => debouncedSubmit?.cancel?.())

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    enhance: filterEnhance,
    submitting: filterSubmitting,
    asyncSubmit: asyncFilterSubmit,
    debouncedSubmit,
    pagination,
  } = buildFilterForm<typeof PurchasesFilterSchema>({
    form: data.filterForm,
    schema: PurchasesFilterSchema,
    resultHandler: {
      handleSuccess: (result) => (purchases = result.data?.purchases || []),
      handleFailure: () => (purchases = []),
    },
  })

  const handlePageChange = (page: number) => {
    $filterForm.page = page
    asyncFilterSubmit()
  }
</script>

<svelte:head>
  <title>발주관리 - 관리자</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">발주 관리</h1>
  </div>

  <div class="relative">
    <form method="POST" action="?/fetch" use:filterEnhance class="mb-4" autocomplete="off">
      <input type="hidden" name="storeId" bind:value={$filterForm.storeId} />
      <input type="hidden" name="page" bind:value={$filterForm.page} />

      <!-- Filters Row -->
      <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2">
          <!-- 날짜 필터 -->
          <input
            type="date"
            name="dateFrom"
            bind:value={$filterForm.dateFrom}
            class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
            {...$filterConstraints.dateFrom}
          />
          <span class="text-xs text-gray-400">~</span>
          <input
            type="date"
            name="dateTo"
            bind:value={$filterForm.dateTo}
            class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
            {...$filterConstraints.dateTo}
          />

          <!-- 카테고리 필터 -->
          <select
            class="focus:border-primary-500 min-w-[100px] rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
            name="categoryId"
            bind:value={$filterForm.categoryId}
          >
            <option value={undefined} selected>전체</option>
            {#each categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>

        <!-- 발주 상태 필터 (우측 또는 아래) -->
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <input type="hidden" name="status" bind:value={$filterForm.status} />
          {#each purchaseStatuses as status}
            <button
              type="button"
              class={[
                'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                $filterForm.status === status.code && 'bg-primary-600 text-white',
                $filterForm.status !== status.code && 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ]}
              onclick={() => ($filterForm.status = status.code)}
            >
              {status.label}
            </button>
          {/each}
        </div>
      </div>

      {#if $filterErrors.dateFrom || $filterErrors.dateTo}
        <div class="flex flex-col gap-1">
          {#if $filterErrors.dateFrom}
            <div class="text-sm text-red-600">{$filterErrors.dateFrom}</div>
          {/if}
          {#if $filterErrors.dateTo}
            <div class="text-sm text-red-600">{$filterErrors.dateTo}</div>
          {/if}
        </div>
      {/if}
    </form>

    <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      {#if $filterSubmitting}
        <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
          <span class="loader-giant"></span>
        </div>
      {/if}

      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-white">
            <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> # </th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">상품명</th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">발주 상태</th
            >
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">발주 수량</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">단가</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">발주 총액</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">일자</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each purchases as purchase, index}
            <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {index + 1}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="flex items-center gap-2.5">
                  <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                    <div class="flex h-full w-full items-center justify-center text-sm">📦</div>
                  </div>
                  <div class="flex flex-1 items-center justify-between gap-3">
                    <div class="flex flex-col gap-0.5">
                      <button
                        type="button"
                        class="text-primary-600 hover:text-primary-700 text-left text-sm font-medium transition-colors hover:underline"
                        onclick={() => (selectedPurchase = purchase)}
                      >
                        {purchase.originProductName}
                      </button>
                      {#if purchase.purchaseId}
                        <span class="text-xs text-gray-400">{purchase.purchaseId}</span>
                      {/if}
                    </div>
                    <div
                      class="flex flex-col items-end gap-0.5 text-xs text-gray-500"
                      class:self-center={!purchase.purchaseId}
                    >
                      {#if purchase.categoryName}
                        <span class="self-center">{purchase.categoryName}</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span
                  class={[
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                    purchase.purchaseStatus &&
                      `text-${purchase.purchaseStatus.code}-800 bg-${purchase.purchaseStatus.code}-100 `,
                    !purchase.purchaseStatus && 'bg-gray-100 text-gray-800',
                  ]}
                >
                  {purchase.purchaseStatus?.label || '발주 전'}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {#if !purchase.purchaseStatus}
                  -
                {:else}
                  {purchase.purchaseQuantity}
                  {purchase.purchaseUnit}
                {/if}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {formatCurrency(purchase.originProductPrice)}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {#if !purchase.purchaseStatus}
                  -
                {:else}
                  {formatCurrency(purchase.purchasePrice)}
                {/if}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {#if equalsEnum(PurchaseStatus.REQUESTED, purchase.purchaseStatus)}
                  {purchase.purchaseStatus?.label} 일: {dayjs(purchase.requestedDate).format('YYYY-MM-DD HH:mm')}
                {:else if equalsEnum(PurchaseStatus.APPROVED, purchase.purchaseStatus)}
                  {purchase.purchaseStatus?.label} 일: {dayjs(purchase.approvedDate).format('YYYY-MM-DD HH:mm')}
                {:else if equalsEnum(PurchaseStatus.DELIVERY_STARTED, purchase.purchaseStatus)}
                  {purchase.purchaseStatus?.label} 일: {dayjs(purchase.shippedDate).format('YYYY-MM-DD HH:mm')}
                  <!-- {:else if equalsEnum(PurchaseStatus.DELIVERED, purchase.purchaseStatus)}
                {purchase.purchaseStatus?.label} 일: {dayjs(purchase.deliveredDate).format('YYYY-MM-DD HH:mm')}
              {/if} -->
                {:else if equalsEnum(PurchaseStatus.REJECTED, purchase.purchaseStatus)}
                  {purchase.purchaseStatus?.label} 일: {dayjs(purchase.rejectedDate).format('YYYY-MM-DD HH:mm')}
                {:else if equalsEnum(PurchaseStatus.CANCELLED, purchase.purchaseStatus)}
                  {purchase.purchaseStatus?.label} 일: {dayjs(purchase.cancelledDate).format('YYYY-MM-DD HH:mm')}
                {:else}
                  -
                {/if}
              </td>
              <td class="px-4 py-4"></td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if purchases.length === 0}
        <div class="py-12 text-center">
          <div class="flex flex-col items-center justify-center">
            <svg class="mb-2 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">발주 대상이 없습니다</h3>
          </div>
        </div>
      {/if}
    </div>

    {#if purchases.length > 0 || pagination.totalPages > 1}
      <div class="mt-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    {/if}
  </div>
</div>

{#if selectedPurchase}
  <PurchaseModal purchase={selectedPurchase} onClose={() => (selectedPurchase = null)} />
{/if}
