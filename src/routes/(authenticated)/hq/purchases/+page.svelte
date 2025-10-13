<script lang="ts">
  interface Purchase {
    id: string
    storeName: string
    storeId: string
    productName: string
    productId: string
    quantity: number
    unitPrice: number
    totalAmount: number
    status: 'pending' | 'approved' | 'shipped' | 'completed' | 'rejected'
    requestDate: string
    approvedDate: string | null
    shippedDate: string | null
    receivedDate: string | null
    note: string
  }

  let purchases: Purchase[] = [
    {
      id: 'PO-001',
      storeName: '강남점',
      storeId: 'STORE-001',
      productName: '유기농 쌀 10kg',
      productId: 'PROD-001',
      quantity: 50,
      unitPrice: 45000,
      totalAmount: 2250000,
      status: 'pending',
      requestDate: '2024-10-12',
      approvedDate: null,
      shippedDate: null,
      receivedDate: null,
      note: '긴급 발주 요청',
    },
    {
      id: 'PO-002',
      storeName: '홍대점',
      storeId: 'STORE-002',
      productName: '제주 감귤 5kg',
      productId: 'PROD-002',
      quantity: 30,
      unitPrice: 25000,
      totalAmount: 750000,
      status: 'approved',
      requestDate: '2024-10-11',
      approvedDate: '2024-10-11',
      shippedDate: null,
      receivedDate: null,
      note: '',
    },
    {
      id: 'PO-003',
      storeName: '잠실점',
      storeId: 'STORE-003',
      productName: '친환경 배추 10포기',
      productId: 'PROD-003',
      quantity: 25,
      unitPrice: 18000,
      totalAmount: 450000,
      status: 'shipped',
      requestDate: '2024-10-10',
      approvedDate: '2024-10-10',
      shippedDate: '2024-10-11',
      receivedDate: null,
      note: '',
    },
    {
      id: 'PO-004',
      storeName: '명동점',
      storeId: 'STORE-004',
      productName: '청양고추 1kg',
      productId: 'PROD-004',
      quantity: 40,
      unitPrice: 12000,
      totalAmount: 480000,
      status: 'completed',
      requestDate: '2024-10-09',
      approvedDate: '2024-10-09',
      shippedDate: '2024-10-10',
      receivedDate: '2024-10-11',
      note: '배송 완료',
    },
    {
      id: 'PO-005',
      storeName: '강남점',
      storeId: 'STORE-001',
      productName: '유기농 쌀 10kg',
      productId: 'PROD-001',
      quantity: 20,
      unitPrice: 45000,
      totalAmount: 900000,
      status: 'rejected',
      requestDate: '2024-10-08',
      approvedDate: null,
      shippedDate: null,
      receivedDate: null,
      note: '재고 부족으로 거부',
    },
  ]

  let selectedStatus = 'all'
  let selectedStore = 'all'
  let dateFrom = ''
  let dateTo = ''

  const statusOptions = [
    { value: 'all', label: '전체', count: purchases.length },
    {
      value: 'pending',
      label: '승인대기',
      count: purchases.filter((p) => p.status === 'pending').length,
    },
    {
      value: 'approved',
      label: '승인됨',
      count: purchases.filter((p) => p.status === 'approved').length,
    },
    {
      value: 'shipped',
      label: '출고됨',
      count: purchases.filter((p) => p.status === 'shipped').length,
    },
    {
      value: 'completed',
      label: '완료',
      count: purchases.filter((p) => p.status === 'completed').length,
    },
    {
      value: 'rejected',
      label: '거부됨',
      count: purchases.filter((p) => p.status === 'rejected').length,
    },
  ]

  const storeOptions = [
    { value: 'all', label: '전체 매장' },
    { value: 'STORE-001', label: '강남점' },
    { value: 'STORE-002', label: '홍대점' },
    { value: 'STORE-003', label: '잠실점' },
    { value: 'STORE-004', label: '명동점' },
  ]

  $: filteredPurchases = purchases.filter((purchase) => {
    const matchesStatus = selectedStatus === 'all' || purchase.status === selectedStatus
    const matchesStore = selectedStore === 'all' || purchase.storeId === selectedStore
    const matchesDateFrom = !dateFrom || purchase.requestDate >= dateFrom
    const matchesDateTo = !dateTo || purchase.requestDate <= dateTo
    return matchesStatus && matchesStore && matchesDateFrom && matchesDateTo
  })

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'pending':
        return '승인대기'
      case 'approved':
        return '승인됨'
      case 'shipped':
        return '출고됨'
      case 'completed':
        return '완료'
      case 'rejected':
        return '거부됨'
      default:
        return status
    }
  }

  function approvePurchase(purchaseId: string) {
    purchases = purchases.map((purchase) =>
      purchase.id === purchaseId
        ? { ...purchase, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] }
        : purchase
    )
  }

  function rejectPurchase(purchaseId: string) {
    purchases = purchases.map((purchase) =>
      purchase.id === purchaseId ? { ...purchase, status: 'rejected', note: '본사에서 거부됨' } : purchase
    )
  }

  function shipPurchase(purchaseId: string) {
    purchases = purchases.map((purchase) =>
      purchase.id === purchaseId
        ? { ...purchase, status: 'shipped', shippedDate: new Date().toISOString().split('T')[0] }
        : purchase
    )
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
  <title>발주 관리 - 본사</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm">
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">발주 관리</h1>
    </div>
  </div>

  <div class="p-6">
    <!-- Filter Area -->
    <div class="mb-6 flex items-center justify-between">
      <!-- 좌측 필터 영역 -->
      <div class="flex items-center gap-4">
        <!-- 날짜 필터 -->
        <div class="flex items-center gap-2">
          <input
            type="date"
            bind:value={dateFrom}
            class="px-3 py-1.5 text-sm border-0 border-b {dateFrom
              ? 'border-primary-500 text-primary-700'
              : 'border-gray-300'} bg-transparent focus:outline-none focus:border-primary-500"
            placeholder="From"
          />
          <span class="text-gray-400">~</span>
          <input
            type="date"
            bind:value={dateTo}
            class="px-3 py-1.5 text-sm border-0 border-b {dateTo
              ? 'border-primary-500 text-primary-700'
              : 'border-gray-300'} bg-transparent focus:outline-none focus:border-primary-500"
            placeholder="To"
          />
        </div>

        <!-- 매장 필터 -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {#each storeOptions as option}
            <button
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors {selectedStore === option.value
                ? 'bg-primary-500 text-primary-contrast shadow-sm'
                : 'text-gray-600 hover:text-gray-800'}"
              on:click={() => (selectedStore = option.value)}
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
            class="px-3 py-1.5 text-sm font-medium rounded transition-colors {selectedStatus === option.value
              ? 'bg-primary-500 text-primary-contrast shadow-sm'
              : 'text-gray-600 hover:text-gray-800'}"
            on:click={() => (selectedStatus = option.value)}
          >
            {option.label}
            <span
              class={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                selectedStatus === option.value ? 'bg-primary-600 text-primary-contrast' : 'bg-gray-200 text-gray-600'
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">발주 ID</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">매장</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">상품명</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">수량</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">총액</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">요청일</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">상태</th>
            <th class="w-32 px-4 py-3 text-center text-xs font-medium text-gray-500">액션</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          {#each filteredPurchases as purchase, index}
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-4 text-center text-sm text-gray-500">
                {index + 1}
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{purchase.id}</div>
                {#if purchase.note}
                  <div class="text-xs text-gray-500">{purchase.note}</div>
                {/if}
              </td>
              <td class="px-4 py-4">
                <span class="text-sm font-medium text-gray-900">{purchase.storeName}</span>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{purchase.productName}</div>
                <div class="text-xs text-gray-500">단가: {formatCurrency(purchase.unitPrice)}</div>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-700">{purchase.quantity}</span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm font-medium text-gray-900">{formatCurrency(purchase.totalAmount)}</span>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-gray-700">{formatDate(purchase.requestDate)}</div>
                {#if purchase.approvedDate}
                  <div class="text-xs text-green-600">
                    승인: {formatDate(purchase.approvedDate)}
                  </div>
                {/if}
                {#if purchase.shippedDate}
                  <div class="text-xs text-blue-600">출고: {formatDate(purchase.shippedDate)}</div>
                {/if}
              </td>
              <td class="px-4 py-4">
                <span
                  class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(purchase.status)}`}
                >
                  {getStatusText(purchase.status)}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                {#if purchase.status === 'pending'}
                  <div class="flex items-center justify-center gap-1">
                    <button
                      on:click={() => approvePurchase(purchase.id)}
                      class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      승인
                    </button>
                    <button
                      on:click={() => rejectPurchase(purchase.id)}
                      class="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                    >
                      거부
                    </button>
                  </div>
                {:else if purchase.status === 'approved'}
                  <button
                    on:click={() => shipPurchase(purchase.id)}
                    class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                  >
                    출고
                  </button>
                {:else}
                  <span class="text-xs text-gray-400">-</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if filteredPurchases.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">발주가 없습니다</h3>
          <p class="mt-1 text-sm text-gray-500">현재 조건에 맞는 발주가 없습니다.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
