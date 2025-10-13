<script lang="ts">
  let purchases = [
    {
      id: null,
      supplier: '농협 안성팜',
      supplierPhone: '031-123-4567',
      product: '유기농 쌀 20kg',
      quantity: 0,
      unit: 'Box',
      unitPrice: 40000,
      totalAmount: 0,
      status: null,
      paymentPoint: 0,
      orderDate: '',
      expectedDelivery: '2024-12-25',
      category: '곡물',
    },
    {
      id: 'PUR-001',
      supplier: '제주 귤농장',
      supplierPhone: '064-987-6543',
      product: '제주 감귤 10kg',
      quantity: 50,
      unit: 'Box',
      unitPrice: 25000,
      totalAmount: 1250000,
      status: 'requested',
      paymentPoint: 25000,
      orderDate: '2024-12-15',
      expectedDelivery: '2024-12-20',
      category: '과일',
    },
    {
      id: 'PUR-002',
      supplier: '강원도 감자마을',
      supplierPhone: '033-456-7890',
      product: '감자 15kg',
      quantity: 80,
      unit: 'Box',
      unitPrice: 18000,
      totalAmount: 1440000,
      status: 'confirmed',
      paymentPoint: 0,
      orderDate: '2024-12-19',
      expectedDelivery: '2024-12-26',
      category: '채소',
    },
    {
      id: 'PUR-003',
      supplier: '부여 대추농장',
      supplierPhone: '041-555-1234',
      product: '건대추 2kg',
      quantity: 30,
      unit: 'Box',
      unitPrice: 35000,
      totalAmount: 1050000,
      status: 'delivery_started',
      paymentPoint: 35000,
      orderDate: '2024-12-20',
      expectedDelivery: '2024-12-28',
      category: '과일',
    },
    {
      id: 'PUR-004',
      supplier: '충북 콩마을',
      supplierPhone: '043-777-8888',
      product: '백태 500g',
      quantity: 200,
      unit: 'Box',
      unitPrice: 12000,
      totalAmount: 2400000,
      status: 'rejected',
      paymentPoint: 0,
      orderDate: '2024-12-17',
      expectedDelivery: '2024-12-30',
      category: '곡물',
    },
  ]

  // Filter variables
  let dateFrom = ''
  let dateTo = ''
  let selectedStatus = 'all'
  let selectedCategory = 'all'

  // Status options for purchases
  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '검토 중' },
    { value: 'approved', label: '승인됨' },
    { value: 'processing', label: '처리 중' },
    { value: 'completed', label: '완료' },
    { value: 'rejected', label: '거부됨' },
  ]

  // Category options
  const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: '곡물', label: '곡물' },
    { value: '채소', label: '채소' },
    { value: '과일', label: '과일' },
    { value: '육류', label: '육류' },
    { value: '유제품', label: '유제품' },
  ]

  type PurchaseStatus = 'requested' | 'confirmed' | 'delivery_started' | 'delivered' | 'rejected'

  function getStatusBadge(status: string | null) {
    switch (status as PurchaseStatus) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-700'
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700'
      case 'delivery_started':
        return 'bg-blue-100 text-blue-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusText(status: string | null) {
    if (!status) return '-'

    const statusTextMap: Record<PurchaseStatus, string> = {
      requested: '발주 요청',
      confirmed: '승인됨',
      delivery_started: '배송 시작',
      delivered: '배송 완료',
      rejected: '거부됨',
    }

    return statusTextMap[status as PurchaseStatus]
  }

  // Filtered purchases based on filters
  $: filteredPurchases = purchases.filter((purchase) => {
    const statusMatch = selectedStatus === 'all' || purchase.status === selectedStatus
    const categoryMatch = selectedCategory === 'all' || purchase.category === selectedCategory

    let dateMatch = true
    if (dateFrom && dateTo) {
      const purchaseDate = new Date(purchase.orderDate)
      const fromDate = new Date(dateFrom)
      const toDate = new Date(dateTo)
      dateMatch = purchaseDate >= fromDate && purchaseDate <= toDate
    }

    return statusMatch && categoryMatch && dateMatch
  })
</script>

<svelte:head>
  <title>발주관리 - 관리자</title>
</svelte:head>

<!-- Header -->
<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">발주 관리</h1>
  </div>
</div>

<div class="p-6">
  <!-- Filter Area -->
  <div class="mb-6 flex items-center justify-between">
    <!-- 좌측 필터 영역 -->
    <div class="flex items-center gap-4">
      <!-- Date Range -->
      <div class="flex items-center gap-2">
        <input
          type="date"
          bind:value={dateFrom}
          class="border-0 border-b px-3 py-1.5 text-sm {dateFrom
            ? 'border-primary-500 text-primary-700'
            : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
          placeholder="From"
        />
        <span class="text-surface-400">~</span>
        <input
          type="date"
          bind:value={dateTo}
          class="border-0 border-b px-3 py-1.5 text-sm {dateTo
            ? 'border-primary-500 text-primary-700'
            : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
          placeholder="To"
        />
      </div>

      <!-- Category Filter -->
      <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
        {#each categoryOptions as option}
          <button
            class="rounded px-3 py-1.5 text-sm font-medium transition-colors {selectedCategory === option.value
              ? 'bg-primary-500 text-primary-50 shadow-sm'
              : 'text-surface-600 hover:text-surface-800'}"
            on:click={() => (selectedCategory = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
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

  <div class="border-surface-100 overflow-hidden rounded-lg border bg-white">
    <table class="w-full table-auto">
      <thead class="bg-surface-50/50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-3 text-center">
            <span class="text-surface-500 text-xs font-medium">#</span>
          </th>
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 발주 ID </th>
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 발주 상태 </th>
          <th class="text-surface-500 w-[25%] px-4 py-3 text-sm font-bold"> 상품명 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 발주 수량 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 단가 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 총액 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 사용 포인트 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 발주일 </th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each filteredPurchases as purchase, index}
          <tr class="hover:bg-surface-50 border-surface-50 border-b">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm">{purchase.id || '-'}</td>
            <td class="px-4 py-4 text-center text-sm">
              <span class="{getStatusBadge(purchase.status)} inline-block rounded-full px-3 py-1 text-xs font-medium">
                {getStatusText(purchase.status) || '-'}
              </span>
            </td>
            <td class="px-4 py-4 text-left">
              <div class="flex flex-col items-start">
                <span class="text-surface-900 text-sm font-medium">{purchase.product}</span>
                <span class="text-surface-400 mt-1 text-xs">{purchase.category}</span>
              </div>
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm font-medium whitespace-nowrap">
              {#if purchase.quantity === 0}
                -
              {:else}
                {purchase.quantity.toLocaleString()}
                {purchase.unit}
              {/if}
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm font-medium whitespace-nowrap">
              {purchase.unitPrice.toLocaleString()} 원
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm font-medium whitespace-nowrap">
              {#if purchase.quantity === 0}
                -
              {:else}
                {purchase.totalAmount.toLocaleString()} 원
              {/if}
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm font-medium whitespace-nowrap">
              {purchase.paymentPoint.toLocaleString()} P
            </td>
            <td class="text-surface-700 px-4 py-4 text-left text-sm whitespace-nowrap">
              {purchase.orderDate || '-'}
            </td>
            <td class="px-4 py-4"></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
