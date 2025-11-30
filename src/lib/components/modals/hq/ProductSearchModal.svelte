<script lang="ts">
  import { getProducts } from '$lib/services/products.service'
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
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <section
    class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
    role="document"
  >
    <!-- 헤더 -->
    <div class="flex items-center justify-between border-b border-gray-200 px-6 py-5">
      <h2 class="text-xl font-bold text-gray-900">본사 상품 선택</h2>
      <button
        type="button"
        class="flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
        onclick={onClose}
        aria-label="닫기"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- 검색 영역 -->
    <div class="border-b border-gray-200 bg-white px-6 py-4">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="상품명 또는 카테고리로 검색..."
        class="focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:ring-2 focus:outline-none"
      />
    </div>

    <!-- 스크롤 가능한 본문 -->
    <div class="flex-1 overflow-y-auto">
      {#if filteredProducts.length === 0}
        <div class="flex h-64 items-center justify-center text-sm text-gray-500">
          {searchQuery ? '검색 결과가 없습니다.' : '상품이 없습니다.'}
        </div>
      {:else}
        <div class="divide-y divide-gray-100">
          {#each filteredProducts as product, index}
            <div class="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
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
              <div class="flex flex-1 flex-col justify-center gap-1.5">
                <div class="flex items-center gap-2">
                  <span class="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {product.category?.name}
                  </span>
                  <h3 class="text-sm font-semibold text-gray-900">{product.name}</h3>
                </div>

                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <span class="text-primary-600 text-sm font-bold">{formatCurrency(product.price)}</span>
                  {#if product.capacity || product.sellUnit}
                    <span class="text-gray-300">|</span>
                    <div class="flex items-center gap-1">
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
                </div>
              </div>

              <!-- 선택 버튼 -->
              <button
                type="button"
                class="bg-primary-600 hover:bg-primary-700 rounded-full px-4 py-2 text-xs font-medium text-white transition-colors focus:outline-none"
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
