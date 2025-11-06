<script lang="ts">
  import ProductDetailModal from '$lib/components/modals/hq/ProductDetailModal.svelte'
  import { ProductsFilterSchema as FilterSchema } from '$lib/schemas'
  import type { ProductData } from '$lib/types'
  import { debounce, formatCurrency } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, tick } from 'svelte'
  import { superForm } from 'sveltekit-superforms'
  import { valibot } from 'sveltekit-superforms/adapters'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { categories, statuses } = data
  let products: ProductData[] = $state([])
  let selectedProductId: string | null = $state(null)
  let debouncedFilterSubmit: ReturnType<typeof debounce>

  onMount(async () => {
    await tick()

    debouncedFilterSubmit = debounce(async () => {
      const result = await validateFilterForm({ update: true })
      if (result.valid) filterSubmit()
    }, 300)

    filterSubmit()
  })

  onDestroy(() => debouncedFilterSubmit?.cancel?.())

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    validateForm: validateFilterForm,
    enhance: filterEnhance,
    submit: filterSubmit,
    submitting: filterSubmitting,
  } = superForm(data.filterForm, {
    validators: valibot(FilterSchema),
    resetForm: false,
    onChange: async ({ target }) => {
      try {
        if ((target as HTMLInputElement)?.type === 'text') {
          debouncedFilterSubmit()
        } else {
          const result = await validateFilterForm({ update: true })
          if (result.valid) filterSubmit()
        }
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
</script>

<svelte:head>
  <title>상품 관리 - 본사</title>
</svelte:head>

<div class="border-surface-200 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">상품 관리</h1>
  </div>
  <a
    href="/hq/products/create"
    class="btn bg-primary-500 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >새 상품 등록</a
  >
</div>

<div class="relative p-6">
  <!-- 좌측 필터 영역 -->
  <form method="POST" action="?/fetch" use:filterEnhance class="mb-6 flex items-center justify-between">
    <input type="hidden" name="store_id" bind:value={$filterForm.store_id} />
    <div class="flex flex-col">
      <div class="flex items-center gap-5">
        <!-- 날짜 필터 -->
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <input
              type="date"
              name="date_from"
              bind:value={$filterForm.date_from}
              class="focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              class:border-primary-500={$filterForm.date_from}
              class:text-primary-700={$filterForm.date_from}
              class:border-surface-100={!$filterForm.date_from}
              {...$filterConstraints.date_from}
            />
            <span class="text-surface-400">~</span>
            <input
              type="date"
              name="date_to"
              bind:value={$filterForm.date_to}
              class="focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              class:border-primary-500={$filterForm.date_to}
              class:text-primary-700={$filterForm.date_to}
              class:border-surface-100={!$filterForm.date_to}
              {...$filterConstraints.date_to}
            />
          </div>
        </div>

        <!-- 카테고리 필터 -->
        <select
          class="border-surface-100 focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
          name="category_id"
          bind:value={$filterForm.category_id}
        >
          <option value={undefined} selected>전체</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>

        <!-- 상품명 검색 -->

        <input
          type="text"
          name="product_name"
          bind:value={$filterForm.product_name}
          placeholder="상품명 검색"
          class="focus:border-primary-500 w-40 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
          class:border-primary-500={$filterForm.product_name}
          class:text-primary-700={$filterForm.product_name}
          class:border-surface-100={!$filterForm.product_name}
        />
      </div>

      {#if $filterErrors.date_from || $filterErrors.date_to}
        <div class="mt-1 flex flex-col gap-1">
          {#if $filterErrors.date_from}
            <div class="text-error-500 text-sm">{$filterErrors.date_from}</div>
          {/if}
          {#if $filterErrors.date_to}
            <div class="text-error-500 text-sm">{$filterErrors.date_to}</div>
          {/if}
        </div>
      {/if}
    </div>
    <!-- 우측 상태 필터 영역 -->
    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      <input type="hidden" name="status" bind:value={$filterForm.status} />
      {#each statuses as status}
        <button
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors"
          class:bg-primary-500={$filterForm.status === status.code}
          class:text-primary-50={$filterForm.status === status.code}
          class:shadow-sm={$filterForm.status === status.code}
          class:text-surface-600={$filterForm.status !== status.code}
          class:hover:text-surface-800={$filterForm.status !== status.code}
          onclick={() => ($filterForm.status = status.code)}
        >
          {status.label}
        </button>
      {/each}
    </div>
  </form>

  <div class="border-surface-100 bg-surface-50/50 relative overflow-hidden rounded-lg border">
    {#if $filterSubmitting}
      <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
        <span class="loader-giant"></span>
      </div>
    {/if}

    <table class="min-w-full">
      <thead class="bg-surface-50/50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-3 text-center">
            <span class="text-surface-500 text-xs font-medium">#</span>
          </th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">카테고리</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">상품명</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">가격</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">재고</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">상태</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">등록일</th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each products as product, index}
          <tr class="hover:bg-surface-50 border-surface-50 border-b">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm">{product.category?.name}</div>
            </td>
            <td class="px-4 py-4">
              <button
                type="button"
                class="text-primary-500 m-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium hover:underline"
                onclick={() => (selectedProductId = product.id)}
              >
                {product.name}
              </button>
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
                {product.initial_stock}
              </div>
            </td>
            <td class="px-4 py-4">
              <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium">
                <!-- {getStatusText(product.status)} -->
              </span>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-400 text-xs">
                {dayjs(product.created_at).format('YYYY-MM-DD')}
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

{#if selectedProductId}
  <ProductDetailModal productId={selectedProductId} onClose={() => (selectedProductId = null)} />
{/if}
