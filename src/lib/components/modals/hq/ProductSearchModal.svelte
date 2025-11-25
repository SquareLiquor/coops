<script lang="ts">
  import { toProduictEntities } from '$lib/converters/product.converter'
  import { createBrowserClient } from '$lib/database'
  import type { ProductEntity } from '$lib/types'
  import { onMount } from 'svelte'

  const supabase = createBrowserClient()

  let { onClose, onSelect: handleSelect, hqStore } = $props()
  let products: ProductEntity[] = $state([])

  onMount(async () => {
    const { data } = await supabase
      .from('products')
      .select(
        `
        *,
        category:category_id ( id, name ),
        images:product_images ( id, product_id, url, representative, path, sort_order )
      `
      )
      .eq('store_id', hqStore.id)

    products = toProduictEntities(data || [])
  })

  const _handleSelect = async (index: number) => {
    const product = products[index]
    const images = product.images
    handleSelect({ product, images })
    onClose()
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
    <button
      type="button"
      class="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-600"
      onclick={onClose}
      aria-label="닫기">&times;</button
    >
    <h2 class="mb-4 text-lg font-bold">본사 상품 목록</h2>
    {#if products.length === 0}
      <div class="py-8 text-center text-gray-500">상품이 없습니다.</div>
    {:else}
      <ul class="divide-y">
        {#each products as product, index}
          <li class="flex items-center justify-between py-2">
            <span>[{product.category?.name}] {product.name}</span>
            <button
              type="button"
              class="btn btn-sm bg-primary-500 cursor-pointer rounded px-3 py-1 text-center text-white select-none"
              onclick={() => _handleSelect(index)}
            >
              선택
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .btn {
    transition: background 0.2s;
  }
  .btn:hover {
    background: #2563eb;
  }
</style>
