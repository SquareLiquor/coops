<script lang="ts">
  import { goto } from '$app/navigation'
  import Carousel from '$lib/components/ui/Carousel.svelte'
  import { getProductById } from '$lib/supabase'
  import type { ProductData } from '$lib/types'
  import { onMount } from 'svelte'

  let { productId, onClose }: { productId: string; onClose: () => void } = $props()

  let product: ProductData | null = $state(null)
  let loading = $state(true)
  let error = $state(false)

  onMount(async () => {
    try {
      loading = true
      const result = await getProductById(productId)
      if (result.product) {
        product = result.product
      } else {
        error = true
      }
    } catch (err) {
      console.error('상품 조회 오류:', err)
      error = true
    } finally {
      loading = false
    }
  })

  function handleEdit() {
    goto(`/hq/products/${productId}`)
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
    <div class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div class="flex items-center space-x-3">
        <h2 class="text-xl font-semibold text-gray-900">상품 상세정보</h2>
        {#if product}
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            class:bg-green-100={product.active}
            class:text-green-800={product.active}
            class:bg-red-100={!product.active}
            class:text-red-800={!product.active}
          >
            {product.active ? '판매중' : '판매중지'}
          </span>
        {/if}
      </div>

      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          onclick={handleEdit}
          disabled={loading || error}
        >
          편집
        </button>
        <button
          type="button"
          class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
          onclick={onClose}
        >
          닫기
        </button>
      </div>
    </div>

    <!-- 스크롤 가능한 본문 -->
    <div class="max-h-[calc(90vh-80px)] overflow-y-auto">
      {#if loading}
        <!-- 로딩 상태 -->
        <div class="flex items-center justify-center p-12">
          <div class="text-center">
            <div class="border-primary-600 mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <div class="text-gray-600">상품 정보를 불러오는 중...</div>
          </div>
        </div>
      {:else if error}
        <!-- 에러 상태 -->
        <div class="flex items-center justify-center p-12">
          <div class="text-center">
            <div class="mb-4 text-4xl text-red-500">⚠️</div>
            <div class="mb-2 font-medium text-gray-900">상품 정보를 불러올 수 없습니다</div>
            <div class="text-sm text-gray-600">잠시 후 다시 시도해주세요.</div>
          </div>
        </div>
      {:else if product}
        <!-- 상품 정보 -->
        <div class="p-6">
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <!-- 좌측: 이미지 -->
            <div class="space-y-4">
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
            <div class="space-y-6">
              <div>
                <h1 class="mb-2 text-2xl font-bold text-gray-900">{product.name}</h1>
                <div class="space-y-1 text-gray-600">
                  <div>카테고리: <span class="font-medium">{product.category?.name || '미분류'}</span></div>
                  <div>
                    등록일: <span class="font-medium">{new Date(product.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-3 rounded-lg bg-gray-50 p-4">
                <h3 class="font-semibold text-gray-900">가격 정보</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-500">판매 가격</div>
                    <div class="text-xl font-bold text-gray-900">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(product.price)}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500">개당 가격</div>
                    <div class="text-lg font-semibold text-gray-700">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(
                        product.price / product.quantity_per_unit
                      )}
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-500">판매 단위</div>
                    <div class="font-medium">{product.unit}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500">단위별 수량</div>
                    <div class="font-medium">{product.quantity_per_unit}개</div>
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">초기 재고</div>
                  <div class="font-medium">{product.initial_stock?.toLocaleString()}개</div>
                </div>
              </div>

              {#if product.description}
                <div>
                  <h3 class="mb-2 font-semibold text-gray-900">상품 설명</h3>
                  <div class="prose max-w-none rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                    {@html product.description}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
</div>
