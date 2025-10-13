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
    { value: 'all', label: '전체 카테고리' },
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
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

<div class="bg-white rounded-lg shadow-sm">
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">상품 관리</h1>
    </div>
    <button
      class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      새 상품 등록
    </button>
  </div>

  <div class="p-6">
    <!-- Filter Area -->
    <div class="mb-6 flex items-center justify-between">
      <!-- 좌측 필터 영역 -->
      <div class="flex items-center gap-4">
        <!-- 검색 필터 -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="상품명, 공급업체로 검색"
            class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        <!-- 카테고리 필터 -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {#each categoryOptions as option}
            <button
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors {selectedCategory === option.value
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">상품 정보</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">가격</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">재고</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">공급업체</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">상태</th>
            <th class="w-40 px-4 py-3 text-center text-xs font-medium text-gray-500">액션</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          {#each filteredProducts as product, index}
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-4 text-center text-sm text-gray-500">
                {index + 1}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12">
                    <div class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span class="text-lg">📦</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{product.name}</div>
                    <div class="text-sm text-gray-500">{product.category}</div>
                    <div class="text-xs text-gray-400">
                      등록: {formatDate(product.registeredAt)}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</div>
                <div class="text-xs text-gray-500">판매량: {product.totalSold}개</div>
              </td>
              <td class="px-4 py-4">
                <div class={`text-sm font-medium ${getStockStatusColor(product.currentStock, product.initialStock)}`}>
                  {product.currentStock}/{product.initialStock}
                </div>
                <div class="text-xs text-gray-500">
                  {Math.round((product.currentStock / product.initialStock) * 100)}% 남음
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">{product.supplier}</div>
                <div class="text-xs text-gray-500">{product.supplierContact}</div>
              </td>
              <td class="px-4 py-4">
                <span
                  class={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(product.status)}`}
                >
                  {getStatusText(product.status)}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    on:click={() => viewProductDetails(product.id)}
                    class="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    title="상세보기"
                  >
                    상세
                  </button>
                  <button
                    on:click={() => addStock(product.id)}
                    class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                    title="재고 추가"
                  >
                    재고+
                  </button>
                  <button
                    on:click={() => toggleProductStatus(product.id)}
                    class={`px-2 py-1 text-xs font-medium rounded ${
                      product.status === 'active'
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
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
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">등록된 상품이 없습니다</h3>
          <p class="mt-1 text-sm text-gray-500">현재 조건에 맞는 상품이 없습니다.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
