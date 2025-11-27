<script lang="ts">
  import { goto } from '$app/navigation'
  import Carousel from '$lib/components/ui/Carousel.svelte'
  import type { ProductEntity } from '$lib/types'
  import { formatNumberWithCommas } from '$lib/utils'
  import { ChevronDown, ChevronUp, X } from '@lucide/svelte'

  let { product, onClose }: { product: ProductEntity | null; onClose: () => void } = $props()

  let isBasicInfoOpen = $state(false)
  let isProductInfoOpen = $state(false)

  function handleEdit() {
    goto(`/hq/products/${product?.id}`)
    onClose()
  }
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
      <h2 class="text-xl font-bold text-gray-900">상품 상세</h2>
      <button
        type="button"
        class="flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
        onclick={onClose}
        aria-label="닫기"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- 스크롤 가능한 본문 -->
    <div class="flex-1 overflow-y-auto px-6 pt-6 pb-6">
      {#if product}
        <div class="space-y-4">
          <!-- 이미지 섹션 -->
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            {#if product.images && product.images.length > 0}
              <div class="relative aspect-video overflow-hidden rounded-lg">
                <Carousel images={product.images} />
              </div>
            {:else}
              <div class="aspect-video overflow-hidden rounded-lg bg-gray-100">
                <div class="flex h-full items-center justify-center">
                  <span class="text-6xl">📦</span>
                </div>
              </div>
            {/if}
          </div>

          <!-- 기본 정보 (Collapsible) -->
          <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              onclick={() => (isBasicInfoOpen = !isBasicInfoOpen)}
            >
              <div class="flex-1">
                <div class="mb-1 text-sm font-semibold text-gray-700">기본 정보</div>
                {#if !isBasicInfoOpen}
                  <div class="text-xs text-gray-500">
                    {product.name}, {product.category?.name || '미분류'}
                  </div>
                {/if}
              </div>
              {#if isBasicInfoOpen}
                <ChevronUp class="h-4 w-4 text-gray-500" />
              {:else}
                <ChevronDown class="h-4 w-4 text-gray-500" />
              {/if}
            </button>
            {#if isBasicInfoOpen}
              <div class="border-t border-gray-200 bg-gray-50 px-5 py-4">
                <dl class="space-y-2.5">
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">상품명</dt>
                    <dd class="text-sm font-medium text-gray-900">{product.name}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">카테고리</dt>
                    <dd class="text-sm text-gray-900">{product.category?.name || '미분류'}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">등록일</dt>
                    <dd class="text-sm text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                </dl>
              </div>
            {/if}
          </div>

          <!-- 상품 정보 (Collapsible) -->
          <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              onclick={() => (isProductInfoOpen = !isProductInfoOpen)}
            >
              <div class="flex-1">
                <div class="mb-1 text-sm font-semibold text-gray-700">상품 정보</div>
                {#if !isProductInfoOpen}
                  <div class="text-xs text-gray-500">
                    가격:
                    <span class="text-primary-600 font-medium">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(product.price)}
                    </span>
                  </div>
                {/if}
              </div>
              {#if isProductInfoOpen}
                <ChevronUp class="h-4 w-4 text-gray-500" />
              {:else}
                <ChevronDown class="h-4 w-4 text-gray-500" />
              {/if}
            </button>
            {#if isProductInfoOpen}
              <div class="border-t border-gray-200 bg-blue-50 px-5 py-4">
                <dl class="space-y-2.5">
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매 가격</dt>
                    <dd class="text-primary-600 text-base font-bold">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(product.price)}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">개별 용량</dt>
                    <dd class="text-sm font-medium text-gray-900">{product.capacity}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">개별 단위</dt>
                    <dd class="text-sm text-gray-900">{product.sellUnit}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">초기 재고</dt>
                    <dd class="text-primary-600 text-sm font-semibold">
                      {formatNumberWithCommas(product.initialStock || 0)} 개
                    </dd>
                  </div>
                </dl>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- 푸터: 버튼 -->
    <div class="flex items-center justify-between border-t border-gray-200 px-6 py-3">
      <button
        type="button"
        class="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
        onclick={onClose}
      >
        닫기
      </button>
      <button
        type="button"
        class="bg-primary-600 hover:bg-primary-700 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors focus:outline-none"
        onclick={handleEdit}
      >
        편집
      </button>
    </div>
  </section>
</div>
