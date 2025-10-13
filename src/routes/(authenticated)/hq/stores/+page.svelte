<script lang="ts">
  let stores = [
    {
      id: 'STORE-001',
      name: '강남점',
      type: '가맹점',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-123-4567',
      manager: '김철수',
      email: 'admin@gangnam.store',
      businessNumber: '123-45-67890',
      status: 'active',
      registeredAt: '2024-01-15',
      totalOrders: 142,
      monthlyRevenue: 15800000,
      lastOrderDate: '2024-10-11',
    },
    {
      id: 'STORE-002',
      name: '홍대점',
      type: '가맹점',
      address: '서울시 마포구 홍익로 456',
      phone: '02-234-5678',
      manager: '이영희',
      email: 'admin@hongdae.store',
      businessNumber: '987-65-43210',
      status: 'active',
      registeredAt: '2024-02-20',
      totalOrders: 98,
      monthlyRevenue: 11200000,
      lastOrderDate: '2024-10-10',
    },
    {
      id: 'STORE-003',
      name: '잠실점',
      type: '가맹점',
      address: '서울시 송파구 올림픽로 789',
      phone: '02-345-6789',
      manager: '박민수',
      email: 'admin@jamsil.store',
      businessNumber: '456-78-91234',
      status: 'inactive',
      registeredAt: '2024-03-10',
      totalOrders: 67,
      monthlyRevenue: 8500000,
      lastOrderDate: '2024-09-28',
    },
  ]

  let selectedStatus = 'all'
  let searchTerm = ''
  let selectedType = 'all'

  const statusOptions = [
    { value: 'all', label: '전체', count: stores.length },
    { value: 'active', label: '운영중', count: stores.filter((s) => s.status === 'active').length },
    {
      value: 'inactive',
      label: '휴업중',
      count: stores.filter((s) => s.status === 'inactive').length,
    },
    {
      value: 'suspended',
      label: '정지',
      count: stores.filter((s) => s.status === 'suspended').length,
    },
  ]

  $: filteredStores = stores.filter((store) => {
    const matchesStatus = selectedStatus === 'all' || store.status === selectedStatus
    const matchesType = selectedType === 'all' || store.type === selectedType
    const matchesSearch =
      !searchTerm ||
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return '운영중'
      case 'inactive':
        return '휴업중'
      case 'suspended':
        return '정지'
      default:
        return status
    }
  }

  function toggleStoreStatus(storeId: string) {
    stores = stores.map((store) => {
      if (store.id === storeId) {
        const newStatus = store.status === 'active' ? 'inactive' : 'active'
        return { ...store, status: newStatus }
      }
      return store
    })
  }

  function suspendStore(storeId: string) {
    stores = stores.map((store) => (store.id === storeId ? { ...store, status: 'suspended' } : store))
  }

  function viewStoreDetails(storeId: string) {
    const store = stores.find((s) => s.id === storeId)
    if (store) {
      alert(
        `매장 상세 정보:\n매장명: ${store.name}\n관리자: ${store.manager}\n주소: ${store.address}\n전화번호: ${store.phone}\n사업자번호: ${store.businessNumber}\n이번달 매출: ${formatCurrency(store.monthlyRevenue)}\n총 주문수: ${store.totalOrders}건`
      )
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }
</script>

<svelte:head>
  <title>가맹점 관리 - 본사</title>
</svelte:head>

<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">가맹점 관리</h1>
  </div>
  <button
    class="bg-primary-500 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
  >
    새 매장 등록
  </button>
</div>

<div class="p-6">
  <!-- Filter Area -->
  <div class="mb-6 flex items-center justify-between">
    <!-- 좌측 필터 영역 -->
    <div class="flex items-center gap-4">
      <!-- 검색 필터 -->
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="매장명 검색"
        class="border-0 border-b px-3 py-1.5 text-sm {searchTerm
          ? 'border-primary-500 text-primary-700'
          : 'border-surface-100'} focus:border-primary-500 w-40 bg-transparent focus:outline-none"
      />
    </div>

    <!-- 우측 상태 필터 영역 -->
    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      {#each statusOptions as option}
        <button
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors {selectedStatus === option.value
            ? 'bg-primary-500 text-primary-50 shadow-sm'
            : 'text-surface-600 hover:text-surface-800'}"
          on:click={() => (selectedStatus = option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="border-surface-100 bg-surface-50/50 overflow-hidden rounded-lg border">
    <table class="min-w-full">
      <thead class="bg-surface-50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-3 text-center">
            <span class="text-surface-500 text-xs font-medium">#</span>
          </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">매장 정보</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">관리자</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">연락처</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">실적</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">상태</th>
          <th class="text-surface-500 w-40 px-4 py-3 text-center text-xs font-medium">액션</th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each filteredStores as store, index}
          <tr class="hover:bg-surface-50 border-surface-100 border-b">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <div class="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-lg">
                    <span class="text-primary-700 text-sm font-medium">🏪</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-surface-900 text-sm font-medium">{store.name}</div>
                  <div class="text-surface-500 text-sm">{store.type}</div>
                  <div class="text-surface-400 text-xs">등록: {formatDate(store.registeredAt)}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">{store.manager}</div>
              <div class="text-surface-500 text-sm">{store.email}</div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm">{store.phone}</div>
              <div class="text-surface-500 text-xs">{store.address}</div>
              <div class="text-surface-400 text-xs">{store.businessNumber}</div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">
                {formatCurrency(store.monthlyRevenue)}
              </div>
              <div class="text-surface-500 text-sm">주문 {store.totalOrders}건</div>
              <div class="text-surface-400 text-xs">최근: {formatDate(store.lastOrderDate)}</div>
            </td>
            <td class="px-4 py-4">
              <span class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(store.status)}`}>
                {getStatusText(store.status)}
              </span>
            </td>
            <td class="px-4 py-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <button
                  on:click={() => viewStoreDetails(store.id)}
                  class="text-surface-700 bg-surface-100 hover:bg-surface-200 rounded px-2 py-1 text-xs font-medium"
                >
                  상세
                </button>
                {#if store.status !== 'suspended'}
                  <button
                    on:click={() => toggleStoreStatus(store.id)}
                    class={`rounded px-2 py-1 text-xs font-medium hover:${
                      store.status === 'active' ? 'bg-yellow-200' : 'bg-green-200'
                    } ${store.status === 'active' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                  >
                    {store.status === 'active' ? '휴업' : '재개'}
                  </button>
                  <button
                    on:click={() => suspendStore(store.id)}
                    class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    정지
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if filteredStores.length === 0}
      <div class="py-12 text-center">
        <svg class="text-surface-400 mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 class="text-surface-900 mt-2 text-sm font-medium">등록된 매장이 없습니다</h3>
        <p class="text-surface-500 mt-1 text-sm">현재 조건에 맞는 매장이 없습니다.</p>
      </div>
    {/if}
  </div>
</div>
