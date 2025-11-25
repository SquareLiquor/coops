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

<!-- Header -->
<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">주문 관리</h1>
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

        <input
          type="text"
          name="name"
          bind:value={$filterForm.name}
          placeholder="주문자 검색"
          class={[
            'focus:border-primary-500 w-40 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none',
            $filterForm.name && 'border-primary-500 text-primary-700',
            !$filterForm.name && 'border-surface-100',
          ]}
        />
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
    <!-- 우측 상태 필터 영역 -->
    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      <input type="hidden" name="status" bind:value={$filterForm.status} />
      {#each salesStatuses as option}
        <button
          type="button"
          class={[
            'rounded px-3 py-1.5 text-sm font-medium transition-colors',
            $filterForm.status === option.code && 'bg-primary-500 text-white shadow-sm',
            $filterForm.status !== option.code && 'text-surface-600 hover:bg-surface-100',
          ]}
          onclick={() => ($filterForm.status = option.code)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </form>

  <div class="border-surface-100 bg-surface-50/50 relative overflow-hidden rounded-lg border">
    {#if $filterSubmitting || $submitting}
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
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 주문 번호 </th>
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 주문 상태 </th>
          <th class="text-surface-500 w-[25%] px-4 py-3 text-sm font-bold"> 상품명 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 주문 금액 </th>
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 구매자 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 구매일자 </th>
          <th class="text-surface-500 w-[10%] px-6 text-center font-bold"></th>
        </tr>
      </thead>
      <tbody class="divide-surface-100 divide-y bg-white">
        {#each orders as order, index (order.id)}
          <tr class="hover:bg-surface-50 text-center">
            <td class="text-surface-500 py-4 text-sm">
              {index + 1}
            </td>
            <td class="text-surface-500 px-6 py-4 text-sm">
              <span class="block max-w-[120px] truncate" title={order.id}>
                {order.id}
              </span>
            </td>
            <td class="text-surface-500 px-6 py-4 text-sm">
              <span
                class={`inline-flex rounded-md px-2 py-1 text-xs font-medium text-${order.status?.color}-800 bg-${order.status?.color}-100`}
              >
                {order.status?.label}
              </span>
            </td>
            <td class="px-4 py-4 text-left">
              <div class="flex flex-col items-start">
                <button
                  type="button"
                  class="text-primary-600 text-sm font-medium outline-none hover:underline focus:underline"
                  onclick={() => (selectedOrder = order)}
                >
                  {order.items[0]?.coop.name}
                  {#if order.items.length && order.items.length > 1}
                    외 {order.items.length - 1}건
                  {/if}
                </button>
              </div>
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm font-medium whitespace-nowrap"
              >{formatCurrency(order.totalPrice)}</td
            >
            <td class="text-surface-700 px-4 py-4 text-center text-sm">{order.userName}</td>
            <td class="text-surface-700 px-4 py-4 text-center text-sm whitespace-nowrap">
              {dayjs(order.createdAt).format('YYYY-MM-DD')}
              {dayjs(order.createdAt).format('HH:mm:ss')}
            </td>

            <td>
              <form method="POST" use:enhance>
                <input type="hidden" name="orderId" value={order.id} />

                <div class="flex flex-row flex-wrap items-center justify-center gap-1">
                  {#if order.completableForAdmin}
                    <button
                      class="bg-success-500 hover:bg-success-600 min-w-[60px] rounded px-2 py-1 text-xs font-medium text-white"
                      formaction="?/confirm"
                      onclick={(e) => !confirm('주문 완료 처리 하시겠습니까?') && e.preventDefault()}
                    >
                      주문 확인
                    </button>
                  {/if}
                  {#if order.cancelableForAdmin}
                    <button
                      class="bg-error-500 hover:bg-error-600 min-w-[60px] rounded px-2 py-1 text-xs font-medium text-white"
                      formaction="?/cancel"
                      onclick={(e) => !confirm('주문 취소 처리 하시겠습니까?') && e.preventDefault()}
                    >
                      주문 취소
                    </button>
                  {/if}
                  {#if order.restorableForAdmin}
                    <button
                      class="bg-warning-500 hover:bg-warning-600 min-w-[60px] rounded px-2 py-1 text-xs font-medium text-white"
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
        <h3 class="text-surface-900 mt-2 text-sm font-medium">판매 상품 정보가 없습니다</h3>
      </div>
    {/if}
  </div>
</div>

{#if selectedOrder}
  <OrderDetailModal form={data.form} order={selectedOrder} onClose={() => (selectedOrder = null)} />
{/if}
