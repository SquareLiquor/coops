<script lang="ts">
  import { type OrderData } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import { Check, CircleX, RotateCcw, X } from '@lucide/svelte'
  import dayjs from 'dayjs'

  let { order, onClose }: { order: OrderData; onClose: () => void } = $props()
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <section class="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-xl" role="document">
    <!-- 헤더 -->
    <div class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div class="flex items-center space-x-3">
        <h2 class="text-xl font-semibold text-gray-900">주문 상세정보</h2>
      </div>

      <div class="flex items-center space-x-1">
        {#if order.completable}
          <button
            type="button"
            class="bg-success-500 hover:bg-success-600 focus:ring-success-500 rounded px-3 py-1.5 text-xs font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            onclick={(e) => !confirm('주문 완료 처리 하시겠습니까?') && e.preventDefault()}
          >
            주문 완료
          </button>
        {/if}
        {#if order.cancelable}
          <button
            type="button"
            class="bg-error-600 hover:bg-error-700 focus:ring-error-500 rounded px-3 py-1.5 text-xs font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            onclick={(e) => !confirm('주문 취소 처리 하시겠습니까?') && e.preventDefault()}
          >
            주문 취소
          </button>
        {/if}
        {#if order.restorable}
          <button
            type="button"
            class="bg-warning-600 hover:bg-warning-700 focus:ring-warning-500 rounded px-3 py-1.5 text-xs font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            onclick={(e) => !confirm('주문 복구 처리 하시겠습니까?') && e.preventDefault()}
          >
            주문 복구
          </button>
        {/if}
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

    <div class="p-6">
      <div class="space-y-4">
        <div class="border-surface-200 rounded-lg border bg-white shadow-sm">
          <div class="border-surface-200 border-b border-dashed px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-primary-600 text-xs font-semibold">주문번호:</span>
                  <span class="text-primary-600 font-mono text-xs">{order.id}</span>
                </div>
                <div class="text-surface-600 text-xs">
                  <span class="text-surface-700">{dayjs(order.orderedAt).format('YYYY-MM-DD')}</span>
                  <span class="text-surface-400">{dayjs(order.orderedAt).format('HH:mm:ss')}</span>
                </div>
              </div>
              <span
                class={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-${order.status.color}-800 bg-${order.status.color}-100 `}
              >
                {order.status.label}</span
              >
            </div>
          </div>
          <div class="p-4">
            <div class="space-y-3">
              {#each order.items as item}
                <div
                  class="border-surface-200 flex items-center gap-3 border-b border-dashed pb-4 last:border-b-0 last:pb-0"
                >
                  <img
                    src={item.images.find((image) => image.representative)?.url}
                    alt={item.coop.name}
                    class="h-12 w-12 rounded-lg object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-surface-900 truncate text-sm font-medium">{item.coop.name}</p>
                    <p class="text-surface-600 text-xs">{formatCurrency(item.price)} × {item.quantity}개</p>
                  </div>
                  <div class="text-surface-900 min-w-[80px] text-right text-sm font-semibold">
                    {formatCurrency(item.totalPrice)}
                  </div>
                  <div
                    class="border-surface-100 ml-4 flex w-28 flex-row items-center justify-center gap-1 border-l pl-4"
                  >
                    {#if item.completable}
                      <button
                        class="btn btn-xs bg-success-500 flex h-8 w-8 items-center justify-center rounded-full p-0 text-white"
                        onclick={(e) => !confirm('주문 상품 완료 처리 하시겠습니까?') && e.preventDefault()}
                        title="완료"
                      >
                        <Check class="h-4 w-4" />
                      </button>
                    {/if}
                    {#if item.cancelable}
                      <button
                        class="btn btn-xs bg-error-500 flex h-8 w-8 items-center justify-center rounded-full p-0 text-white"
                        onclick={(e) => !confirm('주문 상품 취소 처리 하시겠습니까?') && e.preventDefault()}
                        title="취소"
                      >
                        <CircleX class="h-4 w-4" />
                      </button>
                    {/if}
                    {#if item.restorable}
                      <button
                        class="btn btn-xs bg-warning-500 flex h-8 w-8 items-center justify-center rounded-full p-0 text-white"
                        onclick={(e) => !confirm('주문 상품 복구 처리 하시겠습니까?') && e.preventDefault()}
                        title="복구"
                      >
                        <RotateCcw class="h-4 w-4" />
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
          <div
            class="border-surface-200 flex items-center justify-between rounded-b-lg border-t border-dashed px-4 py-3"
          >
            <div class="text-surface-600 text-sm">총 {order.items.length}개 상품</div>
            <div class="text-primary-600 text-lg font-bold">{formatCurrency(order.totalPrice)}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
