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
      lastOrderDate: '2024-10-11'
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
      lastOrderDate: '2024-10-10'
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
      lastOrderDate: '2024-09-28'
    }
  ];

  let selectedStatus = 'all';
  let searchTerm = '';
  let selectedType = 'all';

  const statusOptions = [
    { value: 'all', label: '전체', count: stores.length },
    { value: 'active', label: '운영중', count: stores.filter((s) => s.status === 'active').length },
    {
      value: 'inactive',
      label: '휴업중',
      count: stores.filter((s) => s.status === 'inactive').length
    },
    {
      value: 'suspended',
      label: '정지',
      count: stores.filter((s) => s.status === 'suspended').length
    }
  ];

  const typeOptions = [
    { value: 'all', label: '전체 매장' },
    { value: '가맹점', label: '가맹점' },
    { value: '직영점', label: '직영점' }
  ];

  $: filteredStores = stores.filter((store) => {
    const matchesStatus = selectedStatus === 'all' || store.status === selectedStatus;
    const matchesType = selectedType === 'all' || store.type === selectedType;
    const matchesSearch =
      !searchTerm ||
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return '운영중';
      case 'inactive':
        return '휴업중';
      case 'suspended':
        return '정지';
      default:
        return status;
    }
  }

  function toggleStoreStatus(storeId: string) {
    stores = stores.map((store) => {
      if (store.id === storeId) {
        const newStatus = store.status === 'active' ? 'inactive' : 'active';
        return { ...store, status: newStatus };
      }
      return store;
    });
  }

  function suspendStore(storeId: string) {
    stores = stores.map((store) =>
      store.id === storeId ? { ...store, status: 'suspended' } : store
    );
  }

  function viewStoreDetails(storeId: string) {
    const store = stores.find((s) => s.id === storeId);
    if (store) {
      alert(
        `매장 상세 정보:\n매장명: ${store.name}\n관리자: ${store.manager}\n주소: ${store.address}\n전화번호: ${store.phone}\n사업자번호: ${store.businessNumber}\n이번달 매출: ${formatCurrency(store.monthlyRevenue)}\n총 주문수: ${store.totalOrders}건`
      );
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR');
  }
</script>

<svelte:head>
  <title>가맹점 관리 - 본사</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm">
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">가맹점 관리</h1>
    </div>
    <button
      class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="매장명, 관리자, 주소로 검색"
            class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        <!-- 매장 유형 필터 -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {#each typeOptions as option}
            <button
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors {selectedType ===
              option.value
                ? 'bg-primary-500 text-primary-contrast shadow-sm'
                : 'text-gray-600 hover:text-gray-800'}"
              on:click={() => (selectedType = option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- 우측 상태 필터 영역 -->
      <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
        {#each statusOptions as option}
          <button
            class="px-3 py-1.5 text-sm font-medium rounded transition-colors {selectedStatus ===
            option.value
              ? 'bg-primary-500 text-primary-contrast shadow-sm'
              : 'text-gray-600 hover:text-gray-800'}"
            on:click={() => (selectedStatus = option.value)}
          >
            {option.label}
            <span
              class={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                selectedStatus === option.value
                  ? 'bg-primary-600 text-primary-contrast'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {option.count}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="w-8 px-4 py-3 text-center">
              <span class="text-xs font-medium text-gray-500">#</span>
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">매장 정보</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">관리자</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">연락처</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">실적</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">상태</th>
            <th class="w-40 px-4 py-3 text-center text-xs font-medium text-gray-500">액션</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          {#each filteredStores as store, index}
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-4 text-center text-sm text-gray-500">
                {index + 1}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-primary-700">🏪</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{store.name}</div>
                    <div class="text-sm text-gray-500">{store.type}</div>
                    <div class="text-xs text-gray-400">등록: {formatDate(store.registeredAt)}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{store.manager}</div>
                <div class="text-sm text-gray-500">{store.email}</div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-gray-900">{store.phone}</div>
                <div class="text-xs text-gray-500">{store.address}</div>
                <div class="text-xs text-gray-400">{store.businessNumber}</div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">
                  {formatCurrency(store.monthlyRevenue)}
                </div>
                <div class="text-sm text-gray-500">주문 {store.totalOrders}건</div>
                <div class="text-xs text-gray-400">최근: {formatDate(store.lastOrderDate)}</div>
              </td>
              <td class="px-4 py-4">
                <span
                  class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(store.status)}`}
                >
                  {getStatusText(store.status)}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    on:click={() => viewStoreDetails(store.id)}
                    class="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    상세
                  </button>
                  {#if store.status !== 'suspended'}
                    <button
                      on:click={() => toggleStoreStatus(store.id)}
                      class={`px-2 py-1 text-xs font-medium rounded hover:${
                        store.status === 'active' ? 'bg-yellow-200' : 'bg-green-200'
                      } ${
                        store.status === 'active'
                          ? 'text-yellow-700 bg-yellow-100'
                          : 'text-green-700 bg-green-100'
                      }`}
                    >
                      {store.status === 'active' ? '휴업' : '재개'}
                    </button>
                    <button
                      on:click={() => suspendStore(store.id)}
                      class="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
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
        <div class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">등록된 매장이 없습니다</h3>
          <p class="mt-1 text-sm text-gray-500">현재 조건에 맞는 매장이 없습니다.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
