<script lang="ts">
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import { buildForm } from '$lib/builders/form.builder'
  import PageHeader from '$lib/components/layout/PageHeader.svelte'
  import OrderDetailModal from '$lib/components/modals/admin/OrderDetailModal.svelte'
  import EmptyState from '$lib/components/ui/EmptyState.svelte'
  import Loading from '$lib/components/ui/Loading.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { OrdersFilterSchema, OrderUpdateSchema } from '$lib/schemas'
  import { showError, showSuccess } from '$lib/stores'
  import { type OrderEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, setContext, tick } from 'svelte'
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
    pagination,
  } = buildFilterForm<typeof OrdersFilterSchema>({
    form: data.filterForm,
    schema: OrdersFilterSchema,
    resultHandler: {
      handleSuccess: (result) => (orders = result.data?.orders || []),
      handleFailure: () => (orders = []),
    },
  })

  const { form, enhance, submitting } = buildForm<typeof OrderUpdateSchema>({
    form: data.form,
    schema: OrderUpdateSchema,
    resultHandler: {
      handleSuccess: async (result) => {
        await asyncFilterSubmit()
        showSuccess({ message: result.data?.form.message || '성공했습니다.' })
      },
      handleFailure: async (result) => {
        await asyncFilterSubmit()
        showError({ message: result.data?.form.message || '오류가 발생했습니다.' })
      },
    },
  })
</script>

<div class="min-h-screen bg-gray-100 p-6">
  <PageHeader title="주문 관리" />

  <div class="relative">
    <Loading show={$filterSubmitting || $submitting} />

    {@render filter()}

    <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-white">
            <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> # </th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900"> 상품명 </th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
              주문 상태
            </th>
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
                    <div class="flex flex-col gap-0.5">
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
                      {#if order.id}
                        <span class="text-xs text-gray-400">{order.id}</span>
                      {/if}
                    </div>
                    <div class="flex flex-col items-end gap-0.5 text-xs text-gray-500" class:self-center={!order.id}>
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
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span class={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${order.status?.badgeClass}`}>
                  {order.status?.label}
                </span>
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

      <EmptyState show={orders.length === 0} title="주문 정보가 없습니다" />
    </div>

    <Pagination {pagination} onPageChange={(page) => ($filterForm.page = page)} />
  </div>

  {#if selectedOrder}
    <OrderDetailModal form={data.form} order={selectedOrder} onClose={() => (selectedOrder = null)} />
  {/if}
</div>

{#snippet filter()}
  <form method="POST" action="?/fetch" use:filterEnhance class="mb-4" autocomplete="off">
    <input type="hidden" name="storeId" bind:value={$filterForm.storeId} />
    <input type="hidden" name="page" bind:value={$filterForm.page} />

    <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-2">
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

        <input
          type="text"
          name="name"
          bind:value={$filterForm.name}
          placeholder="주문자 검색"
          class="focus:border-primary-500 w-48 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
        />
      </div>

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
{/snippet}
