<script lang="ts">
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { supabase } = data

  onMount(async () => {})
  // Types
  type OrderItem = {
    id: number
    productId: number
    productName: string
    productImage: string
    price: number
    quantity: number
    category: string
  }

  type Order = {
    id: number
    orderDate: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    totalAmount: number
    totalItems: number
    items: OrderItem[]
    pickupDate: string
  }

  // State management
  let selectedDate = $state(new Date().toISOString().split('T')[0])
  let selectedStatus = $state('전체')

  // Mock data
  const statusOptions = ['전체', '대기중', '확정', '완료', '취소']
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  })

  const orders: Order[] = [
    {
      id: 1001,
      orderDate: '2025-10-12',
      status: 'confirmed',
      totalAmount: 67000,
      totalItems: 3,
      pickupDate: '2025-10-13',
      items: [
        {
          id: 1,
          productId: 1,
          productName: '유기농 딸기 (2kg)',
          productImage: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop&auto=format',
          price: 25000,
          quantity: 2,
          category: '과일/채소',
        },
        {
          id: 2,
          productId: 3,
          productName: '유기농 우유 (1L x 6개)',
          productImage: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format',
          price: 18000,
          quantity: 1,
          category: '유제품',
        },
      ],
    },
    {
      id: 1002,
      orderDate: '2025-10-11',
      status: 'completed',
      totalAmount: 45000,
      totalItems: 1,
      pickupDate: '2025-10-12',
      items: [
        {
          id: 3,
          productId: 2,
          productName: '국산 한우 등심 (500g)',
          productImage: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop&auto=format',
          price: 45000,
          quantity: 1,
          category: '육류/수산',
        },
      ],
    },
    {
      id: 1003,
      orderDate: '2025-10-10',
      status: 'pending',
      totalAmount: 34000,
      totalItems: 2,
      pickupDate: '2025-10-13',
      items: [
        {
          id: 4,
          productId: 4,
          productName: '제주 감귤 (3kg)',
          productImage: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop&auto=format',
          price: 22000,
          quantity: 1,
          category: '과일/채소',
        },
        {
          id: 5,
          productId: 6,
          productName: '수제 쿠키 세트',
          productImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&auto=format',
          price: 12000,
          quantity: 1,
          category: '간식',
        },
      ],
    },
  ]

  // Computed
  const filteredOrders = $derived.by(() => {
    return orders.filter((order) => {
      const statusMatch = selectedStatus === '전체' || getStatusText(order.status) === selectedStatus
      const dateMatch = order.orderDate === selectedDate || selectedDate === new Date().toISOString().split('T')[0]
      return statusMatch && (selectedDate === new Date().toISOString().split('T')[0] || dateMatch)
    })
  })

  // Functions
  function getStatusText(status: Order['status']): string {
    const statusMap = {
      pending: '대기중',
      confirmed: '확정',
      completed: '완료',
      cancelled: '취소',
    }
    return statusMap[status]
  }

  function getStatusColor(status: Order['status']): string {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colorMap[status]
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '내일'
    if (diffDays === -1) return '어제'
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  function canCancelOrder(order: Order): boolean {
    return order.status === 'pending' || order.status === 'confirmed'
  }

  function cancelOrder(orderId: number) {
    const order = orders.find((o) => o.id === orderId)
    if (order && canCancelOrder(order)) {
      order.status = 'cancelled'
    }
  }
</script>

<svelte:head>
  <title>주문내역 - 공동구매</title>
</svelte:head>

<!-- 소비자 주문내역 페이지 - Mobile First -->
<!-- Filter Section -->
<div
  class="border-surface-200 from-primary-500/5 dark:border-surface-700 dark:from-primary-500/5 dark:to-surface-800 border-b bg-gradient-to-b to-white px-4 pt-2 pb-4"
>
  <div class="container mx-auto">
    <div class="flex items-center space-x-4">
      <!-- Date Filter -->
      <div class="flex-shrink-0">
        <button
          class="border-surface-300 hover:border-primary-500 dark:border-surface-600 flex items-center space-x-1.5 rounded-lg border bg-white px-2.5 py-1.5 transition-colors dark:bg-white"
        >
          <svg class="text-surface-600 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="text-surface-700 text-xs font-medium">{formatDate(selectedDate)}</span>
        </button>
      </div>

      <!-- Status Filter -->
      <div class="flex flex-1 space-x-2 overflow-x-auto">
        {#each statusOptions as status}
          <button
            class={selectedStatus === status
              ? 'bg-primary-500 text-surface-50 rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap'
              : 'border-surface-200 text-surface-700 hover:bg-surface-50 dark:text-surface-700 dark:hover:bg-surface-50 rounded-full border bg-white px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors dark:bg-white'}
            onclick={() => (selectedStatus = status)}
          >
            {status}
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
                    {order.orderDate}
                  </div>
                </button>
              </div>

              <div class="flex items-center space-x-2">
                {#if canCancelOrder(order)}
                  <button
                    class="rounded-lg border border-red-300 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    onclick={() => cancelOrder(order.id)}
                  >
                    취소
                  </button>
                {/if}
                <span class={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-4">
            <div class="space-y-3">
              {#each order.items as item}
                <div class="flex items-center space-x-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    class="h-12 w-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-surface-900 dark:text-surface-100 truncate text-sm font-medium">
                      {item.productName}
                    </p>
                    <p class="text-surface-600 dark:text-surface-400 text-xs">
                      {item.price.toLocaleString()}원 × {item.quantity}개
                    </p>
                  </div>
                  <div class="text-surface-900 dark:text-surface-100 text-sm font-semibold">
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Order Footer -->
          <div class="border-surface-300 dark:border-surface-600 border-t border-dashed bg-white p-4 dark:bg-white">
            <div class="flex items-center justify-between">
              <div class="text-surface-600 dark:text-surface-400 text-sm">
                총 {order.totalItems}개 상품
              </div>
              <div class="text-primary-600 text-lg font-bold">
                {order.totalAmount.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>
