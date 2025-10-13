<script lang="ts">
  let products = [
    {
      id: 'PROD-001',
      name: '유기농 쌀 10kg',
      category: '곡물',
      price: 45000,
      initialStock: 500,
      currentStock: 342,
      supplier: '농협중앙회',
      supplierContact: '02-1234-5678',
      description: '100% 유기농 인증 쌀',
      imageUrl: '/images/rice.jpg',
      status: 'active',
      registeredAt: '2024-01-15',
      lastUpdated: '2024-10-10',
      totalSold: 158,
    },
    {
      id: 'PROD-002',
      name: '제주 감귤 5kg',
      category: '과일',
      price: 25000,
      initialStock: 300,
      currentStock: 87,
      supplier: '제주감귤농협',
      supplierContact: '064-123-4567',
      description: '제주도 직송 신선한 감귤',
      imageUrl: '/images/orange.jpg',
      status: 'active',
      registeredAt: '2024-02-01',
      lastUpdated: '2024-10-11',
      totalSold: 213,
    },
    {
      id: 'PROD-003',
      name: '친환경 배추 10포기',
      category: '채소',
      price: 18000,
      initialStock: 200,
      currentStock: 0,
      supplier: '한국채소농협',
      supplierContact: '02-987-6543',
      description: '무농약 인증 배추',
      imageUrl: '/images/cabbage.jpg',
      status: 'out_of_stock',
      registeredAt: '2024-03-15',
      lastUpdated: '2024-10-09',
      totalSold: 200,
    },
    {
      id: 'PROD-004',
      name: '청양고추 1kg',
      category: '채소',
      price: 12000,
      initialStock: 150,
      currentStock: 45,
      supplier: '청양농협',
      supplierContact: '041-123-4567',
      description: '매운맛 청양고추',
      imageUrl: '/images/pepper.jpg',
      status: 'low_stock',
      registeredAt: '2024-04-01',
      lastUpdated: '2024-10-08',
      totalSold: 105,
    },
  ]

  let selectedStatus = 'all'
  let selectedCategory = 'all'
  let searchTerm = ''
  let dateFrom = ''
  let dateTo = ''

  const statusOptions = [
    { value: 'all', label: '전체', count: products.length },
    {
      value: 'active',
      label: '판매중',
      count: products.filter((p) => p.status === 'active').length,
    },
    {
      value: 'low_stock',
      label: '재고부족',
      count: products.filter((p) => p.status === 'low_stock').length,
    },
    {
      value: 'out_of_stock',
      label: '품절',
      count: products.filter((p) => p.status === 'out_of_stock').length,
    },
    {
      value: 'inactive',
      label: '판매중지',
      count: products.filter((p) => p.status === 'inactive').length,
    },
  ]

  const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: '곡물', label: '곡물' },
    { value: '과일', label: '과일' },
    { value: '채소', label: '채소' },
    { value: '육류', label: '육류' },
    { value: '수산물', label: '수산물' },
  ]

  $: filteredProducts = products.filter((product) => {
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-surface-100 text-surface-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return '판매중'
      case 'low_stock':
        return '재고부족'
      case 'out_of_stock':
        return '품절'
      case 'inactive':
        return '판매중지'
      default:
        return status
    }
  }

  function getStockStatusColor(currentStock: number, initialStock: number) {
    const ratio = currentStock / initialStock
    if (ratio === 0) return 'text-red-600'
    if (ratio < 0.2) return 'text-yellow-600'
    return 'text-green-600'
  }

  function toggleProductStatus(productId: string) {
    products = products.map((product) => {
      if (product.id === productId) {
        const newStatus = product.status === 'active' ? 'inactive' : 'active'
        return {
          ...product,
          status: newStatus,
          lastUpdated: new Date().toISOString().split('T')[0],
        }
      }
      return product
    })
  }

  function addStock(productId: string) {
    const quantity = prompt('추가할 재고 수량을 입력하세요:')
    if (quantity && !isNaN(Number(quantity))) {
      products = products.map((product) => {
        if (product.id === productId) {
          const newStock = product.currentStock + Number(quantity)
          let newStatus = product.status
          if (newStock > 0 && product.status === 'out_of_stock') {
            newStatus = 'active'
          }
          return {
            ...product,
            currentStock: newStock,
            status: newStatus,
            lastUpdated: new Date().toISOString().split('T')[0],
          }
        }
        return product
      })
    }
  }

  function viewProductDetails(productId: string) {
    const product = products.find((p) => p.id === productId)
    if (product) {
      alert(
        `상품 상세 정보:\n상품명: ${product.name}\n카테고리: ${product.category}\n가격: ${formatCurrency(product.price)}\n현재재고: ${product.currentStock}개\n공급업체: ${product.supplier}\n연락처: ${product.supplierContact}\n설명: ${product.description}\n총 판매량: ${product.totalSold}개`
      )
    }
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
  <title>상품 관리 - 본사</title>
</svelte:head>

<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">상품 관리</h1>
  </div>
  <button
    class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
  >
    새 상품 등록
  </button>
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
              ? 'bg-primary-300 text-primary-contrast shadow-sm'
              : 'text-surface-600 hover:text-surface-800'}"
            on:click={() => (selectedCategory = option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>

      <!-- 상품명 검색 -->
      <div class="flex items-center">
        <input
          type="text"
          bind:value={searchTerm}
          placeholder="상품명 검색"
          class="border-0 border-b px-3 py-1.5 text-sm {searchTerm
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
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">상품 정보</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">가격</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">재고</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">공급업체</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">상태</th>
          <th class="text-surface-500 w-40 px-4 py-3 text-center text-xs font-medium">액션</th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each filteredProducts as product, index}
          <tr class="hover:bg-surface-50 border-surface-50 border-b">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center">
                <div class="h-12 w-12 flex-shrink-0">
                  <div class="bg-surface-200 flex h-12 w-12 items-center justify-center rounded-lg">
                    <span class="text-lg">📦</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-surface-900 text-sm font-medium">{product.name}</div>
                  <div class="text-surface-500 text-sm">{product.category}</div>
                  <div class="text-surface-400 text-xs">
                    등록: {formatDate(product.registeredAt)}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">{formatCurrency(product.price)}</div>
              <div class="text-surface-500 text-xs">판매량: {product.totalSold}개</div>
            </td>
            <td class="px-4 py-4">
              <div class={`text-sm font-medium ${getStockStatusColor(product.currentStock, product.initialStock)}`}>
                {product.currentStock}/{product.initialStock}
              </div>
              <div class="text-surface-500 text-xs">
                {Math.round((product.currentStock / product.initialStock) * 100)}% 남음
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">{product.supplier}</div>
              <div class="text-surface-500 text-xs">{product.supplierContact}</div>
            </td>
            <td class="px-4 py-4">
              <span class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(product.status)}`}>
                {getStatusText(product.status)}
              </span>
            </td>
            <td class="px-4 py-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <button
                  on:click={() => viewProductDetails(product.id)}
                  class="text-surface-700 bg-surface-100 hover:bg-surface-200 rounded px-2 py-1 text-xs font-medium"
                  title="상세보기"
                >
                  상세
                </button>
                <button
                  on:click={() => addStock(product.id)}
                  class="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                  title="재고 추가"
                >
                  재고+
                </button>
                <button
                  on:click={() => toggleProductStatus(product.id)}
                  class={`rounded px-2 py-1 text-xs font-medium ${
                    product.status === 'active'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={product.status === 'active' ? '판매 중지' : '판매 재개'}
                >
                  {product.status === 'active' ? '중지' : '재개'}
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if filteredProducts.length === 0}
      <div class="py-12 text-center">
        <svg class="text-surface-400 mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 class="text-surface-900 mt-2 text-sm font-medium">등록된 상품이 없습니다</h3>
        <p class="text-surface-500 mt-1 text-sm">현재 조건에 맞는 상품이 없습니다.</p>
      </div>
    {/if}
  </div>
</div>
