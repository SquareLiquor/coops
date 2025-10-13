<script lang="ts">
  let orders = [
    {
      id: 'ORD-001',
      customerName: '김농부',
      customerPhone: '010-1234-5678',
      product: '유기농 쌀 10kg',
      itemsCount: 0,
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
      itemsCount: 1,
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
      itemsCount: 2,
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
      itemsCount: 0,
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
      itemsCount: 3,
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
    { value: 'all', label: '전체' },
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
        return 'bg-surface-100 text-surface-800'
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

<!-- Header -->
<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">주문 관리</h1>
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

      <!-- 카테고리 필터 -->
      <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
        {#each categoryOptions as option, index}
          <button
            class="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors {selectedCategory ===
            option.value
              ? 'bg-primary-500 text-primary-50 shadow-sm'
              : 'text-surface-600 hover:text-surface-800'}"
            on:click={() => (selectedCategory = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>

      <!-- 주문자 이름 검색 -->
      <div class="flex items-center">
        <input
          type="text"
          bind:value={searchName}
          placeholder="주문자 이름 검색"
          class="border-0 border-b px-3 py-1.5 text-sm {searchName
            ? 'border-primary-500 text-primary-700'
            : 'border-surface-100'} focus:border-primary-500 w-40 bg-transparent focus:outline-none"
        />
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
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 주문 번호 </th>
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 주문 상태 </th>
          <th class="text-surface-500 w-[25%] px-4 py-3 text-sm font-bold"> 상품명 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 주문 금액 </th>
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 구매자 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 구매일자 </th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each filteredOrders as order, index}
          <tr class="hover:bg-surface-50 border-surface-50 border-b">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm">{order.id}</td>
            <td class="px-4 py-4 text-center text-sm">
              <span class="{getStatusBadge(order.status)} inline-block rounded-full px-3 py-1 text-xs font-medium">
                {getStatusText(order.status)}
              </span>
            </td>
            <td class="px-4 py-4 text-left">
              <div class="flex flex-col items-start">
                <span class="text-surface-900 text-sm font-medium"
                  >{order.product}
                  {#if order.itemsCount && order.itemsCount > 0}
                    외 {order.itemsCount}건
                  {/if}
                </span>
              </div>
            </td>
            <td class="text-surface-900 px-4 py-4 text-center text-sm font-medium whitespace-nowrap"
              >{order.amount.toLocaleString()} 원</td
            >
            <td class="text-surface-700 px-4 py-4 text-center text-sm">{order.customerName}</td>
            <td class="text-surface-700 px-4 py-4 text-center text-sm whitespace-nowrap">{order.createdAt}</td>

            <td class="px-4 py-4"></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
