<script lang="ts">
  let coops = [
    {
      id: 'COOP-001',
      title: '유기농 쌀 공동구매',
      category: '곡물',
      status: 'pre',
      target: '50',
      current: '32',
      price: '45000',
      storePrice: '45000',
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
      storePrice: '27000',
      endDate: '2024-12-20',
    },
    {
      id: 'COOP-003',
      title: '친환경 배추 10포기',
      category: '채소',
      status: 'paused',
      target: '80',
      current: '15',
      price: '18000',
      storePrice: '18000',
      endDate: '2024-12-30',
    },
    {
      id: 'COOP-004',
      title: '청양고추 1kg',
      category: '채소',
      status: 'selling',
      target: '30',
      current: '28',
      price: '12000',
      storePrice: '13500',
      endDate: '2024-12-28',
    },
    {
      id: 'COOP-005',
      title: '사과 3kg (부사)',
      category: '과일',
      status: 'closed',
      target: '60',
      current: '45',
      price: '22000',
      storePrice: '22000',
      endDate: '2024-12-27',
    },
    {
      id: 'COOP-006',
      title: '국산 콩 500g',
      category: '곡물',
      status: 'pre',
      target: '40',
      current: '8',
      price: '15000',
      storePrice: '16000',
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
    { value: 'pre', label: '판매 전', count: coops.filter((c) => c.status === 'pre').length },
    { value: 'selling', label: '판매 중', count: coops.filter((c) => c.status === 'selling').length },
    { value: 'paused', label: '일시 중지', count: coops.filter((c) => c.status === 'paused').length },
    { value: 'stopped', label: '판매 중지', count: coops.filter((c) => c.status === 'stopped').length },
    { value: 'closed', label: '판매 종료', count: coops.filter((c) => c.status === 'closed').length },
    { value: 'completed', label: '판매 완료', count: coops.filter((c) => c.status === 'completed').length },
  ]

  // 필터링된 공구 목록
  $: filteredCoops = coops.filter((coop) => {
    const statusMatch = selectedStatus === 'all' || coop.status === selectedStatus
    const categoryMatch = selectedCategory === 'all' || coop.category === selectedCategory

    let dateMatch = true
    if (dateFrom) {
      dateMatch = dateMatch && new Date(coop.endDate) >= new Date(dateFrom)
    }
    if (dateTo) {
      dateMatch = dateMatch && new Date(coop.endDate) <= new Date(dateTo)
    }

    return statusMatch && categoryMatch && dateMatch
  })

  const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: '곡물', label: '곡물' },
    { value: '과일', label: '과일' },
    { value: '채소', label: '채소' },
  ]

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pre':
        return 'bg-surface-100 text-surface-700'
      case 'selling':
        return 'bg-green-300 text-green-700'
      case 'paused':
        return 'bg-yellow-100 text-yellow-700'
      case 'stopped':
        return 'bg-orange-100 text-orange-700'
      case 'closed':
        return 'bg-red-100 text-red-700'
      case 'completed':
        return 'bg-emerald-500 text-white'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'pre':
        return '판매 전'
      case 'selling':
        return '판매 중'
      case 'paused':
        return '일시 중지'
      case 'stopped':
        return '판매 중지'
      case 'closed':
        return '판매 종료'
      case 'completed':
        return '판매 완료'
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
    <h1 class="text-surface-900 text-2xl font-bold">판매 상품 관리</h1>
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
          <th class="text-surface-500 w-[10%] px-4 py-3 text-sm font-bold"> 판매 상태 </th>
          <th class="text-surface-500 w-[25%] px-4 py-3 text-sm font-bold"> 상품명 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 가격 </th>
          <th class="text-surface-500 w-[15%] px-4 py-3 text-sm font-bold whitespace-nowrap"> 판매일 </th>
          <th class="text-surface-500 w-[25%] px-4 py-3 text-sm font-bold"> 진행률 </th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each filteredCoops as coop, index}
          <tr class="hover:bg-surface-50 border-surface-50 border-b">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="px-4 py-4 text-center">
              <span class="{getStatusBadge(coop.status)} inline-block rounded-full px-3 py-1 text-xs font-medium">
                {getStatusText(coop.status)}
              </span>
            </td>
            <td class="px-4 py-4 text-left">
              <div class="flex flex-col">
                <span class="text-surface-900 text-sm font-medium">{coop.title}</span>
                <span class="text-surface-400 mt-1 text-xs">{coop.category}</span>
              </div>
            </td>
            <td class="px-4 py-4 text-center whitespace-nowrap">
              {#if coop.status === 'pre'}
                <span class="text-surface-900 text-sm font-bold">{parseInt(coop.price).toLocaleString()} 원</span>
              {:else if coop.storePrice && coop.storePrice !== coop.price}
                <div class="flex flex-col items-center">
                  <span class="text-surface-900 text-sm font-bold">{parseInt(coop.storePrice).toLocaleString()} 원</span
                  >
                  <span class="text-surface-400 mt-1 text-xs line-through"
                    >{parseInt(coop.price).toLocaleString()}원</span
                  >
                </div>
              {:else}
                <span class="text-surface-900 text-sm font-bold">{parseInt(coop.price).toLocaleString()} 원</span>
              {/if}
            </td>
            <td class="text-surface-700 px-4 py-4 text-center text-sm whitespace-nowrap">
              {coop.status === 'pre' ? '-' : coop.endDate}
            </td>

            <td class="px-4 py-4 text-center">
              <div class="flex flex-col items-center gap-1">
                <div class="mb-1 flex w-full items-center justify-between text-xs">
                  <span class="text-surface-700 font-medium">{coop.current}</span>
                  <span class="text-surface-600 mx-auto text-base font-medium"
                    >{Math.round((parseInt(coop.current) / parseInt(coop.target)) * 100)}%</span
                  >
                  <span class="text-surface-400 font-medium">{coop.target}</span>
                </div>
                <div class="relative w-full">
                  <div class="bg-surface-50/50 h-2 justify-between overflow-hidden rounded-full">
                    <div
                      class="{(() => {
                        const progress = Math.round((parseInt(coop.current) / parseInt(coop.target)) * 100)
                        if (progress >= 90) return 'bg-primary-500'
                        if (progress >= 70) return 'bg-primary-400'
                        if (progress >= 50) return 'bg-primary-300'
                        if (progress >= 30) return 'bg-primary-200'
                        if (progress >= 10) return 'bg-primary-100'
                        return 'bg-primary-50'
                      })()} h-full rounded-full transition-all duration-300"
                      style="width: {Math.round((parseInt(coop.current) / parseInt(coop.target)) * 100)}%"
                    ></div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4"></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
