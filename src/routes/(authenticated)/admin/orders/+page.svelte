<script lang="ts">
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import OrderDetailModal from '$lib/components/modals/admin/OrderDetailModal.svelte'
  import { OrdersFilterSchema } from '$lib/schemas'
  import { type OrderEntity } from '$lib/types'
  import { formatCurrency, toaster } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, setContext, tick } from 'svelte'
  import { superForm } from 'sveltekit-superforms'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { salesStatuses } = data
  let orders: OrderEntity[] = $state([])
  let selectedOrder: OrderEntity | null = $state(null)

  onMount(async () => {
    await tick()

    await asyncFilterSubmit()
  })

  onDestroy(() => debouncedSubmit?.cancel?.())

  // 모달에서 사용할 수 있도록 context 설정
  setContext('updateOrder', async (orderId: string) => {
    // 주문 목록 재조회 및 완료 대기
    await asyncFilterSubmit()

    // 재조회 완료 후 selectedOrder 업데이트
    const updatedOrder = orders.find((order) => order.id === orderId)
    if (updatedOrder) selectedOrder = updatedOrder
  })

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    enhance: filterEnhance,
    submitting: filterSubmitting,
    asyncSubmit: asyncFilterSubmit,
    debouncedSubmit,
  } = buildFilterForm<typeof OrdersFilterSchema>({
    form: data.filterForm,
    schema: OrdersFilterSchema,
    resultHandler: {
      handleSuccess: (result) => (orders = result.data?.orders || []),
      handleFailure: () => (orders = []),
    },
  })

  const { form, enhance, submitting } = superForm(data.form, {
    onResult: async ({ result }: { result: ActionResult }) => {
      if (result.type === 'success' || result.type === 'failure') {
        const toast = result.type === 'success' ? toaster.success : toaster.error

        await asyncFilterSubmit()
        toast({
          description: result.data?.form.message,
          duration: 5000,
        })
      }
    },
  })
</script>

<svelte:head>
  <title>주문 관리 - 관리자</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">주문 관리</h1>
  </div>

  <div class="relative">
    <form method="POST" action="?/fetch" use:filterEnhance class="mb-4" autocomplete="off">
      <input type="hidden" name="storeId" bind:value={$filterForm.storeId} />

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

          <!-- 주문자 검색 -->
          <input
            type="text"
            name="name"
            bind:value={$filterForm.name}
            placeholder="주문자 검색"
            class="focus:border-primary-500 w-48 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
          />
        </div>

        <!-- 주문 상태 필터 (우측 또는 아래) -->
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
      {#if $filterSubmitting || $submitting}
        <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
          <span class="loader-giant"></span>
        </div>
      {/if}

      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-white">
            <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> # </th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">
              주문 번호
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
              주문 상태
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900"> 상품명 </th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">
              주문 금액
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> 구매자 </th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">
              구매일자
            </th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">액션</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each orders as order, index (order.id)}
            <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {index + 1}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <span class="block max-w-[120px] truncate text-xs text-gray-600" title={order.id}>
                  {order.id}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span
                  class={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-${order.status?.color}-800 bg-${order.status?.color}-100`}
                >
                  {order.status?.label}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="flex items-center gap-2.5">
                  <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {#if order.items[0]?.coop.images && order.items[0].coop.images.length > 0}
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
                  <div class="flex flex-1 items-center justify-between gap-3">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-700 text-left text-sm font-medium transition-colors hover:underline"
                      onclick={() => (selectedOrder = order)}
                    >
                      {order.items[0]?.coop.name}
                      {#if order.items.length && order.items.length > 1}
                        외 {order.items.length - 1}건
                      {/if}
                    </button>
                    <div class="flex flex-col items-end gap-0.5 text-xs text-gray-500">
                      {#if order.items[0]?.coop.category?.name || order.items[0]?.coop.product?.capacity || order.items[0]?.coop.product?.sellUnit}
                        <span
                          class={!order.items[0]?.coop.product?.capacity && !order.items[0]?.coop.product?.sellUnit
                            ? 'self-center'
                            : ''}
                        >
                          {order.items[0]?.coop.category?.name || ''}
                        </span>
                        {#if order.items[0]?.coop.product?.capacity || order.items[0]?.coop.product?.sellUnit}
                          <div class="flex items-center gap-1 whitespace-nowrap">
                            {#if order.items[0]?.coop.product?.capacity}
                              <span>{order.items[0].coop.product.capacity}</span>
                            {/if}
                            {#if order.items[0]?.coop.product?.capacity && order.items[0]?.coop.product?.sellUnit}
                              <span>·</span>
                            {/if}
                            {#if order.items[0]?.coop.product?.sellUnit}
                              <span>{order.items[0].coop.product.sellUnit}</span>
                            {/if}
                          </div>
                        {/if}
                      {/if}
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600"
                >{formatCurrency(order.totalPrice)}</td
              >
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">{order.userName}</td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {dayjs(order.createdAt).format('YYYY.MM.DD')}
              </td>

              <td class="border-r border-gray-100 px-3 py-2">
                <form method="POST" use:enhance>
                  <input type="hidden" name="orderId" value={order.id} />

                  <div class="flex flex-row flex-wrap items-center justify-center gap-1">
                    {#if order.completableForAdmin}
                      <button
                        class="bg-success-500 hover:bg-success-600 min-w-[60px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                        formaction="?/confirm"
                        onclick={(e) => !confirm('주문 완료 처리 하시겠습니까?') && e.preventDefault()}
                      >
                        주문 확인
                      </button>
                    {/if}
                    {#if order.cancelableForAdmin}
                      <button
                        class="bg-error-500 hover:bg-error-600 min-w-[60px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                        formaction="?/cancel"
                        onclick={(e) => !confirm('주문 취소 처리 하시겠습니까?') && e.preventDefault()}
                      >
                        주문 취소
                      </button>
                    {/if}
                    {#if order.restorableForAdmin}
                      <button
                        class="bg-warning-500 hover:bg-warning-600 min-w-[60px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                        formaction="?/restore"
                        onclick={(e) => !confirm('주문 복구 처리 하시겠습니까?') && e.preventDefault()}
                      >
                        주문 복구
                      </button>
                    {/if}
                  </div>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if orders.length === 0}
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">주문 정보가 없습니다</h3>
          </div>
        </div>
      {/if}
    </div>
  </div>

  {#if selectedOrder}
    <OrderDetailModal form={data.form} order={selectedOrder} onClose={() => (selectedOrder = null)} />
  {/if}
</div>
