<script lang="ts">
  import type { PurchaseEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import { X } from '@lucide/svelte'

  let { purchase, onClose }: { purchase: PurchaseEntity; onClose: () => void } = $props()

  let quantity = $state(purchase.purchaseQuantity || 0)
  let notes = $state('')
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <section class="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl" role="document">
    <!-- 헤더 -->
    <div class="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-4">
      <h2 class="text-xl font-semibold text-gray-900">발주 신청</h2>
      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={quantity <= 0}
          onclick={() => {
            // TODO: 발주 신청/수정 API 호출
            console.log('발주 신청:', { quantity, notes })
            onClose()
          }}
        >
          {purchase.purchaseId ? '수정' : '신청'}
        </button>
        <button
          type="button"
          class="ml-auto flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
          onclick={onClose}
          aria-label="닫기"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- 스크롤 가능한 본문 -->
    <div class="max-h-[calc(90vh-80px)] overflow-y-auto">
      <div class="p-6">
        <div class="space-y-6">
          <!-- 본사 상품 정보 + 공동구매 정보 (좌우 배치) -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 본사 상품 정보 -->
            <div class="rounded-lg border border-gray-200 bg-white p-5">
              <h3 class="mb-4 text-base font-semibold text-gray-900">본사 상품 정보</h3>
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">상품명</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.originProductName}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">단위</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.originProductUnit}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">단가</dt>
                  <dd class="text-primary-600 text-sm font-semibold">{formatCurrency(purchase.originProductPrice)}</dd>
                </div>
              </dl>
            </div>

            <!-- 공동구매 정보 -->
            <div class="rounded-lg border border-gray-200 bg-white p-5">
              <h3 class="mb-4 text-base font-semibold text-gray-900">공동구매 정보</h3>
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">공구명</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.coopName}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">판매 가격</dt>
                  <dd class="text-sm font-medium text-gray-900">{formatCurrency(purchase.salesPrice)}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">주문 수량</dt>
                  <dd class="text-primary-600 text-sm font-semibold">{purchase.orderedQuantity}개</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-gray-500">상태</dt>
                  <dd>
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-${purchase.coopStatus.color}-800 bg-${purchase.coopStatus.color}-100`}
                    >
                      {purchase.coopStatus.label}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- 발주 신청 정보 -->
          <div class="rounded-lg border border-gray-200 bg-white p-5">
            <h3 class="mb-4 text-base font-semibold text-gray-900">발주 신청 정보</h3>
            <div class="space-y-5">
              <div>
                <label for="quantity" class="mb-2 block text-sm font-medium text-gray-700">
                  발주 수량 <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-3">
                  <input
                    id="quantity"
                    type="number"
                    bind:value={quantity}
                    min="1"
                    class="focus:border-primary-500 focus:ring-primary-500/20 block w-32 rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-colors focus:ring-2 focus:outline-none"
                    placeholder="수량"
                  />
                  <span class="text-sm font-medium whitespace-nowrap text-gray-600">{purchase.originProductUnit}</span>
                </div>
                <p class="mt-1.5 text-xs text-gray-500">
                  주문량 <span class="text-primary-600 font-medium">{purchase.orderedQuantity}개</span> 기준으로 발주 수량을
                  입력해주세요
                </p>
              </div>

              {#if quantity > 0}
                <div class="bg-primary-50 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">발주 예상 금액</span>
                    <span class="text-primary-600 text-xl font-bold">
                      {formatCurrency(quantity * purchase.originProductPrice)}
                    </span>
                  </div>
                </div>
              {/if}

              <div>
                <label for="notes" class="mb-2 block text-sm font-medium text-gray-700">비고</label>
                <textarea
                  id="notes"
                  bind:value={notes}
                  rows="3"
                  class="focus:border-primary-500 focus:ring-primary-500/20 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-colors focus:ring-2 focus:outline-none"
                  placeholder="추가 요청사항이 있으면 입력해주세요"
                ></textarea>
              </div>

              {#if purchase.purchaseStatus}
                <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">현재 발주 상태</span>
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-${purchase.purchaseStatus.color}-800 bg-${purchase.purchaseStatus.color}-100`}
                    >
                      {purchase.purchaseStatus.label}
                    </span>
                  </div>
                  {#if purchase.rejectionReason}
                    <div class="mt-3 rounded-md bg-red-50 p-3">
                      <p class="text-sm font-medium text-red-800">거부 사유</p>
                      <p class="mt-1 text-sm text-red-600">{purchase.rejectionReason}</p>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
