<script lang="ts">
  let purchases = [
    {
      id: 'PUR-001',
      supplier: '농협 안성팜',
      supplierPhone: '031-123-4567',
      product: '유기농 쌀 20kg',
      quantity: 100,
      unitPrice: 40000,
      totalAmount: 4000000,
      status: 'pending',
      orderDate: '2024-12-18',
      expectedDelivery: '2024-12-25',
      category: '곡물'
    },
    {
      id: 'PUR-002',
      supplier: '제주 귤농장',
      supplierPhone: '064-987-6543',
      product: '제주 감귤 10kg',
      quantity: 50,
      unitPrice: 25000,
      totalAmount: 1250000,
      status: 'completed',
      orderDate: '2024-12-15',
      expectedDelivery: '2024-12-20',
      category: '과일'
    },
    {
      id: 'PUR-003',
      supplier: '강원도 감자마을',
      supplierPhone: '033-456-7890',
      product: '감자 15kg',
      quantity: 80,
      unitPrice: 18000,
      totalAmount: 1440000,
      status: 'processing',
      orderDate: '2024-12-19',
      expectedDelivery: '2024-12-26',
      category: '채소'
    },
    {
      id: 'PUR-004',
      supplier: '부여 대추농장',
      supplierPhone: '041-555-1234',
      product: '건대추 2kg',
      quantity: 30,
      unitPrice: 35000,
      totalAmount: 1050000,
      status: 'approved',
      orderDate: '2024-12-20',
      expectedDelivery: '2024-12-28',
      category: '과일'
    },
    {
      id: 'PUR-005',
      supplier: '충북 콩마을',
      supplierPhone: '043-777-8888',
      product: '백태 500g',
      quantity: 200,
      unitPrice: 12000,
      totalAmount: 2400000,
      status: 'rejected',
      orderDate: '2024-12-17',
      expectedDelivery: '2024-12-30',
      category: '곡물'
    }
  ];

  // Filter variables
  let dateFrom = '';
  let dateTo = '';
  let selectedStatus = 'all';
  let selectedCategory = 'all';

  // Status options for purchases
  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '검토 중' },
    { value: 'approved', label: '승인됨' },
    { value: 'processing', label: '처리 중' },
    { value: 'completed', label: '완료' },
    { value: 'rejected', label: '거부됨' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'all', label: '전체 카테고리' },
    { value: '곡물', label: '곡물' },
    { value: '채소', label: '채소' },
    { value: '과일', label: '과일' },
    { value: '육류', label: '육류' },
    { value: '유제품', label: '유제품' }
  ];

  function getStatusBadge(status: string) {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  function getStatusText(status: string) {
    const statusTextMap = {
      pending: '검토 중',
      approved: '승인됨',
      processing: '처리 중',
      completed: '완료',
      rejected: '거부됨'
    };
    return statusTextMap[status] || status;
  }

  // Filtered purchases based on filters
  $: filteredPurchases = purchases.filter((purchase) => {
    const statusMatch = selectedStatus === 'all' || purchase.status === selectedStatus;
    const categoryMatch = selectedCategory === 'all' || purchase.category === selectedCategory;

    let dateMatch = true;
    if (dateFrom && dateTo) {
      const purchaseDate = new Date(purchase.orderDate);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      dateMatch = purchaseDate >= fromDate && purchaseDate <= toDate;
    }

    return statusMatch && categoryMatch && dateMatch;
  });
</script>

<svelte:head>
  <title>발주관리 - 관리자</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">발주관리</h1>
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

        <!-- Category Filter -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {#each categoryOptions as option}
            <button
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors {selectedCategory ===
              option.value
                ? 'bg-primary-500 text-primary-contrast shadow-sm'
                : 'text-gray-600 hover:text-gray-800'}"
              on:click={() => (selectedCategory = option.value)}
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 발주 ID </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 공급업체 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 상품명 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 총액 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 상태 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 발주일 </th>
            <th class="w-8 px-4 py-3"></th>
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
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{purchase.supplier}</div>
                <div class="text-sm text-gray-500">{purchase.supplierPhone}</div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{purchase.product}</div>
                <div class="text-sm text-gray-500">{purchase.category}</div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                ₩{purchase.totalAmount.toLocaleString()}
              </td>
              <td class="px-4 py-4">
                {#if purchase.status === 'completed'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">완료</span>
                  </div>
                {:else if purchase.status === 'processing'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">처리 중</span>
                  </div>
                {:else if purchase.status === 'approved'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">승인됨</span>
                  </div>
                {:else if purchase.status === 'pending'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">검토 중</span>
                  </div>
                {:else}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">{getStatusText(purchase.status)}</span>
                  </div>
                {/if}
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                {purchase.orderDate}
              </td>
              <td class="px-4 py-4 text-center">
                <button class="text-gray-400 hover:text-gray-600">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
