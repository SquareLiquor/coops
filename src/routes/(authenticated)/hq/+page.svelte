<script lang="ts">
  // Mock data - 실제 환경에서는 API에서 가져옴
  let stats = {
    totalStores: 24,
    totalOrders: 142,
    totalRevenue: 248000000,
    pendingApprovals: 8,
  }

  let recentActivities = [
    {
      id: 'ACT-001',
      storeName: '강남점',
      managerName: '김철수',
      action: '관리자 승인 요청',
      status: 'pending',
      createdAt: '2024-12-19 14:30',
    },
    {
      id: 'ACT-002',
      storeName: '홍대점',
      managerName: '이영희',
      action: '발주 승인 완료',
      status: 'confirmed',
      createdAt: '2024-12-19 13:15',
    },
    {
      id: 'ACT-003',
      storeName: '잠실점',
      managerName: '박민수',
      action: '가맹점 등록 승인',
      status: 'confirmed',
      createdAt: '2024-12-19 11:45',
    },
    {
      id: 'ACT-004',
      storeName: '명동점',
      managerName: '최지현',
      action: '관리자 승인 요청',
      status: 'pending',
      createdAt: '2024-12-19 10:20',
    },
    {
      id: 'ACT-005',
      storeName: '신촌점',
      managerName: '정민호',
      action: '발주 거부',
      status: 'rejected',
      createdAt: '2024-12-19 09:30',
    },
  ]

  let activeStores = [
    {
      id: 'STORE-001',
      name: '강남점',
      manager: '김철수',
      status: 'active',
      monthlyRevenue: 15000000,
      orderCount: 45,
      location: '서울시 강남구',
    },
    {
      id: 'STORE-002',
      name: '홍대점',
      manager: '이영희',
      status: 'active',
      monthlyRevenue: 12000000,
      orderCount: 38,
      location: '서울시 마포구',
    },
    {
      id: 'STORE-003',
      name: '잠실점',
      manager: '박민수',
      status: 'pending',
      monthlyRevenue: 8000000,
      orderCount: 25,
      location: '서울시 송파구',
    },
    {
      id: 'STORE-004',
      name: '명동점',
      manager: '최지현',
      status: 'active',
      monthlyRevenue: 18000000,
      orderCount: 52,
      location: '서울시 중구',
    },
  ]

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'active':
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
</script>

<svelte:head>
  <title>Dashboard - 본사</title>
</svelte:head>

<div class="flex h-full flex-col">
  <!-- Header -->
  <div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
    <div class="flex items-center space-x-4">
      <h1 class="text-surface-900 text-2xl font-bold">Dashboard</h1>
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 space-y-6 overflow-auto p-6">
    <!-- Welcome Section -->
    <div class="text-surface-50 from-primary-500 to-primary-600 rounded-xl bg-gradient-to-r p-6">
      <h2 class="mb-2 text-2xl font-bold">안녕하세요, 본사관리자님!</h2>
      <p class="text-surface-50">오늘도 좋은 하루 되세요. 전체 가맹점 현황을 확인해보세요.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div
        class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="text-surface-600 text-sm font-medium tracking-tight">총 가맹점수</h3>
          <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div class="flex items-center space-x-2">
          <div class="text-surface-900 text-2xl font-bold">{stats.totalStores}</div>
          <span class="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">+2.4%</span>
        </div>
      </div>

      <div
        class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="text-surface-600 text-sm font-medium tracking-tight">이번 달 발주건수</h3>
          <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <div class="flex items-center space-x-2">
          <div class="text-surface-900 text-2xl font-bold">{stats.totalOrders}</div>
          <span class="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">+12.1%</span>
        </div>
      </div>

      <div
        class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="text-surface-600 text-sm font-medium tracking-tight">총 발주금액</h3>
          <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        </div>
        <div class="flex items-center space-x-2">
          <div class="text-surface-900 text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <span class="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">+8.7%</span>
        </div>
      </div>

      <div
        class="border-surface-100 bg-surface-50/10 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="text-surface-600 text-sm font-medium tracking-tight">승인 대기</h3>
          <svg class="text-surface-400 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex items-center space-x-2">
          <div class="text-surface-900 text-2xl font-bold">{stats.pendingApprovals}</div>
          <span class="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-600">처리 필요</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent Activities -->
      <div class="border-surface-100 bg-surface-50/10 rounded-xl border shadow-sm">
        <div class="p-6">
          <div class="flex items-center justify-between pb-4">
            <h3 class="text-surface-900 text-lg font-semibold">최근 활동</h3>
            <a href="/hq/users" class="text-primary-600 hover:text-primary-800 text-sm font-medium"> 모두 보기 </a>
          </div>
          <div class="space-y-3">
            {#each recentActivities as activity}
              <div
                class="hover:bg-surface-50 border-surface-50 flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-surface-900 font-medium">{activity.id}</span>
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(activity.status)}`}
                    >
                      {activity.status === 'pending'
                        ? '대기'
                        : activity.status === 'confirmed'
                          ? '승인'
                          : activity.status === 'rejected'
                            ? '거부'
                            : '완료'}
                    </span>
                  </div>
                  <div class="text-surface-600 text-sm">
                    {activity.storeName} · {activity.managerName}
                  </div>
                  <div class="text-surface-600 text-sm">
                    {activity.action}
                  </div>
                  <div class="text-surface-400 text-xs">
                    {activity.createdAt}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Active Stores -->
      <div class="bg-surface-50/10 border-surface-100 rounded-xl border shadow-sm">
        <div class="p-6">
          <div class="flex items-center justify-between pb-4">
            <h3 class="text-surface-900 text-lg font-semibold">가맹점 현황</h3>
            <a href="/hq/stores" class="text-primary-600 hover:text-primary-800 text-sm font-medium"> 모두 보기 </a>
          </div>
          <div class="space-y-3">
            {#each activeStores as store}
              <div
                class="hover:bg-surface-50 border-surface-50 flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-surface-900 font-medium">{store.name}</span>
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(store.status)}`}
                    >
                      {store.status === 'active' ? '운영중' : '대기중'}
                    </span>
                  </div>
                  <div class="text-surface-600 text-sm">
                    {store.manager} · {store.location}
                  </div>
                  <div class="text-surface-400 text-xs">
                    월 매출: {formatCurrency(store.monthlyRevenue)} · 발주건수: {store.orderCount}건
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="border-surface-100 bg-surface-50/10 rounded-xl border shadow-sm">
      <div class="p-6">
        <h3 class="text-surface-900 pb-4 text-lg font-semibold">빠른 액션</h3>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a href="/hq/users" class="flex items-center rounded-lg bg-blue-50 p-4 transition-colors hover:bg-blue-100">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-surface-900 text-sm font-medium">사용자 관리</p>
              <p class="text-surface-500 text-sm">가맹점주 승인</p>
            </div>
          </a>

          <a
            href="/hq/stores"
            class="flex items-center rounded-lg bg-green-50 p-4 transition-colors hover:bg-green-100"
          >
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-surface-900 text-sm font-medium">매장 관리</p>
              <p class="text-surface-500 text-sm">가맹점 현황</p>
            </div>
          </a>

          <a
            href="/hq/products"
            class="flex items-center rounded-lg bg-purple-50 p-4 transition-colors hover:bg-purple-100"
          >
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-surface-900 text-sm font-medium">상품 관리</p>
              <p class="text-surface-500 text-sm">재고 및 상품</p>
            </div>
          </a>

          <a
            href="/hq/purchases"
            class="flex items-center rounded-lg bg-orange-50 p-4 transition-colors hover:bg-orange-100"
          >
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-surface-900 text-sm font-medium">발주 관리</p>
              <p class="text-surface-500 text-sm">발주 승인</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
