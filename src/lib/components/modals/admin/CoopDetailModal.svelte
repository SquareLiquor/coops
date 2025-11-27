<script lang="ts">
  import { goto } from '$app/navigation'
  import Alert from '$lib/components/ui/Alert.svelte'
  import Carousel from '$lib/components/ui/Carousel.svelte'
  import type { CoopEntity } from '$lib/types'
  import { formatNumberWithCommas } from '$lib/utils'
  import { ChevronDown, ChevronUp, X } from '@lucide/svelte'
  import dayjs from 'dayjs'

  let { coop, onClose }: { coop: CoopEntity | null; onClose: () => void } = $props()

  let isBasicInfoOpen = $state(false)
  let isSalesInfoOpen = $state(false)
  let isProductInfoOpen = $state(false)
  let showAlert = $state(false)

  function handleEdit() {
    goto(`/admin/coops/${coop?.id}`)
    onClose()
  }

  function showDeleteConfirm() {
    showAlert = true
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
      <h2 class="text-xl font-bold text-gray-900">공동구매 상세</h2>
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
      {#if coop}
        <div class="space-y-4">
          <!-- 이미지 섹션 -->
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            {#if coop.images && coop.images.length > 0}
              <div class="relative aspect-video overflow-hidden rounded-lg">
                <Carousel images={coop.images} />
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
                    {coop.name}, {coop.category?.name || '미분류'}
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
                    <dd class="text-sm font-medium text-gray-900">{coop.name}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">카테고리</dt>
                    <dd class="text-sm text-gray-900">{coop.category?.name || '미분류'}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">등록일</dt>
                    <dd class="text-sm text-gray-900">
                      {dayjs(coop.createdAt).format('YYYY-MM-DD')}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매일</dt>
                    <dd class="text-sm text-gray-900">{dayjs(coop.salesDate).format('YYYY-MM-DD')}</dd>
                  </div>
                </dl>
              </div>
            {/if}
          </div>

          <!-- 판매 정보 (Collapsible) -->
          <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              onclick={() => (isSalesInfoOpen = !isSalesInfoOpen)}
            >
              <div class="flex-1">
                <div class="mb-1 text-sm font-semibold text-gray-700">판매 정보</div>
                {#if !isSalesInfoOpen}
                  <div class="text-xs text-gray-500">
                    판매가격:
                    <span class="text-primary-600 font-medium">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(
                        coop.salesPrice || 0
                      )}
                    </span>
                  </div>
                {/if}
              </div>
              {#if isSalesInfoOpen}
                <ChevronUp class="h-4 w-4 text-gray-500" />
              {:else}
                <ChevronDown class="h-4 w-4 text-gray-500" />
              {/if}
            </button>
            {#if isSalesInfoOpen}
              <div class="border-t border-gray-200 bg-blue-50 px-5 py-4">
                <dl class="space-y-2.5">
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매 가격</dt>
                    <dd class="text-primary-600 text-base font-bold">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(
                        coop.salesPrice || 0
                      )}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">원가</dt>
                    <dd class="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(
                        coop.product?.price || 0
                      )}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매 가능 수량</dt>
                    <dd class="text-sm text-gray-900">{formatNumberWithCommas(coop.maxQuantity)} 개</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">주문 수량</dt>
                    <dd class="text-primary-600 text-sm font-semibold">
                      {formatNumberWithCommas(coop.orderedQuantity || 0)} 개
                    </dd>
                  </div>
                  <div class="pt-2">
                    <div class="mb-2 flex items-center justify-between">
                      <span class="text-xs font-medium text-gray-600">진행률</span>
                      <span class="text-primary-600 text-base font-bold">{coop.progress}%</span>
                    </div>
                    <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        class="bg-primary-500 h-full rounded-full transition-all duration-300"
                        style={`width: ${coop.progress}%`}
                      ></div>
                    </div>
                  </div>
                </dl>
              </div>
            {/if}
          </div>

          {#if coop.product}
            <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
                onclick={() => (isProductInfoOpen = !isProductInfoOpen)}
              >
                <div class="flex-1">
                  <div class="mb-1 text-sm font-semibold text-gray-700">상품 정보</div>
                  {#if !isProductInfoOpen && coop.product.capacity}
                    <div class="text-xs text-gray-500">
                      용량: {coop.product.capacity}
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
                <div class="border-t border-gray-200 bg-gray-50 px-5 py-4">
                  <dl class="space-y-2.5">
                    {#if coop.product.capacity}
                      <div class="flex items-start justify-between">
                        <dt class="text-xs font-medium text-gray-500">개별 용량</dt>
                        <dd class="text-sm text-gray-900">{coop.product.capacity}</dd>
                      </div>
                    {/if}
                    {#if coop.product.sellUnit}
                      <div class="flex items-start justify-between">
                        <dt class="text-xs font-medium text-gray-500">개별 단위</dt>
                        <dd class="text-sm text-gray-900">{coop.product.sellUnit}</dd>
                      </div>
                    {/if}
                  </dl>
                </div>
              {/if}
            </div>
          {/if}
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
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
          onclick={showDeleteConfirm}
        >
          삭제 테스트
        </button>
        <button
          type="button"
          class="bg-primary-600 hover:bg-primary-700 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors focus:outline-none"
          onclick={handleEdit}
        >
          편집
        </button>
      </div>
    </div>
  </section>
</div>

{#if showAlert}
  <Alert
    type="error"
    mode="confirm"
    title="상품 삭제"
    message="정말로 이 상품을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
    confirmText="삭제"
    cancelText="취소"
    onConfirm={() => (showAlert = false)}
    onCancel={() => (showAlert = false)}
    onClose={() => (showAlert = false)}
  />
{/if}
