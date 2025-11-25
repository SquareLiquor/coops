<script lang="ts">
  import { getProducts } from '$lib/database'
  import type { ProductEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import { X } from '@lucide/svelte'
  import { onMount } from 'svelte'

  let { onClose, onSelect: handleSelect, hqStore } = $props()
  let products: ProductEntity[] = $state([])
  let searchQuery = $state('')

  onMount(async () => {
    const { products: _products } = await getProducts({ storeId: hqStore.id })
    products = _products
  })

  const _handleSelect = async (index: number) => {
    const product = filteredProducts[index]
    const images = product.images
    handleSelect({ product, images })
    onClose()
  }

  const filteredProducts = $derived(
    products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <section class="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl" role="document">
    <!-- 헤더 -->
    <div class="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-4">
      <h2 class="text-xl font-semibold text-gray-900">본사 상품 선택</h2>
      <button
        type="button"
        class="ml-auto flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        onclick={onClose}
        aria-label="닫기"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- 검색 영역 -->
    <div class="border-b border-gray-200 bg-white px-6 py-4">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="상품명 또는 카테고리로 검색..."
        class="focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
      />
    </div>

    <!-- 스크롤 가능한 본문 -->
    <div class="max-h-[calc(90vh-200px)] overflow-y-auto">
      {#if filteredProducts.length === 0}
        <div class="py-16 text-center text-gray-500">
          {searchQuery ? '검색 결과가 없습니다.' : '상품이 없습니다.'}
        </div>
      {:else}
        <div class="divide-y divide-gray-200">
          {#each filteredProducts as product, index}
            <div class="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50">
              <!-- 상품 이미지 -->
              <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {#if product.images && product.images.length > 0}
                  <img
                    src={product.images.find((img) => img.representative)?.url || product.images[0]?.url}
                    alt={product.name}
                    class="h-full w-full object-cover"
                  />
                {:else}
                  <div class="flex h-full w-full items-center justify-center text-2xl">📦</div>
                {/if}
              </div>

              <!-- 상품 정보 -->
              <div class="flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <span class="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {product.category?.name || '미분류'}
                  </span>
                  <h3 class="mb-1 font-semibold text-gray-900">{product.name}</h3>
                </div>

                <div class="flex items-center gap-3 text-sm text-gray-500">
                  <span class="text-primary-600 font-semibold">{formatCurrency(product.price)}</span>
                  <span>•</span>
                  <span>{product.unit} ({product.quantityPerUnit}개)</span>
                </div>
              </div>

              <!-- 선택 버튼 -->
              <button
                type="button"
                class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                onclick={() => _handleSelect(index)}
              >
                선택
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>
</div>
