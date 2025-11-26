<script lang="ts">
  import type { PurchaseEntity } from '$lib/types'
  import { formatCurrency, formatNumberWithCommas } from '$lib/utils'
  import { ChevronDown, ChevronUp, X } from '@lucide/svelte'

  let { purchase, onClose }: { purchase: PurchaseEntity; onClose: () => void } = $props()

  let quantity: number = $state(0)
  let quantityDisplay = $state('')
  let notes = $state('')
  let isOriginInfoOpen = $state(false)
  let isSalesInfoOpen = $state(false)

  const handleQuantityInput = (e: Event) => {
    const input = e.target as HTMLInputElement
    const value = input.value.replace(/,/g, '')
    const numValue = parseInt(value) || 0
    quantity = numValue
    quantityDisplay = numValue > 0 ? formatNumberWithCommas(numValue) : ''
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
      <h2 class="text-xl font-bold text-gray-900">발주 신청</h2>
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
      <div class="space-y-4">
        <!-- 1단: 본사 상품 정보 (Collapsible) -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
            onclick={() => (isOriginInfoOpen = !isOriginInfoOpen)}
          >
            <div class="flex-1">
              <div class="mb-1 text-sm font-semibold text-gray-700">본사 상품 정보</div>
              {#if !isOriginInfoOpen}
                <div class="text-xs text-gray-500">
                  {purchase.originProductName}, 발주단위:
                  <span class="text-primary-600 font-medium">
                    {formatNumberWithCommas(purchase.originProductPurchaseQty)}개 / {purchase.originProductPurchaseUnit}
                  </span>
                </div>
              {/if}
            </div>
            {#if isOriginInfoOpen}
              <ChevronUp class="h-4 w-4 text-gray-500" />
            {:else}
              <ChevronDown class="h-4 w-4 text-gray-500" />
            {/if}
          </button>
          {#if isOriginInfoOpen}
            <div class="border-t border-gray-200 bg-gray-50 px-5 py-4">
              <dl class="space-y-2.5">
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">상품명</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.originProductName}</dd>
                </div>
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">원가</dt>
                  <dd class="text-sm font-medium text-gray-900">{formatCurrency(purchase.originProductPrice)}</dd>
                </div>
                {#if purchase.originProductCapacity}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">개별 용량</dt>
                    <dd class="text-sm text-gray-900">{purchase.originProductCapacity}</dd>
                  </div>
                {/if}
                {#if purchase.originProductSellUnit}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">개별 단위</dt>
                    <dd class="text-sm text-gray-900">{purchase.originProductSellUnit}</dd>
                  </div>
                {/if}
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">발주 단위</dt>
                  <dd class="text-primary-600 text-sm font-semibold">
                    {formatNumberWithCommas(purchase.originProductPurchaseQty)}개 / {purchase.originProductPurchaseUnit}
                  </dd>
                </div>
              </dl>
            </div>
          {/if}
        </div>

        <!-- 2단: 판매 상품 정보 (Collapsible) -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
            onclick={() => (isSalesInfoOpen = !isSalesInfoOpen)}
          >
            <div class="flex-1">
              <div class="mb-1 text-sm font-semibold text-gray-700">판매 상품 정보</div>
              {#if !isSalesInfoOpen}
                <div class="text-xs text-gray-500">
                  {purchase.coopName}, 주문수량:
                  <span class="text-primary-600 font-medium">
                    {formatNumberWithCommas(purchase.orderedQuantity || 0)} / {formatNumberWithCommas(
                      purchase.maxQuantity
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
                  <dt class="text-xs font-medium text-gray-500">판매 상품명</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.coopName}</dd>
                </div>
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">판매 가격</dt>
                  <dd class="text-sm font-medium text-gray-900">{formatCurrency(purchase.salesPrice)}</dd>
                </div>
                {#if purchase.productCapacity}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매 용량</dt>
                    <dd class="text-sm text-gray-900">{purchase.productCapacity}</dd>
                  </div>
                {/if}
                {#if purchase.productSellUnit}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매 단위</dt>
                    <dd class="text-sm text-gray-900">{purchase.productSellUnit}</dd>
                  </div>
                {/if}
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">주문 수량</dt>
                  <dd class="text-primary-600 text-sm font-semibold">
                    {formatNumberWithCommas(purchase.orderedQuantity || 0)} / {formatNumberWithCommas(
                      purchase.maxQuantity
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          {/if}
        </div>

        <!-- 3단: 신청 폼 -->
        <div class="space-y-4 pt-2">
          <!-- 발주 수량 -->
          <div>
            <label for="quantity" class="mb-2 block text-sm font-medium"> 발주 수량 </label>
            <div class="relative">
              <input
                id="quantity"
                type="text"
                value={quantityDisplay}
                oninput={handleQuantityInput}
                class="focus:border-primary-500 focus:ring-primary-500/20 block w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-right text-sm transition-colors focus:ring-2 focus:outline-none"
                placeholder="수량을 입력하세요."
                inputmode="numeric"
              />
              {#if quantity > 0}
                <span
                  class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-gray-400"
                  >{purchase.originProductPurchaseUnit}</span
                >
              {/if}
            </div>
          </div>

          <!-- 발주 요약 -->
          {#if quantity > 0}
            <div class="space-y-2 rounded-lg bg-blue-50 px-4 py-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-600">전체 발주 수량</span>
                <span class="font-medium text-gray-900">
                  {formatNumberWithCommas(quantity)}
                  {purchase.originProductPurchaseUnit} × {formatNumberWithCommas(purchase.originProductPurchaseQty)} 개 =
                  {formatNumberWithCommas(quantity * (purchase.originProductPurchaseQty || 0))} 개
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">발주 예상 금액</span>
                <span class="text-primary-600 text-lg font-bold">
                  {formatCurrency(quantity * purchase.originProductPrice)}
                </span>
              </div>
            </div>
          {/if}

          <!-- 비고 -->
          <div>
            <label for="notes" class="mb-2 block text-sm font-medium text-gray-700">비고</label>
            <textarea
              id="notes"
              bind:value={notes}
              rows="3"
              maxlength="240"
              class="focus:border-primary-500 focus:ring-primary-500/20 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:ring-2 focus:outline-none"
              placeholder="추가 요청사항을 입력하세요..."
            ></textarea>
            <div class="mt-1 text-right text-xs text-gray-400">{notes.length}/240</div>
          </div>

          <!-- 현재 발주 상태 -->
          {#if purchase.purchaseStatus}
            <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-600">현재 발주 상태</span>
                <span
                  class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-${purchase.purchaseStatus.color}-100 text-${purchase.purchaseStatus.color}-800`}
                >
                  {purchase.purchaseStatus.label}
                </span>
              </div>
              {#if purchase.rejectionReason}
                <div class="mt-2 rounded-md bg-red-50 px-3 py-2">
                  <p class="text-xs font-medium text-red-800">거부 사유</p>
                  <p class="mt-0.5 text-xs text-red-700">{purchase.rejectionReason}</p>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- 푸터: 버튼 -->
    <div class="flex items-center justify-between border-t border-gray-200 px-6 py-3">
      <button
        type="button"
        class="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
        onclick={onClose}
      >
        취소
      </button>
      <button
        type="button"
        class="bg-primary-600 hover:bg-primary-700 rounded px-4 py-1.5 text-xs font-medium text-white transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={quantity <= 0}
        onclick={() => {
          // TODO: 발주 신청/수정 API 호출
          console.log('발주 신청:', { quantity, notes })
          onClose()
        }}
      >
        {purchase.purchaseId ? '수정하기' : '신청하기'}
      </button>
    </div>
  </section>
</div>
