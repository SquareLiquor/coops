<script lang="ts">
  import DatePicker from '$lib/components/ui/DatePicker.svelte'
  import { orderDataConverter } from '$lib/converters/orderConverter'
  import { getAuth, getStore } from '$lib/stores'
  import { type OrderData } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import dayjs from 'dayjs'
  import { onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { supabase, ordersSelectQuery, statuses } = data

  let orders = $state<OrderData[]>([])
  let filteredOrders = $derived.by(() => {
    return orders.filter((order) => {
      const matchesDate = selectedDate ? dayjs(order.orderedAt).isSame(dayjs(selectedDate), 'day') : true
      const matchesStatus = selectedStatus ? order.status.code === selectedStatus : true
      return matchesDate && matchesStatus
    })
  })

  let selectOrderId = $state<string | null>(null)
  let selectedDate = $state<string | undefined>(undefined)
  let selectedStatus = $state<string | undefined>(undefined)

  onMount(async () => {
    await tick()
    const { user } = getAuth()
    const store = getStore()

    const { data: orderDatas } = await supabase.from('orders').select(ordersSelectQuery).eq('user_id', user!.id)

    orders = orderDataConverter().convertAll(orderDatas ?? [])
  })
</script>

<svelte:head>
  <title>주문내역 - 공동구매</title>
</svelte:head>

<div class="border-surface-200 from-primary-500/5 border-b bg-gradient-to-b to-white px-4 pt-2 pb-4">
  <div class="container mx-auto">
    <div class="flex items-center space-x-4">
      <div class="w-35 flex-shrink-0">
        <DatePicker bind:selectedDate />
      </div>

      <div class="scrollbar-hide flex flex-1 space-x-2 overflow-x-scroll">
        {#each [{ code: undefined, label: '전체' }, ...statuses] as status}
          <button
            class="rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap"
            class:text-white={selectedStatus === status.code}
            class:bg-primary-500={selectedStatus === status.code}
            class:text-surface-700={selectedStatus !== status.code}
            class:border-surface-200={selectedStatus !== status.code}
            class:hover:bg-surface-50={selectedStatus !== status.code}
            class:border={selectedStatus !== status.code}
            class:bg-white={selectedStatus !== status.code}
            onclick={() => (selectedStatus = status.code)}
          >
            {status.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<!-- Main Content -->
<main class="container mx-auto px-4 py-4 pb-20">
  {#if filteredOrders.length === 0}
    <!-- Empty State -->
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <svg class="text-surface-400 mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="text-surface-900 dark:text-surface-100 mb-2 text-lg font-semibold">주문 내역이 없습니다</h3>
      <p class="text-surface-600 dark:text-surface-400">선택한 조건에 해당하는 주문이 없어요.</p>
    </div>
  {:else}
    <!-- Orders List -->
    <div class="space-y-4">
      {#each filteredOrders as order}
        <div
          class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 overflow-hidden rounded-xl border bg-white shadow-sm"
        >
          <!-- Order Header -->
          <div class="border-surface-300 dark:border-surface-600 border-b border-dashed p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <button
                  class="text-left"
                  onclick={() => {
                    /* TODO: 주문 상세 레이어 호출 */
                  }}
                >
                  <div class="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors">
                    주문번호 #{order.id}
                  </div>
                  <div class="text-surface-600 dark:text-surface-400 text-xs">
                    {dayjs(order.orderedAt).format('YYYY-MM-DD')}
                    {dayjs(order.orderedAt).format('HH:mm:ss')}
                  </div>
                </button>
              </div>

              <div class="flex items-center space-x-2">
                <!-- {#if canCancelOrder(order)}
                  <button
                    class="rounded-lg border border-red-300 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    onclick={() => cancelOrder(order.id)}
                  >
                    취소
                  </button>
                {/if}
                <span class={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span> -->
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-4">
            <div class="space-y-3">
              {#each order.items as item}
                <div class="flex items-center space-x-3">
                  <img
                    src={item.images.find((image) => image.representative)?.url}
                    alt={item.coop.name}
                    class="h-12 w-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-surface-900 dark:text-surface-100 truncate text-sm font-medium">
                      {item.coop.name}
                    </p>
                    <p class="text-surface-600 dark:text-surface-400 text-xs">
                      {formatCurrency(item.price)} × {item.quantity}개
                    </p>
                  </div>
                  <div class="text-surface-900 dark:text-surface-100 text-sm font-semibold">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Order Footer -->
          <div class="border-surface-300 dark:border-surface-600 border-t border-dashed bg-white p-4 dark:bg-white">
            <div class="flex items-center justify-between">
              <div class="text-surface-600 dark:text-surface-400 text-sm">
                총 {order.items.length}개 상품
              </div>
              <div class="text-primary-600 text-lg font-bold">
                {formatCurrency(order.totalPrice)}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>
