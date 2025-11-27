<script lang="ts">
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import CoopDetailModal from '$lib/components/modals/admin/CoopDetailModal.svelte'
  import Alert from '$lib/components/ui/Alert.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { CoopsFilterSchema } from '$lib/schemas'
  import type { CoopEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { categories, salesStatuses } = data
  let coops: CoopEntity[] = $state([])
  let selectedCoopId: string | null = $state(null)

  function handlePageChange(page: number) {
    $filterForm.page = page
    asyncFilterSubmit()
  }

  // Alert 상태 관리
  let showAlert = $state(false)
  let alertConfig = $state({
    type: 'info' as 'info' | 'error' | 'warning' | 'success',
    mode: 'alert' as 'alert' | 'confirm',
    title: '',
    message: '',
  })

  function showInfoAlert() {
    alertConfig = {
      type: 'info',
      mode: 'alert',
      title: '정보',
      message: '이것은 정보 알림입니다.',
    }
    showAlert = true
  }

  function showErrorAlert() {
    alertConfig = {
      type: 'error',
      mode: 'alert',
      title: '오류',
      message: '오류가 발생했습니다.',
    }
    showAlert = true
  }

  function showWarningConfirm() {
    alertConfig = {
      type: 'warning',
      mode: 'confirm',
      title: '경고',
      message: '이 작업을 계속하시겠습니까?',
    }
    showAlert = true
  }

  function showSuccessAlert() {
    alertConfig = {
      type: 'success',
      mode: 'alert',
      title: '성공',
      message: '작업이 성공적으로 완료되었습니다.',
    }
    showAlert = true
  }

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
  } = buildFilterForm<typeof CoopsFilterSchema>({
    form: data.filterForm,
    schema: CoopsFilterSchema,
    resultHandler: {
      handleSuccess: (result) => {
        coops = result.data?.coops || []
      },
      handleFailure: () => {
        coops = []
      },
    },
  })

  // 진행률 색상 클래스 반환 함수
  function getProgressColor(coop: { orderedQuantity: number; maxQuantity: number }) {
    const percent = Math.round((coop.orderedQuantity / coop.maxQuantity) * 100)
    if (percent >= 90) return 'bg-primary-500'
    if (percent >= 70) return 'bg-primary-400'
    if (percent >= 50) return 'bg-primary-300'
    if (percent >= 30) return 'bg-primary-200'
    if (percent >= 10) return 'bg-primary-100'
    return 'bg-primary-50'
  }
</script>

<svelte:head>
  <title>판매 상품 관리 - 관리자</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">판매 상품 관리</h1>
    <div class="flex items-center gap-2">
      <!-- Alert 테스트 버튼들 -->
      <button
        type="button"
        onclick={showInfoAlert}
        class="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
      >
        Info
      </button>
      <button
        type="button"
        onclick={showErrorAlert}
        class="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
      >
        Error
      </button>
      <button
        type="button"
        onclick={showWarningConfirm}
        class="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-700"
      >
        Warning
      </button>
      <button
        type="button"
        onclick={showSuccessAlert}
        class="rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
      >
        Success
      </button>
      <a
        href="/admin/coops/create"
        class="bg-primary-600 hover:bg-primary-700 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition-colors"
      >
        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        새 상품 등록
      </a>
    </div>
  </div>

  <div class="relative">
    <form method="POST" action="?/fetch" use:filterEnhance class="mb-4">
      <input type="hidden" name="storeId" bind:value={$filterForm.storeId} />
      <input type="hidden" name="page" bind:value={$filterForm.page} />
      <input type="hidden" name="pageSize" bind:value={$filterForm.pageSize} />

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

          <!-- 상품명 검색 -->
          <input
            type="text"
            name="name"
            bind:value={$filterForm.name}
            placeholder="상품명 검색"
            class="focus:border-primary-500 w-48 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
          />
        </div>

        <!-- 판매 상태 필터 (우측 또는 아래) -->
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <input type="hidden" name="status" bind:value={$filterForm.status} />
          {#each salesStatuses as option}
            <button
              type="button"
              class={[
                'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                $filterForm.status === option.code && 'bg-primary-600 text-white',
                $filterForm.status !== option.code && 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ]}
              onclick={() => ($filterForm.status = option.code)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>

      {#if $filterErrors.dateFrom || $filterErrors.dateTo}
        <div class="mt-2 flex flex-col gap-1">
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
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900"> 상품명 </th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
              판매 상태
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">
              판매가격
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> 진행률 </th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">
              목표수량
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">
              주문수량
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900"> 판매일 </th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900"> 등록일 </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each coops as coop, index}
            <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {index + 1}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="flex items-center gap-2.5">
                  <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {#if coop.images && coop.images.length > 0}
                      <img
                        src={coop.images.find((img) => img.representative)?.url || coop.images[0]?.url}
                        alt={coop.name}
                        class="h-full w-full object-cover"
                      />
                    {:else}
                      <div class="flex h-full w-full items-center justify-center text-sm">📦</div>
                    {/if}
                  </div>
                  <div class="flex flex-1 items-center justify-between gap-3">
                    <div class="flex flex-col gap-0.5">
                      <button
                        type="button"
                        class="text-primary-600 hover:text-primary-700 text-left text-sm font-medium transition-colors hover:underline"
                        onclick={() => (selectedCoopId = coop.id)}
                      >
                        {coop.name}
                      </button>
                      {#if coop.id}
                        <span class="text-xs text-gray-400">{coop.id}</span>
                      {/if}
                    </div>
                    <div class="flex flex-col items-end gap-0.5 text-xs text-gray-500" class:self-center={!coop.id}>
                      {#if coop.category?.name || coop.product?.capacity || coop.product?.sellUnit}
                        <span class={!coop.product?.capacity && !coop.product?.sellUnit ? 'self-center' : ''}>
                          {coop.category?.name || ''}
                        </span>
                        {#if coop.product?.capacity || coop.product?.sellUnit}
                          <div class="flex items-center gap-1 whitespace-nowrap">
                            {#if coop.product?.capacity}
                              <span>{coop.product.capacity}</span>
                            {/if}
                            {#if coop.product?.capacity && coop.product?.sellUnit}
                              <span>·</span>
                            {/if}
                            {#if coop.product?.sellUnit}
                              <span>{coop.product.sellUnit}</span>
                            {/if}
                          </div>
                        {/if}
                      {/if}
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-{coop.status.color}-100 text-{coop
                    .status.color}-800"
                >
                  {coop.status?.label}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {formatCurrency(coop.salesPrice)}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center">
                <div class="flex items-center justify-center">
                  <div class="relative h-10 w-10">
                    <svg class="h-10 w-10 -rotate-90 transform">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        stroke-width="3"
                        fill="none"
                        class="text-gray-200"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        stroke-width="3"
                        fill="none"
                        stroke-dasharray={2 * Math.PI * 16}
                        stroke-dashoffset={2 * Math.PI * 16 * (1 - coop.orderedQuantity / coop.maxQuantity)}
                        class="{getProgressColor(coop).replace('bg-', 'text-')} transition-all duration-300"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-xs font-semibold text-gray-700">
                        {Math.round((coop.orderedQuantity / coop.maxQuantity) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {coop.maxQuantity.toLocaleString()}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {coop.orderedQuantity.toLocaleString()}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {dayjs(coop.salesDate).format('YYYY.MM.DD')}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-500">
                {dayjs(coop.createdAt).format('YYYY.MM.DD')}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="9" class="border-0 py-12 text-center">
                <div class="flex flex-col items-center justify-center">
                  <svg class="mb-2 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 class="text-sm font-medium text-gray-900">판매 상품이 없습니다</h3>
                  <p class="mt-1 text-sm text-gray-500">새 상품을 등록하여 시작하세요</p>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    {#if coops.length > 0}
      <div class="mt-6">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    {/if}
  </div>
</div>

{#if selectedCoopId}
  <CoopDetailModal coop={coops.find((c) => c.id === selectedCoopId) || null} onClose={() => (selectedCoopId = null)} />
{/if}

{#if showAlert}
  <Alert
    type={alertConfig.type}
    mode={alertConfig.mode}
    title={alertConfig.title}
    message={alertConfig.message}
    onConfirm={() => (showAlert = false)}
    onCancel={() => (showAlert = false)}
    onClose={() => (showAlert = false)}
  />
{/if}
