<script lang="ts">
  import { goto } from '$app/navigation'
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import PageHeader from '$lib/components/layout/PageHeader.svelte'
  import ProductDetailModal from '$lib/components/modals/hq/ProductDetailModal.svelte'
  import EmptyState from '$lib/components/ui/EmptyState.svelte'
  import Loading from '$lib/components/ui/Loading.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { ProductsFilterSchema } from '$lib/schemas'
  import type { ProductEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { categories, statuses } = data
  let products: ProductEntity[] = $state([])
  let selectedProduct: ProductEntity | null = $state(null)

  onMount(async () => {
    await tick()
    await asyncFilterSubmit()
  })

  onDestroy(() => debouncedSubmit?.cancel?.())

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    enhance: filterEnhance,
    submitting: filterSubmitting,
    asyncSubmit: asyncFilterSubmit,
    debouncedSubmit,
    pagination,
  } = buildFilterForm<typeof ProductsFilterSchema>({
    form: data.filterForm,
    schema: ProductsFilterSchema,
    resultHandler: {
      handleSuccess: (result) => (products = result.data?.products || []),
      handleFailure: () => (products = []),
    },
  })
</script>

<div class="min-h-screen bg-gray-100 p-6">
  <PageHeader title="상품 관리">
    {#snippet actions()}
      <button
        class="bg-primary-600 hover:bg-primary-700 rounded-full px-4 py-2 text-xs font-medium text-white transition-colors"
        onclick={() => goto('/hq/products/create')}
      >
        새 상품 등록
      </button>
    {/snippet}
  </PageHeader>

  <div class="relative">
    <Loading show={$filterSubmitting} />

    {@render filter()}

    <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-white">
            <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> # </th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">상품명</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">가격</th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">발주 단위</th
            >
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">상태</th>
            <th class="px-3 py-3 text-right text-sm font-semibold text-gray-900">등록일</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each products as product, index}
            <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {index + 1}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="flex items-center gap-2.5">
                  <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {#if product.images && product.images.length > 0}
                      <img
                        src={product.images.find((img) => img.representative)?.url || product.images[0]?.url}
                        alt={product.name}
                        class="h-full w-full object-cover"
                      />
                    {:else}
                      <div class="flex h-full w-full items-center justify-center text-sm">📦</div>
                    {/if}
                  </div>
                  <div class="flex flex-1 items-center justify-between gap-3">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-700 text-left text-sm font-medium transition-colors hover:underline"
                      onclick={() => (selectedProduct = product)}
                    >
                      {product.name}
                    </button>
                    <div class="flex flex-col items-end gap-0.5 text-xs text-gray-500">
                      {#if product.category?.name || product.capacity || product.sellUnit}
                        <span class={!product.capacity && !product.sellUnit ? 'self-center' : ''}>
                          {product.category?.name || ''}
                        </span>
                        {#if product.capacity || product.sellUnit}
                          <div class="flex items-center gap-1 whitespace-nowrap">
                            {#if product.capacity}
                              <span>{product.capacity}</span>
                            {/if}
                            {#if product.capacity && product.sellUnit}
                              <span>·</span>
                            {/if}
                            {#if product.sellUnit}
                              <span>{product.sellUnit}</span>
                            {/if}
                          </div>
                        {/if}
                      {/if}
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs text-gray-600">
                {formatCurrency(product.price)}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {#if product.purchaseQty && product.purchaseUnit}
                  {product.purchaseQty} / {product.purchaseUnit}
                {:else}
                  -
                {/if}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center">
                <span
                  class={[
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                    product.active ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800',
                  ]}
                >
                  {product.active ? '활성' : '비활성'}
                </span>
              </td>
              <td class="px-3 py-2 text-right text-xs text-gray-600">
                {dayjs(product.createdAt).format('YYYY.MM.DD')}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <EmptyState show={products.length === 0} title="등록된 상품이 없습니다" />
    </div>

    <Pagination {pagination} onPageChange={(page) => ($filterForm.page = page)} />
  </div>
</div>

{#if selectedProduct}
  <ProductDetailModal product={selectedProduct} onClose={() => (selectedProduct = null)} />
{/if}

{#snippet filter()}
  <form method="POST" action="?/fetch" use:filterEnhance class="mb-4">
    <input type="hidden" name="storeId" bind:value={$filterForm.storeId} />
    <input type="hidden" name="page" bind:value={$filterForm.page} />

    <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-2">
        <input
          type="date"
          name="dateFrom"
          bind:value={$filterForm.dateFrom}
          class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
          {...$filterConstraints.dateFrom}
        />
        <span class="text-xs text-gray-400">~</span>
        <input
          type="date"
          name="dateTo"
          bind:value={$filterForm.dateTo}
          class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
          {...$filterConstraints.dateTo}
        />

        <select
          class="focus:border-primary-500 min-w-[100px] rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
          name="categoryId"
          bind:value={$filterForm.categoryId}
        >
          <option value={undefined} selected>전체</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>

        <input
          type="text"
          name="productName"
          bind:value={$filterForm.productName}
          placeholder="상품명 검색"
          class="focus:border-primary-500 w-48 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto">
        <input type="hidden" name="status" bind:value={$filterForm.status} />
        {#each statuses as status}
          <button
            type="button"
            class={[
              'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              $filterForm.status === status.code && 'bg-primary-600 text-white',
              $filterForm.status !== status.code && 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]}
            onclick={() => ($filterForm.status = status.code)}
          >
            {status.label}
          </button>
        {/each}
      </div>
    </div>

    {#if $filterErrors.dateFrom || $filterErrors.dateTo}
      <div class="flex flex-col gap-1">
        {#if $filterErrors.dateFrom}
          <div class="text-sm text-red-600">{$filterErrors.dateFrom}</div>
        {/if}
        {#if $filterErrors.dateTo}
          <div class="text-sm text-red-600">{$filterErrors.dateTo}</div>
        {/if}
      </div>
    {/if}
  </form>
{/snippet}
