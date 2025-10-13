<script lang="ts">
  let orders = [
    {
      id: 'ORD-001',
      customerName: '김농부',
      customerPhone: '010-1234-5678',
      product: '유기농 쌀 10kg',
      category: '곡물',
      quantity: 2,
      amount: 90000,
      status: 'pending',
      createdAt: '2024-12-19 14:30',
      address: '서울시 강남구 테헤란로 123',
    },
    {
      id: 'ORD-002',
      customerName: '이농부',
      customerPhone: '010-2345-6789',
      product: '사과 5kg',
      category: '과일',
      quantity: 1,
      amount: 25000,
      status: 'completed',
      createdAt: '2024-12-19 13:15',
      address: '부산시 해운대구 센텀중앙로 456',
    },
    {
      id: 'ORD-003',
      customerName: '박농부',
      customerPhone: '010-3456-7890',
      product: '친환경 배추 10포기',
      category: '채소',
      quantity: 1,
      amount: 18000,
      status: 'processing',
      createdAt: '2024-12-19 12:20',
      address: '대구시 중구 동성로 789',
    },
    {
      id: 'ORD-004',
      customerName: '정농부',
      customerPhone: '010-4567-8901',
      product: '제주 감귤 5kg',
      category: '과일',
      quantity: 3,
      amount: 75000,
      status: 'shipped',
      createdAt: '2024-12-18 16:45',
      address: '광주시 서구 상무대로 321',
    },
    {
      id: 'ORD-005',
      customerName: '최농부',
      customerPhone: '010-5678-9012',
      product: '청양고추 1kg',
      category: '채소',
      quantity: 2,
      amount: 24000,
      status: 'pending',
      createdAt: '2024-12-18 10:15',
      address: '울산시 남구 삼산로 654',
    },
  ]

  // 필터 상태
  let searchName = ''
  let selectedCategory = 'all'
  let selectedStatus = 'all'
  let dateFrom = ''
  let dateTo = ''

  const categoryOptions = [
    { value: 'all', label: '전체 카테고리' },
    { value: '곡물', label: '곡물' },
    { value: '과일', label: '과일' },
    { value: '채소', label: '채소' },
  ]

  const statusOptions = [
    { value: 'all', label: '전체 상태' },
    { value: 'pending', label: '대기중' },
    { value: 'processing', label: '처리중' },
    { value: 'shipped', label: '배송중' },
    { value: 'completed', label: '완료' },
  ]

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'pending':
        return '대기중'
      case 'processing':
        return '처리중'
      case 'shipped':
        return '배송중'
      case 'completed':
        return '완료'
      default:
        return status
    }
  }

  // Filtered orders based on filters
  $: filteredOrders = orders.filter((order) => {
    const statusMatch = selectedStatus === 'all' || order.status === selectedStatus
    const categoryMatch = selectedCategory === 'all' || order.category === selectedCategory
    const nameMatch = searchName === '' || order.customerName.toLowerCase().includes(searchName.toLowerCase())

    let dateMatch = true
    if (dateFrom && dateTo) {
      const orderDate = new Date(order.createdAt.split(' ')[0])
      const fromDate = new Date(dateFrom)
      const toDate = new Date(dateTo)
      dateMatch = orderDate >= fromDate && orderDate <= toDate
    }

    return statusMatch && categoryMatch && nameMatch && dateMatch
  })
</script>

<svelte:head>
  <title>주문 관리 - 관리자</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">주문관리</h1>
    </div>
  </div>

  <div class="p-6">
    <!-- 필터 영역 -->
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

        <!-- 카테고리 필터 -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {#each categoryOptions as option, index}
            <button
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-2 {selectedCategory ===
              option.value
                ? 'bg-primary-500 text-primary-contrast shadow-sm'
                : 'text-gray-600 hover:text-gray-800'}"
              on:click={() => (selectedCategory = option.value)}
            >
              {option.label}
              {#if index === 1}
                <span class="text-xs text-gray-500">3</span>
              {:else if index === 2}
                <span class="text-xs text-gray-500">2</span>
              {/if}
            </button>
          {/each}
        </div>

        <!-- 주문자 이름 검색 -->
        <div class="flex items-center">
          <input
            type="text"
            bind:value={searchName}
            placeholder="주문자 이름 검색"
            class="px-3 py-1.5 text-sm border-0 border-b {searchName
              ? 'border-primary-500 text-primary-700'
              : 'border-gray-300'} bg-transparent focus:outline-none focus:border-primary-500 w-40"
          />
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> Header </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> Section Type </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> Status </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> Target </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> Limit </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> Reviewer </th>
            <th class="w-8 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white">
          {#each filteredOrders as order, index}
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-4 text-center text-sm text-gray-500">
                {index + 1}
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{order.product}</div>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-700">{order.category}</span>
              </td>
              <td class="px-4 py-4">
                {#if order.status === 'completed'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">Done</span>
                  </div>
                {:else if order.status === 'processing'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">In Progress</span>
                  </div>
                {:else}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">{getStatusText(order.status)}</span>
                  </div>
                {/if}
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                {Math.floor(Math.random() * 30) + 1}
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                {Math.floor(Math.random() * 15) + 5}
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                {order.customerName}
              </td>
              <td class="px-4 py-4 text-center">
                <button class="text-gray-400 hover:text-gray-600" aria-label="주문 옵션 더보기">
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
