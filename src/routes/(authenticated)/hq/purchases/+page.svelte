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
        return 'bg-surface-100 text-surface-800'
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

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">발주 관리</h1>
  </div>

  <div class="relative">
    <!-- Filter Area -->
    <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-2">
        <!-- 날짜 필터 -->
        <input
          type="date"
          bind:value={dateFrom}
          class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
        />
        <span class="text-xs text-gray-400">~</span>
        <input
          type="date"
          bind:value={dateTo}
          class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
        />

        <!-- 매장 필터 -->
        {#each storeOptions as option}
          <button
            type="button"
            class={[
              'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              selectedStore === option.value && 'bg-primary-600 text-white',
              selectedStore !== option.value && 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]}
            on:click={() => (selectedStore = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>

      <!-- 상태 필터 (우측 또는 아래) -->
      <div class="flex items-center gap-1.5 overflow-x-auto">
        {#each statusOptions as option}
          <button
            type="button"
            class={[
              'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              selectedStatus === option.value && 'bg-primary-600 text-white',
              selectedStatus !== option.value && 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]}
            on:click={() => (selectedStatus = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-white">
            <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> # </th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">발주 ID</th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">매장</th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">상품명</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">수량</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">총액</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">요청일</th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">상태</th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">액션</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each filteredPurchases as purchase, index}
            <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {index + 1}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="text-xs font-medium text-gray-900">{purchase.id}</div>
                {#if purchase.note}
                  <div class="text-xs text-gray-500">{purchase.note}</div>
                {/if}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {purchase.storeName}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="flex items-center gap-2.5">
                  <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                    <div class="flex h-full w-full items-center justify-center text-sm">📦</div>
                  </div>
                  <div class="flex flex-1 items-center justify-between gap-3">
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-900">{purchase.productName}</span>
                      <span class="text-xs text-gray-500">단가: {formatCurrency(purchase.unitPrice)}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs text-gray-600">
                {purchase.quantity}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs text-gray-600">
                {formatCurrency(purchase.totalAmount)}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs text-gray-600">
                {formatDate(purchase.requestDate)}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span
                  class={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(purchase.status)}`}
                >
                  {getStatusText(purchase.status)}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2">
                {#if purchase.status === 'pending'}
                  <div class="flex items-center justify-center gap-1">
                    <button
                      on:click={() => approvePurchase(purchase.id)}
                      class="bg-success-500 hover:bg-success-600 min-w-[50px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                    >
                      승인
                    </button>
                    <button
                      on:click={() => rejectPurchase(purchase.id)}
                      class="bg-error-500 hover:bg-error-600 min-w-[50px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                    >
                      거부
                    </button>
                  </div>
                {:else if purchase.status === 'approved'}
                  <button
                    on:click={() => shipPurchase(purchase.id)}
                    class="bg-primary-500 hover:bg-primary-600 min-w-[50px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
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
        <div class="py-12 text-center">
          <div class="flex flex-col items-center justify-center">
            <svg class="mb-2 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">발주가 없습니다</h3>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
