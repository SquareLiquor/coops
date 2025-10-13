<script lang="ts">
  let coops = [
    {
      id: 'COOP-001',
      title: '유기농 쌀 공동구매',
      category: '곡물',
      status: 'active',
      target: '50',
      current: '32',
      price: '45000',
      endDate: '2024-12-25',
    },
    {
      id: 'COOP-002',
      title: '제주 감귤 5kg',
      category: '과일',
      status: 'completed',
      target: '100',
      current: '100',
      price: '25000',
      endDate: '2024-12-20',
    },
    {
      id: 'COOP-003',
      title: '친환경 배추 10포기',
      category: '채소',
      status: 'pending',
      target: '80',
      current: '15',
      price: '18000',
      endDate: '2024-12-30',
    },
    {
      id: 'COOP-004',
      title: '청양고추 1kg',
      category: '채소',
      status: 'active',
      target: '30',
      current: '28',
      price: '12000',
      endDate: '2024-12-28',
    },
    {
      id: 'COOP-005',
      title: '사과 3kg (부사)',
      category: '과일',
      status: 'active',
      target: '60',
      current: '45',
      price: '22000',
      endDate: '2024-12-27',
    },
    {
      id: 'COOP-006',
      title: '국산 콩 500g',
      category: '곡물',
      status: 'pending',
      target: '40',
      current: '8',
      price: '15000',
      endDate: '2025-01-05',
    },
  ]

  // 필터 상태
  let selectedStatus = 'all'
  let selectedCategory = 'all'
  let dateFrom = ''
  let dateTo = ''

  const statusOptions = [
    { value: 'all', label: '전체', count: coops.length },
    { value: 'active', label: '진행중', count: coops.filter((c) => c.status === 'active').length },
    {
      value: 'pending',
      label: '대기중',
      count: coops.filter((c) => c.status === 'pending').length,
    },
    {
      value: 'completed',
      label: '완료',
      count: coops.filter((c) => c.status === 'completed').length,
    },
  ]

  const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: '곡물', label: '곡물' },
    { value: '과일', label: '과일' },
    { value: '채소', label: '채소' },
  ]

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return '진행중'
      case 'completed':
        return '완료'
      case 'pending':
        return '대기중'
      default:
        return status
    }
  }
</script>

<svelte:head>
  <title>공구 관리 - 관리자</title>
</svelte:head>

<!-- Header -->
<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">공동구매관리</h1>
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
        {#each categoryOptions as option}
          <button
            class="rounded px-3 py-1.5 text-sm font-medium transition-colors {selectedCategory === option.value
              ? 'bg-primary-300 text-primary-contrast shadow-sm'
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
            ? 'bg-primary-300 text-primary-contrast shadow-sm'
            : 'text-surface-600 hover:text-surface-800'}"
          on:click={() => (selectedStatus = option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="border-surface-100 overflow-hidden rounded-lg border bg-white">
    <table class="min-w-full">
      <thead class="bg-surface-50/50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-3 text-center">
            <span class="text-surface-500 text-xs font-medium">#</span>
          </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium"> 상품명 </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium"> 카테고리 </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium"> 상태 </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium"> 진행률 </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium"> 가격 </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium"> 마감일 </th>
          <th class="w-8 px-4 py-3"></th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each coops as coop, index}
          <tr class="hover:bg-surface-50 border-surface-50 border-b">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">{coop.title}</div>
            </td>
            <td class="px-4 py-4">
              <span class="text-surface-700 text-sm">{coop.category}</span>
            </td>
            <td class="px-4 py-4">
              {#if coop.status === 'active'}
                <div class="flex items-center">
                  <div class="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                  <span class="text-surface-700 text-sm">진행중</span>
                </div>
              {:else if coop.status === 'completed'}
                <div class="flex items-center">
                  <div class="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                  <span class="text-surface-700 text-sm">완료</span>
                </div>
              {:else}
                <div class="flex items-center">
                  <div class="bg-surface-400 mr-2 h-2 w-2 rounded-full"></div>
                  <span class="text-surface-700 text-sm">{getStatusText(coop.status)}</span>
                </div>
              {/if}
            </td>
            <td class="text-surface-700 px-4 py-4 text-sm">
              {Math.round((parseInt(coop.current) / parseInt(coop.target)) * 100)}%
            </td>
            <td class="text-surface-700 px-4 py-4 text-sm">
              {parseInt(coop.price).toLocaleString()}원
            </td>
            <td class="text-surface-700 px-4 py-4 text-sm">
              {coop.endDate}
            </td>
            <td class="px-4 py-4 text-center">
              <button class="text-surface-400 hover:text-surface-600" aria-label="공구 관리 옵션">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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
