<script lang="ts">
  // Mock data - 실제 환경에서는 API에서 가져옴
  let stats = {
    totalOrders: 245,
    totalRevenue: 8940000,
    activeCoops: 12,
    pendingOrders: 23,
  }

  let recentOrders = [
    {
      id: 'ORD-001',
      customerName: '김농부',
      product: '유기농 쌀 10kg',
      amount: 45000,
      status: 'pending',
      createdAt: '2024-12-19 14:30',
    },
    {
      id: 'ORD-002',
      customerName: '이농부',
      product: '사과 5kg',
      amount: 25000,
      status: 'confirmed',
      createdAt: '2024-12-19 13:15',
    },
    {
      id: 'ORD-003',
      customerName: '박농부',
      product: '배추 10포기',
      amount: 15000,
      status: 'shipped',
      createdAt: '2024-12-19 11:45',
    },
    {
      id: 'ORD-004',
      customerName: '최농부',
      product: '무 20개',
      amount: 12000,
      status: 'confirmed',
      createdAt: '2024-12-19 10:20',
    },
    {
      id: 'ORD-005',
      customerName: '정농부',
      product: '당근 3kg',
      amount: 8000,
      status: 'pending',
      createdAt: '2024-12-19 09:30',
    },
  ]

  let activeCoops = [
    {
      id: 'COOP-001',
      title: '겨울 김치용 배추 공동구매',
      minQuantity: 100,
      currentQuantity: 85,
      endDate: '2024-12-25',
      status: 'active',
    },
    {
      id: 'COOP-002',
      title: '제주 한라봉 공동구매',
      minQuantity: 100,
      currentQuantity: 95,
      endDate: '2024-12-22',
      status: 'almost_full',
    },
    {
      id: 'COOP-003',
      title: '양파 20kg 공동구매',
      minQuantity: 50,
      currentQuantity: 100,
      endDate: '2024-12-20',
      status: 'completed',
    },
    {
      id: 'COOP-004',
      title: '유기농 쌀 10kg 공동구매',
      minQuantity: 80,
      currentQuantity: 42,
      endDate: '2024-12-28',
      status: 'active',
    },
  ]

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'almost_full':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'full':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  function getProgressPercentage(current: number, min: number): number {
    return Math.min((current / min) * 100, 100)
  }
</script>

<svelte:head>
  <title>Dashboard - 관리자</title>
</svelte:head>

<!-- Header -->
<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">Dashboard</h1>
  </div>
</div>

<!-- Content -->
<div class="flex-1 space-y-6 overflow-auto p-6">
  <!-- Welcome Section -->
  <div class="from-primary-500 to-primary-600 rounded-xl bg-gradient-to-r p-6 text-white">
    <h2 class="mb-2 text-2xl font-bold">안녕하세요, 김관리자님!</h2>
    <p class="text-white">오늘도 좋은 하루 되세요. 강남점의 현황을 확인해보세요.</p>
  </div>

  <!-- Stats Cards -->
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <div class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 class="text-surface-600 text-sm font-medium tracking-tight">총 주문수</h3>
        <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <div class="flex items-center space-x-2">
        <div class="text-surface-900 text-2xl font-bold">{stats.totalOrders}</div>
        <span class="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">+12.5%</span>
      </div>
    </div>

    <div class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 class="text-surface-600 text-sm font-medium tracking-tight">총 매출</h3>
        <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      </div>
      <div class="flex items-center space-x-2">
        <div class="text-surface-900 text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
        <span class="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">+8.2%</span>
      </div>
    </div>

    <div class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 class="text-surface-600 text-sm font-medium tracking-tight">활성 공구</h3>
        <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <div class="flex items-center space-x-2">
        <div class="text-surface-900 text-2xl font-bold">{stats.activeCoops}</div>
        <span class="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">진행중</span>
      </div>
    </div>

    <div class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 class="text-surface-600 text-sm font-medium tracking-tight">대기 주문</h3>
        <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="flex items-center space-x-2">
        <div class="text-surface-900 text-2xl font-bold">{stats.pendingOrders}</div>
        <span class="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-600">처리 필요</span>
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Recent Orders -->
    <div class="border-surface-100 bg-surface-50/10 rounded-xl border shadow-sm">
      <div class="p-6">
        <div class="flex items-center justify-between pb-4">
          <h3 class="text-surface-900 text-lg font-semibold">최근 주문</h3>
          <a href="/admin/orders" class="text-primary-600 hover:text-primary-800 text-sm font-medium"> 모두 보기 </a>
        </div>
        <div class="space-y-3">
          {#each recentOrders as order}
            <div
              class="hover:bg-surface-50 border-surface-50 flex items-center justify-between rounded-lg border p-4 transition-colors"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-surface-900 font-medium">{order.id}</span>
                  <span
                    class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(order.status)}`}
                  >
                    {order.status === 'pending' ? '대기' : order.status === 'confirmed' ? '확인' : '배송'}
                  </span>
                </div>
                <div class="text-surface-600 text-sm">
                  {order.customerName} · {order.product}
                </div>
                <div class="text-surface-400 text-xs">
                  {order.createdAt}
                </div>
              </div>
              <div class="text-right">
                <div class="text-surface-900 font-semibold">
                  {formatCurrency(order.amount)}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Active Coops -->
    <div class="bg-surface-50/10 border-surface-100 rounded-xl border shadow-sm">
      <div class="p-6">
        <div class="flex items-center justify-between pb-4">
          <h3 class="text-surface-900 text-lg font-semibold">진행중인 공구</h3>
          <a href="/admin/coops" class="text-primary-600 hover:text-primary-800 text-sm font-medium"> 모두 보기 </a>
        </div>
        <div class="space-y-3">
          {#each activeCoops as coop}
            <div class="hover:bg-surface-50 border-surface-50 space-y-3 rounded-lg border p-4 transition-colors">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <div class="text-surface-900 font-medium">{coop.title}</div>
                  <div class="text-surface-600 text-sm">
                    마감: {coop.endDate}
                  </div>
                </div>
                <span
                  class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(coop.status)}`}
                >
                  {coop.status === 'active' ? '진행중' : coop.status === 'almost_full' ? '거의찬' : '완료'}
                </span>
              </div>
              <div class="space-y-2">
                <div class="text-surface-600 flex justify-between text-sm">
                  <span>참여 현황</span>
                  <span>{coop.currentQuantity}/{coop.minQuantity}</span>
                </div>
                <div class="bg-surface-100 h-2 w-full rounded-full">
                  <div
                    class="bg-primary-500 h-2 rounded-full transition-all"
                    style="width: {getProgressPercentage(coop.currentQuantity, coop.minQuantity)}%"
                  ></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
