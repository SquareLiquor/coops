<script lang="ts">
  import { OrdersFilterSchema as FilterSchema } from '$lib/schemas'
  import { type OrderData } from '$lib/types'
  import { debounce, formatCurrency } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, tick } from 'svelte'
  import { superForm } from 'sveltekit-superforms'
  import { valibot } from 'sveltekit-superforms/adapters'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { salesStatuses } = data
  let orders: OrderData[] = $state([])
  let selectedOrderId: string | null = $state(null)
  let debouncedFilterSubmit: ReturnType<typeof debounce>

  onMount(async () => {
    await tick()

    debouncedFilterSubmit = debounce(async () => {
      const result = await validateFilterForm({ update: true })
      if (result.valid) filterSubmit()
    }, 300)

    filterSubmit()
  })

  onDestroy(() => debouncedFilterSubmit?.cancel?.())

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    validateForm: validateFilterForm,
    enhance: filterEnhance,
    submit: filterSubmit,
    submitting: filterSubmitting,
  } = superForm(data.filterForm, {
    validators: valibot(FilterSchema),
    resetForm: false,
    onChange: async ({ target }) => {
      try {
        if ((target as HTMLInputElement)?.type === 'text') {
          debouncedFilterSubmit()
        } else {
          const result = await validateFilterForm({ update: true })
          if (result.valid) filterSubmit()
        }
      } catch (e) {
        console.error('validate form error:', e)
      }
    },
    onResult: ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') orders = result.data?.orders || []
      if (result?.type === 'failure') orders = []
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
              class="focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              class:border-primary-500={$filterForm.dateFrom}
              class:text-primary-700={$filterForm.dateFrom}
              class:border-surface-100={!$filterForm.dateFrom}
              {...$filterConstraints.dateFrom}
            />
            <span class="text-surface-400">~</span>
            <input
              type="date"
              name="dateTo"
              bind:value={$filterForm.dateTo}
              class="focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              class:border-primary-500={$filterForm.dateTo}
              class:text-primary-700={$filterForm.dateTo}
              class:border-surface-100={!$filterForm.dateTo}
              {...$filterConstraints.dateTo}
            />
          </div>
        </div>

        <input
          type="text"
          name="name"
          bind:value={$filterForm.name}
          placeholder="주문자 검색"
          class="focus:border-primary-500 w-40 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
          class:border-primary-500={$filterForm.name}
          class:text-primary-700={$filterForm.name}
          class:border-surface-100={!$filterForm.name}
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
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors {$filterForm.status === option.code
            ? 'bg-primary-500 text-white shadow-sm'
            : 'text-surface-600 hover:bg-surface-100'}"
          onclick={() => ($filterForm.status = option.code)}
        >
          {option.label}
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
          <!-- <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 주문 번호 </th> -->
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 주문 상태 </th>
          <th class="text-surface-500 w-[25%] px-4 py-3 text-sm font-bold"> 상품명 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 주문 금액 </th>
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 구매자 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 구매일자 </th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody class="divide-surface-100 divide-y bg-white">
        {#each orders as order, index (order.id)}
          <tr class="hover:bg-surface-50 text-center">
            <td class="text-surface-500 py-4 text-sm">
              {index + 1}
            </td>
            <!-- <td class="text-surface-500 px-6 py-4 text-sm">{order.id}</td> -->
            <td class="text-surface-500 px-6 py-4 text-sm">
              <span
                class={`inline-flex rounded-full px-2 py-1 text-xs font-medium text-white bg-${order.status?.color}-500`}
              >
                {order.status?.label}
              </span>
            </td>
            <td class="px-4 py-4 text-left">
              <div class="flex flex-col items-start">
                <span class="text-surface-900 text-sm font-medium"
                  >{order.items[0]?.coop.name}
                  {#if order.items.length && order.items.length > 1}
                    외 {order.items.length - 1}건
                  {/if}
                </span>
              </div>
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm font-medium whitespace-nowrap"
              >{formatCurrency(order.totalPrice)}</td
            >
            <td class="text-surface-700 px-4 py-4 text-center text-sm">{order.userName}</td>
            <td class="text-surface-700 px-4 py-4 text-center text-sm whitespace-nowrap">
              {dayjs(order.orderedAt).format('YYYY-MM-DD')}
              {dayjs(order.orderedAt).format('HH:mm:ss')}
            </td>

            <td class="px-4 py-4"></td>
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
