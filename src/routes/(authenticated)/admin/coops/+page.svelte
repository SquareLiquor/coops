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
      endDate: '2024-12-25'
    },
    {
      id: 'COOP-002',
      title: '제주 감귤 5kg',
      category: '과일',
      status: 'completed',
      target: '100',
      current: '100',
      price: '25000',
      endDate: '2024-12-20'
    },
    {
      id: 'COOP-003',
      title: '친환경 배추 10포기',
      category: '채소',
      status: 'pending',
      target: '80',
      current: '15',
      price: '18000',
      endDate: '2024-12-30'
    },
    {
      id: 'COOP-004',
      title: '청양고추 1kg',
      category: '채소',
      status: 'active',
      target: '30',
      current: '28',
      price: '12000',
      endDate: '2024-12-28'
    },
    {
      id: 'COOP-005',
      title: '사과 3kg (부사)',
      category: '과일',
      status: 'active',
      target: '60',
      current: '45',
      price: '22000',
      endDate: '2024-12-27'
    },
    {
      id: 'COOP-006',
      title: '국산 콩 500g',
      category: '곡물',
      status: 'pending',
      target: '40',
      current: '8',
      price: '15000',
      endDate: '2025-01-05'
    }
  ];

  // 필터 상태
  let selectedStatus = 'all';
  let selectedCategory = 'all';
  let dateFrom = '';
  let dateTo = '';

  const statusOptions = [
    { value: 'all', label: '전체', count: coops.length },
    { value: 'active', label: '진행중', count: coops.filter((c) => c.status === 'active').length },
    {
      value: 'pending',
      label: '대기중',
      count: coops.filter((c) => c.status === 'pending').length
    },
    {
      value: 'completed',
      label: '완료',
      count: coops.filter((c) => c.status === 'completed').length
    }
  ];

  const categoryOptions = [
    { value: 'all', label: '전체 카테고리' },
    { value: '곡물', label: '곡물' },
    { value: '과일', label: '과일' },
    { value: '채소', label: '채소' }
  ];

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return '진행중';
      case 'completed':
        return '완료';
      case 'pending':
        return '대기중';
      default:
        return status;
    }
  }
</script>

<svelte:head>
  <title>공구 관리 - 관리자</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">공동구매관리</h1>
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 상품명 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 카테고리 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 상태 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 진행률 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 가격 </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500"> 마감일 </th>
            <th class="w-8 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white">
          {#each coops as coop, index}
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-4 text-center text-sm text-gray-500">
                {index + 1}
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{coop.title}</div>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-700">{coop.category}</span>
              </td>
              <td class="px-4 py-4">
                {#if coop.status === 'active'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">진행중</span>
                  </div>
                {:else if coop.status === 'completed'}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">완료</span>
                  </div>
                {:else}
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-700">{getStatusText(coop.status)}</span>
                  </div>
                {/if}
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                {Math.round((parseInt(coop.current) / parseInt(coop.target)) * 100)}%
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                {parseInt(coop.price).toLocaleString()}원
              </td>
              <td class="px-4 py-4 text-sm text-gray-700">
                {coop.endDate}
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
