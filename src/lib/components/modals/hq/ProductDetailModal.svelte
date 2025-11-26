<script lang="ts">
  import { goto } from '$app/navigation'
  import Carousel from '$lib/components/ui/Carousel.svelte'
  import type { ProductEntity } from '$lib/types'
  import { X } from '@lucide/svelte'

  let { product, onClose }: { product: ProductEntity | null; onClose: () => void } = $props()

  function handleEdit() {
    goto(`/hq/products/${product?.id}`)
    onClose()
  }
</script>

<!-- 모달 배경 (클릭시 닫기) -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }}
  onclick={(e) => {
    // 오버레이 클릭 시 닫기, 내부 section 클릭은 stopPropagation
    if (e.target === e.currentTarget) {
      onClose()
    }
  }}
>
  <section class="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl" role="document">
    <!-- 헤더 -->
    <div class="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-4">
      <h2 class="text-xl font-semibold text-gray-900">상품 상세정보</h2>
      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          onclick={handleEdit}
        >
          편집
        </button>
        <button
          type="button"
          class="flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
          onclick={onClose}
          aria-label="닫기"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- 스크롤 가능한 본문 -->
    <div class="max-h-[calc(90vh-80px)] overflow-y-auto">
      {#if product}
        <!-- 상품 정보 -->
        <div class="p-6">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <!-- 좌측: 이미지 -->
            <div class="lg:col-span-2">
              {#if product.images && product.images.length > 0}
                <div class="relative aspect-square overflow-hidden rounded-lg">
                  <Carousel images={product.images} />
                </div>
              {:else}
                <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <div class="flex h-full items-center justify-center">
                    <span class="text-6xl">📦</span>
                  </div>
                </div>
              {/if}
            </div>

            <!-- 우측: 상품 정보 -->
            <div class="flex h-full flex-col lg:col-span-3">
              <!-- 기본 정보 -->
              <div class="mb-6">
                <h1 class="mb-3 text-2xl font-bold text-gray-900">{product.name}</h1>
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-gray-500">카테고리</span>
                    <span class="font-medium text-gray-900">{product.category?.name || '미분류'}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-gray-500">등록일</span>
                    <span class="font-medium text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 상품 정보 -->
              <div class="flex-1 space-y-4 rounded-lg border border-gray-200 bg-white p-5">
                <h3 class="text-base font-semibold text-gray-900">상품 정보</h3>

                <div class="space-y-3">
                  <div class="flex justify-between border-b border-gray-100 pb-3">
                    <span class="text-sm text-gray-500">판매 가격</span>
                    <span class="text-primary-600 text-xl font-bold">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(product.price)}
                    </span>
                  </div>

                  <div class="flex justify-between border-b border-gray-100 pb-3">
                    <span class="text-sm text-gray-500">개별 용량</span>
                    <span class="text-base font-semibold text-gray-900">
                      {product.capacity}
                    </span>
                  </div>

                  <div class="flex justify-between border-b border-gray-100 pb-3">
                    <span class="text-sm text-gray-500">개별 단위</span>
                    <span class="text-sm font-medium text-gray-900">{product.sellUnit}</span>
                  </div>

                  <div class="flex justify-between border-b border-gray-100 pb-3">
                    <span class="text-sm text-gray-500">초기 재고</span>
                    <span class="text-primary-600 text-sm font-semibold"
                      >{product.initialStock?.toLocaleString()}개</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
</div>
