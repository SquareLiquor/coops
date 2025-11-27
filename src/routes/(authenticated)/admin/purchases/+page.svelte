<script lang="ts">
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import { buildForm } from '$lib/builders/form.builder'
  import PurchaseModal from '$lib/components/modals/admin/PurchaseModal.svelte'
  import Alert from '$lib/components/ui/Alert.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { PurchaseStatusChangeSchema, PurchasesFilterSchema } from '$lib/schemas'
  import { PurchaseStatus, type PurchaseEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import { equalsEnum } from '$lib/utils/enum'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, setContext, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { categories, purchaseStatuses } = data
  let purchases: PurchaseEntity[] = $state([])
  let selectedPurchase: PurchaseEntity | null = $state(null)
  let modalMode: 'create' | 'edit' = $state('create')
  let alert = $state<{ type: 'success' | 'error'; message: string } | null>(null)

  onMount(async () => {
    await tick()
    await asyncFilterSubmit()
  })

  onDestroy(() => debouncedSubmit?.cancel?.())

  setContext('updatePurchases', async () => await asyncFilterSubmit())

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

  const { enhance: statusChangeEnhance, submitting: statusChangeSubmitting } = buildForm<
    typeof PurchaseStatusChangeSchema
  >({
    form: data.statusChangeForm,
    schema: PurchaseStatusChangeSchema,
    resultHandler: {
      handleSuccess: async (result) => {
        await asyncFilterSubmit()
        alert = {
          type: 'success',
          message: result.data?.message || '발주가 취소되었습니다.',
        }
      },
      handleFailure: async (result) => {
        await asyncFilterSubmit()
        alert = {
          type: 'error',
          message: result.data?.message || '발주 취소 중 오류가 발생했습니다.',
        }
      },
    },
  })

  const openCreateModal = (purchase: PurchaseEntity) => {
    modalMode = 'create'
    selectedPurchase = purchase
  }

  const openEditModal = (purchase: PurchaseEntity) => {
    modalMode = 'edit'
    selectedPurchase = purchase
  }
</script>

<svelte:head>
  <title>발주관리 - 관리자</title>
</svelte:head>

{#if alert}
  <Alert
    title={alert.type === 'success' ? '성공' : '오류'}
    type={alert.type}
    message={alert.message}
    onClose={() => (alert = null)}
  />
{/if}

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
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">판매 상품명</th
            >
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">발주 상태</th
            >
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">발주 수량</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">단가</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">발주 총액</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">일자</th>
            <th class="px-3 py-3 text-center text-sm font-semibold text-gray-900">작업</th>
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
                    <img
                      src={purchase.originProductRepresentativeImage}
                      alt={purchase.originProductName}
                      class="h-full w-full object-cover"
                    />
                  </div>
                  <div class="flex flex-1 items-center justify-between gap-3">
                    <button
                      type="button"
                      class="flex flex-col gap-0.5 transition-colors"
                      onclick={() => (purchase.editable ? openEditModal(purchase) : openCreateModal(purchase))}
                    >
                      <span
                        class="text-primary-600 hover:text-primary-700 text-left text-sm font-medium text-gray-900 hover:underline"
                        >{purchase.originProductName}</span
                      >

                      {#if purchase.id}
                        <span class="text-xs text-gray-400">{purchase.id}</span>
                      {/if}
                    </button>
                    <div class="flex flex-col items-end gap-0.5 text-xs text-gray-500" class:self-center={!purchase.id}>
                      {#if purchase.categoryName}
                        <span class="self-center">{purchase.categoryName}</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="flex items-center gap-2.5">
                  <div class="flex flex-1 items-center justify-between gap-3">
                    <span
                      class="text-primary-600 hover:text-primary-700 text-left text-sm font-medium transition-colors"
                    >
                      {purchase.coopName}
                    </span>
                    <span class="text-xs text-gray-400"
                      >판매 일자: {dayjs(purchase.salesDate).format('YYYY-MM-DD')}</span
                    >
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span
                  class={[
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                    purchase.status && `text-${purchase.status.color}-800 bg-${purchase.status.color}-100 `,
                    !purchase.status && 'bg-gray-100 text-gray-800',
                  ]}
                >
                  {purchase.status?.label || '발주 전'}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {#if !purchase.status}
                  -
                {:else}
                  {purchase.quantity}
                  {purchase.unit}
                {/if}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {formatCurrency(purchase.originProductPrice)}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {#if !purchase.status}
                  -
                {:else}
                  {formatCurrency(purchase.price)}
                {/if}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {#if equalsEnum(PurchaseStatus.REQUESTED, purchase.status)}
                  {purchase.status?.label}: {dayjs(purchase.requestedDate).format('YYYY-MM-DD HH:mm')}
                {:else if equalsEnum(PurchaseStatus.APPROVED, purchase.status)}
                  {purchase.status?.label}: {dayjs(purchase.approvedDate).format('YYYY-MM-DD HH:mm')}
                {:else if equalsEnum(PurchaseStatus.DELIVERY_STARTED, purchase.status)}
                  {purchase.status?.label}: {dayjs(purchase.shippedDate).format('YYYY-MM-DD HH:mm')}
                  <!-- {:else if equalsEnum(PurchaseStatus.DELIVERED, purchase.status)}
                  {purchase.status?.label}: {dayjs(purchase.deliveredDate).format('YYYY-MM-DD HH:mm')} -->
                {:else if equalsEnum(PurchaseStatus.REJECTED, purchase.status)}
                  {purchase.status?.label}: {dayjs(purchase.rejectedDate).format('YYYY-MM-DD HH:mm')}
                {:else if equalsEnum(PurchaseStatus.CANCELLED, purchase.status)}
                  {purchase.status?.label}: {dayjs(purchase.cancelledDate).format('YYYY-MM-DD HH:mm')}
                {:else}
                  -
                {/if}
              </td>
              <td class="px-3 py-2 text-center">
                <div class="flex items-center justify-center gap-1">
                  <!-- 발주 신청/재신청 버튼 -->
                  {#if !purchase.id || purchase.reRequestable}
                    <button
                      type="button"
                      class="bg-primary-600 hover:bg-primary-700 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                      onclick={() => openCreateModal(purchase)}
                    >
                      {purchase.reRequestable ? '재신청' : '발주 신청'}
                    </button>
                  {/if}

                  <!-- 취소 버튼 -->
                  {#if purchase.cancelable}
                    <form method="POST" use:statusChangeEnhance>
                      <input type="hidden" name="id" value={purchase.id} />
                      <button
                        class="bg-error-600 hover:bg-error-700 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                        formaction="?/cancel"
                        onclick={(e) => !confirm('발주를 취소하시겠습니까?') && e.preventDefault()}
                        disabled={$statusChangeSubmitting}
                      >
                        발주 취소
                      </button>
                    </form>
                  {/if}
                </div>
              </td>
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
          onPageChange={(page) => ($filterForm.page = page)}
        />
      </div>
    {/if}
  </div>
</div>

{#if selectedPurchase}
  <PurchaseModal
    purchase={selectedPurchase}
    createForm={data.createForm}
    updateForm={data.updateForm}
    mode={modalMode}
    onClose={() => (selectedPurchase = null)}
  />
{/if}
