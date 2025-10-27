<script lang="ts">
  import { ProductsFilterSchema } from '$lib/schemas'
  import type { ProductData } from '$lib/types'
  import type { ActionResult } from '@sveltejs/kit'
  import { superForm } from 'sveltekit-superforms'
  import { valibot } from 'sveltekit-superforms/adapters'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let products: ProductData[] = $state([])

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    validateForm: validateFilterForm,
    enhance: filterEnhance,
    submit: filterSubmit,
    delayed: filterDelayed,
  } = superForm(data.filterForm, {
    validators: valibot(ProductsFilterSchema),
    resetForm: false,
    onChange: async (event) => {
      try {
        console.log('filter form changed')
        const result = await validateFilterForm({ update: true })

        if (result.valid) filterSubmit()
      } catch (e) {
        console.error('validate form error:', e)
      }
    },
    onResult: ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') {
        products = result.data?.products || []
      }
      if (result?.type === 'failure') {
        products = []
      }
    },
  })

  console.log('filterForm', $filterForm)

  const statusOptions = [
    { value: 'all', label: '전체', count: products.length },
    {
      value: 'active',
      label: '판매중',
    },
    {
      value: 'low_stock',
      label: '재고부족',
    },
    {
      value: 'out_of_stock',
      label: '품절',
    },
    {
      value: 'inactive',
      label: '판매중지',
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
  <a
    href="/hq/products/create"
    class="btn bg-primary-500 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >새 상품 등록</a
  >
</div>

<div class="p-6">
  <!-- Filter Area -->
  <div class="mb-6 flex items-center justify-between">
    <!-- 좌측 필터 영역 -->
    <form method="POST" action="?/fetch" use:filterEnhance class="mb-6 flex items-center justify-between">
      <input type="hidden" name="store_id" bind:value={$filterForm.store_id} />
      <div class="flex items-center gap-4">
        <!-- 날짜 필터 -->
        <div class="flex items-center gap-2">
          <input
            type="date"
            bind:value={$filterForm.date_from}
            class="border-0 border-b px-3 py-1.5 text-sm {$filterForm.date_from
              ? 'border-primary-500 text-primary-700'
              : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
            placeholder="From"
          />
          <span class="text-surface-400">~</span>
          <input
            type="date"
            bind:value={$filterForm.date_to}
            class="border-0 border-b px-3 py-1.5 text-sm {$filterForm.date_to
              ? 'border-primary-500 text-primary-700'
              : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
            placeholder="To"
          />
        </div>

        <!-- 카테고리 필터 -->
        <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
          {#each categoryOptions as option, index}
            <button
              class="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors {$filterForm.category_id ===
              option.value
                ? 'bg-primary-500 text-primary-50 shadow-sm'
                : 'text-surface-600 hover:text-surface-800'}"
              onclick={() => ($filterForm.category_id = option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>

        <!-- 상품명 검색 -->
        <div class="flex items-center">
          <input
            type="text"
            bind:value={$filterForm.product_name}
            placeholder="상품명 검색"
            class="border-0 border-b px-3 py-1.5 text-sm {$filterForm.product_name
              ? 'border-primary-500 text-primary-700'
              : 'border-surface-100'} focus:border-primary-500 w-40 bg-transparent focus:outline-none"
          />
        </div>
      </div>
    </form>

    <!-- 우측 상태 필터 영역 -->
    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      {#each statusOptions as option}
        <button
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors {$filterForm.status === option.value
            ? 'bg-primary-500 text-primary-50 shadow-sm'
            : 'text-surface-600 hover:text-surface-800'}"
          onclick={() => ($filterForm.status = option.value)}
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
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">상태</th>
          <th class="text-surface-500 w-40 px-4 py-3 text-center text-xs font-medium">액션</th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each products as product, index}
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
                  <div class="text-surface-500 text-sm">{product.category_id}</div>
                  <div class="text-surface-400 text-xs">
                    등록: {formatDate(product.created_at)}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">{formatCurrency(product.price)}</div>
              <!-- <div class="text-surface-500 text-xs">판매량: {product.totalSold}개</div> -->
            </td>
            <td class="px-4 py-4">
              <div class="text-sm font-medium">
                <!-- {product.currentStock}/{product.initialStock} -->
              </div>
              <div class="text-surface-500 text-xs">
                <!-- {Math.round((product.currentStock / product.initialStock) * 100)}% 남음 -->
              </div>
            </td>
            <td class="px-4 py-4">
              <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium">
                <!-- {getStatusText(product.status)} -->
              </span>
            </td>
            <td class="px-4 py-4 text-center">
              <div class="flex items-center justify-center gap-1">
                <button
                  class="text-surface-700 bg-surface-100 hover:bg-surface-200 rounded px-2 py-1 text-xs font-medium"
                  title="상세보기"
                >
                  상세
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if products.length === 0}
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
