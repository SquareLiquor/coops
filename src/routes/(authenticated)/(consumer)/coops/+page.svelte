<script lang="ts">
  // Types
  type CoopItem = {
    id: number
    name: string
    price: number
    originalPrice: number
    image: string
    category: string
    progress: number
    remaining: string
    maxQuantity: number
    currentQuantity: number
    quantity: number
  }

  // State management
  let selectedDate = $state(new Date().toISOString().split('T')[0])
  let selectedCategory = $state('전체')
  let cartItems = $state<CoopItem[]>([])
  let isCartOpen = $state(false)

  // Mock data
  const categories = ['전체', '과일/채소', '육류/수산', '유제품', '생필품', '간식']
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  const coops = [
    {
      id: 1,
      name: '유기농 딸기 (2kg)',
      price: 25000,
      originalPrice: 35000,
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop&auto=format',
      category: '과일/채소',
      progress: 75,
      remaining: '2시간30분 후 마감',
      maxQuantity: 100,
      currentQuantity: 75,
      quantity: 0,
    },
    {
      id: 2,
      name: '국산 한우 등심 (500g)',
      price: 45000,
      originalPrice: 55000,
      image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop&auto=format',
      category: '육류/수산',
      progress: 60,
      remaining: '5시간15분 후 마감',
      maxQuantity: 50,
      currentQuantity: 30,
      quantity: 0,
    },
    {
      id: 3,
      name: '유기농 우유 (1L x 6개)',
      price: 18000,
      originalPrice: 24000,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format',
      category: '유제품',
      progress: 90,
      remaining: '1시간45분 후 마감',
      maxQuantity: 80,
      currentQuantity: 72,
      quantity: 0,
    },
    {
      id: 4,
      name: '제주 감귤 (3kg)',
      price: 22000,
      originalPrice: 30000,
      image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop&auto=format',
      category: '과일/채소',
      progress: 45,
      remaining: '6시간20분 후 마감',
      maxQuantity: 60,
      currentQuantity: 27,
      quantity: 0,
    },
    {
      id: 5,
      name: '친환경 세제 세트',
      price: 15000,
      originalPrice: 20000,
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=300&fit=crop&auto=format',
      category: '생필품',
      progress: 30,
      remaining: '12시간10분 후 마감',
      maxQuantity: 40,
      currentQuantity: 12,
      quantity: 0,
    },
    {
      id: 6,
      name: '수제 쿠키 세트',
      price: 12000,
      originalPrice: 16000,
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&auto=format',
      category: '간식',
      progress: 85,
      remaining: '3시간45분 후 마감',
      maxQuantity: 30,
      currentQuantity: 26,
      quantity: 0,
    },
  ]

  // Computed
  const filteredCoops = $derived.by(() => {
    return coops.filter((coop) => selectedCategory === '전체' || coop.category === selectedCategory)
  })

  const cartItemsCount = $derived.by(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = $derived.by(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  // Functions
  function updateQuantity(coopId: number, change: number) {
    const coop = coops.find((c) => c.id === coopId)
    if (!coop) return

    const newQuantity = Math.max(0, coop.quantity + change)
    coop.quantity = newQuantity

    // Update cart
    const existingItem = cartItems.find((item) => item.id === coopId)
    if (newQuantity === 0) {
      cartItems = cartItems.filter((item) => item.id !== coopId)
    } else if (existingItem) {
      existingItem.quantity = newQuantity
    } else {
      cartItems = [...cartItems, { ...coop, quantity: newQuantity }]
    }
  }

  function removeFromCart(coopId: number) {
    const coop = coops.find((c) => c.id === coopId)
    if (coop) coop.quantity = 0
    cartItems = cartItems.filter((item) => item.id !== coopId)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '내일'
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
</script>

<!-- 소비자 공동구매 페이지 - Mobile First -->
<div class="from-surface-50/50 to-surface-50/10 min-h-screen bg-gradient-to-br">
  <!-- Filter Section -->
  <div
    class="border-surface-200 from-primary-500/5 dark:border-surface-700 dark:from-primary-500/5 dark:to-surface-800 border-b bg-gradient-to-b to-white px-4 pb-4 pt-2"
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

        <!-- Category Filter -->
        <div class="flex flex-1 space-x-2 overflow-x-auto">
          {#each categories as category}
            <button
              class={selectedCategory === category
                ? 'bg-primary-500 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium text-white'
                : 'border-surface-200 text-surface-700 hover:bg-surface-50 dark:text-surface-700 dark:hover:bg-surface-50 whitespace-nowrap rounded-full border bg-white px-3 py-1 text-sm font-medium transition-colors dark:bg-white'}
              onclick={() => (selectedCategory = category)}
            >
              {category}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-3 pb-24">
    <!-- Products Grid -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {#each filteredCoops as coop}
        <div
          class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <!-- Product Image -->
          <div
            class="from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 relative aspect-[5/3] bg-gradient-to-br"
          >
            <img src={coop.image} alt={coop.name} class="h-full w-full object-cover" loading="lazy" />
            <!-- Category Badge - Top Floating -->
            <div class="absolute left-2 top-2">
              <span class="bg-primary-500 rounded-full px-1.5 py-0.5 text-xs font-medium text-white">
                {coop.category}
              </span>
            </div>

            <!-- Progress Circle & Time - Bottom Right -->
            <div class="absolute bottom-2 right-2 flex flex-col items-end space-y-1">
              <!-- Progress Circle -->
              <div class="relative rounded-full bg-black/40 p-1 backdrop-blur-sm">
                <svg class="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <!-- Background circle -->
                  <path
                    class="text-white/40"
                    d="M18 2.0845
											a 15.9155 15.9155 0 0 1 0 31.831
											a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  />
                  <!-- Progress circle -->
                  <path
                    class="text-primary-400"
                    d="M18 2.0845
											a 15.9155 15.9155 0 0 1 0 31.831
											a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-dasharray="{coop.progress}, 100"
                  />
                </svg>
                <!-- Percentage text -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xs font-bold text-white drop-shadow-md">{coop.progress}%</span>
                </div>
              </div>
              <!-- Time remaining -->
              <div class="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                {coop.remaining}
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-2.5">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-surface-900 dark:text-surface-100 line-clamp-1 text-sm font-bold">
                  {coop.name}
                </h3>
                <div class="mt-0.5 flex items-center space-x-1">
                  <span class="text-primary-600 text-sm font-bold">{coop.price.toLocaleString()}원</span>
                  <span class="text-surface-500 text-xs line-through">{coop.originalPrice.toLocaleString()}원</span>
                </div>
              </div>

              <!-- Quantity Controls -->
              <div class="ml-2 flex items-center space-x-1.5">
                <button
                  class="bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-50"
                  onclick={() => updateQuantity(coop.id, -1)}
                  disabled={coop.quantity === 0}
                  aria-label="수량 감소"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="text-surface-900 dark:text-surface-100 w-8 text-center text-sm font-medium"
                  >{coop.quantity}</span
                >
                <button
                  class="bg-primary-500 hover:bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                  onclick={() => updateQuantity(coop.id, 1)}
                  aria-label="수량 증가"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {#if coop.quantity > 0}
              <div class="mt-1 text-right">
                <div class="text-primary-600 text-xs font-medium">
                  {(coop.price * coop.quantity).toLocaleString()}원
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </main>

  <!-- Footer / Cart -->
  <footer
    class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t bg-white p-4 shadow-2xl"
  >
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <svg
            class="text-surface-600 dark:text-surface-400 h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
            />
          </svg>
          {#if cartItemsCount > 0}
            <span
              class="bg-primary-500 absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
            >
              {cartItemsCount}
            </span>
          {/if}
        </div>
        <span class="text-surface-700 dark:text-surface-300 text-sm font-medium">{cartItemsCount}개 상품</span>
      </div>

      <button
        class="bg-primary-500 hover:bg-primary-600 rounded-lg px-6 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        onclick={() => (isCartOpen = true)}
        disabled={cartItemsCount === 0}
      >
        장바구니 ({cartTotal.toLocaleString()}원)
      </button>
    </div>
  </footer>
</div>

<!-- Cart Modal -->
{#if isCartOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onclick={() => (isCartOpen = false)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Escape' && (isCartOpen = false)}
  >
    <div
      class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 w-full max-w-md space-y-4 rounded-xl border bg-white p-6 shadow-xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && e.stopPropagation()}
    >
      <header class="flex items-center justify-between">
        <h3 class="text-surface-900 dark:text-surface-100 text-xl font-bold">장바구니</h3>
        <button
          class="bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          onclick={() => (isCartOpen = false)}
          aria-label="닫기"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {#if cartItems.length === 0}
        <div class="py-8 text-center">
          <p class="text-surface-500">장바구니가 비어있습니다</p>
        </div>
      {:else}
        <div class="max-h-60 space-y-3 overflow-y-auto">
          {#each cartItems as item}
            <div class="bg-surface-50 dark:bg-surface-700 flex items-center justify-between rounded-lg p-3">
              <div class="flex-1">
                <h4 class="text-surface-900 dark:text-surface-100 text-sm font-medium">
                  {item.name}
                </h4>
                <p class="text-surface-500 text-xs">
                  {item.price.toLocaleString()}원 x {item.quantity}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-surface-900 dark:text-surface-100 font-medium"
                  >{(item.price * item.quantity).toLocaleString()}원</span
                >
                <button
                  class="bg-surface-200 hover:bg-surface-300 dark:bg-surface-600 dark:hover:bg-surface-500 flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                  onclick={() => removeFromCart(item.id)}
                  aria-label="삭제"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>

        <div class="border-surface-200 dark:border-surface-600 border-t pt-4">
          <div class="flex items-center justify-between">
            <span class="text-surface-900 dark:text-surface-100 text-lg font-bold"
              >총 {cartTotal.toLocaleString()}원</span
            >
            <button
              class="bg-primary-500 hover:bg-primary-600 rounded-lg px-6 py-2 font-medium text-white transition-colors"
              >주문하기</button
            >
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
