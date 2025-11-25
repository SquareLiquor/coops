<script lang="ts">
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import PurchaseModal from '$lib/components/modals/admin/PurchaseModal.svelte'
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
  } = buildFilterForm<typeof PurchasesFilterSchema>({
    form: data.filterForm,
    schema: PurchasesFilterSchema,
    resultHandler: {
      handleSuccess: (result) => (purchases = result.data?.purchases || []),
      handleFailure: () => (purchases = []),
    },
  })
</script>

<svelte:head>
  <title>발주관리 - 관리자</title>
</svelte:head>

<!-- Header -->
<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">발주 관리</h1>
  </div>
</div>

<div class="relative p-6">
  <form
    method="POST"
    action="?/fetch"
    use:filterEnhance
    class="mb-6 flex items-center justify-between"
    autocomplete="off"
  >
    <input type="hidden" name="storeId" bind:value={$filterForm.storeId} />

    <div class="flex flex-col">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <input
              type="date"
              name="dateFrom"
              bind:value={$filterForm.dateFrom}
              class={[
                'focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none',
                $filterForm.dateFrom && 'border-primary-500 text-primary-700',
                !$filterForm.dateFrom && 'border-surface-100',
              ]}
              {...$filterConstraints.dateFrom}
            />
            <span class="text-surface-400">~</span>
            <input
              type="date"
              name="dateTo"
              bind:value={$filterForm.dateTo}
              class={[
                'focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none',
                $filterForm.dateTo && 'border-primary-500 text-primary-700',
                !$filterForm.dateTo && 'border-surface-100',
              ]}
              {...$filterConstraints.dateTo}
            />
          </div>
        </div>

        <select
          class="border-surface-100 focus:border-primary-500 min-w-[100px] border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
          name="categoryId"
          bind:value={$filterForm.categoryId}
        >
          <option value={undefined} selected>전체</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>

      {#if $filterErrors.dateFrom || $filterErrors.dateTo}
        <div class="mt-1 flex flex-col gap-1">
          {#if $filterErrors.dateFrom}
            <div class="text-error-500 text-sm">{$filterErrors.dateFrom}</div>
          {/if}
          {#if $filterErrors.dateTo}
            <div class="text-error-500 text-sm">{$filterErrors.dateTo}</div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      <input type="hidden" name="status" bind:value={$filterForm.status} />
      {#each purchaseStatuses as status}
        <button
          type="button"
          class={[
            'rounded px-3 py-1.5 text-sm font-medium transition-colors',
            $filterForm.status === status.code && 'bg-primary-500 text-white shadow-sm',
            $filterForm.status !== status.code && 'text-surface-600 hover:bg-surface-100',
          ]}
          onclick={() => ($filterForm.status = status.code)}
        >
          {status.label}
        </button>
      {/each}
    </div>
  </form>

  <div class="border-surface-100 bg-surface-50/50 relative overflow-hidden rounded-lg border">
    {#if $filterSubmitting}
      <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
        <span class="loader-giant"></span>
      </div>
    {/if}

    <table class="min-w-full">
      <thead class="bg-surface-50/50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-3 text-center">
            <span class="text-surface-500 text-xs font-medium">#</span>
          </th>
          <th class="text-surface-500 w-[10%] px-4 text-center font-bold">발주 상태</th>
          <th class="text-surface-500 w-[10%] px-4 text-center font-bold">카테고리</th>
          <th class="text-surface-500 w-[25%] px-4 text-center font-bold">상품명</th>
          <th class="text-surface-500 w-[10%] px-4 text-center font-bold">발주 수량</th>
          <th class="text-surface-500 w-[10%] px-4 text-center font-bold">단가</th>
          <th class="text-surface-500 w-[10%] px-4 text-center font-bold">발주 총액</th>
          <th class="text-surface-500 w-[15%] px-4 text-center font-bold">일자</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody class="divide-surface-100 divide-y bg-white">
        {#each purchases as purchase, index}
          <tr class="hover:bg-surface-50 text-center">
            <td class="text-surface-500 py-4 text-sm">
              {index + 1}
            </td>
            <td class="text-surface-500 px-6 py-4 text-sm">
              <span
                class={[
                  'inline-flex rounded-md px-2 py-1 text-xs font-medium',
                  purchase.purchaseStatus &&
                    `text-${purchase.purchaseStatus.code}-800 bg-${purchase.purchaseStatus.code}-100 `,
                  !purchase.purchaseStatus && 'bg-gray-100 text-gray-800',
                ]}
              >
                {purchase.purchaseStatus?.label || '발주 전'}
              </span>
            </td>
            <td>{purchase.categoryName}</td>
            <td>
              <div class="flex items-center justify-start">
                <button
                  type="button"
                  class="text-primary-500 m-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium hover:underline"
                  onclick={() => (selectedPurchase = purchase)}
                >
                  {purchase.originProductName}
                </button>
              </div>
            </td>
            <td class="px-4 py-4 text-center whitespace-nowrap">
              {#if !purchase.purchaseStatus}
                -
              {:else}
                {purchase.purchaseQuantity}
                {purchase.purchaseUnit}
              {/if}
            </td>
            <td class="px-4 py-4 text-center whitespace-nowrap">
              {formatCurrency(purchase.originProductPrice)}
            </td>
            <td class="px-4 py-4 text-center whitespace-nowrap">
              {#if !purchase.purchaseStatus}
                -
              {:else}
                {formatCurrency(purchase.purchasePrice)}
              {/if}
            </td>
            <td>
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
  </div>
</div>

{#if selectedPurchase}
  <PurchaseModal purchase={selectedPurchase} onClose={() => (selectedPurchase = null)} />
{/if}
