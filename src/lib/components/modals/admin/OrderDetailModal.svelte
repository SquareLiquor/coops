<script lang="ts">
  import { equalsEnum, OrderStatus, type OrderData } from '$lib/types'
  import { formatCurrency, toaster } from '$lib/utils'
  import { Check, RotateCcw, X } from '@lucide/svelte'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { getContext } from 'svelte'
  import { superForm } from 'sveltekit-superforms'

  let { form, order, onClose }: { form: any; order: OrderData; onClose: () => void } = $props()

  const updateOrder = getContext<(orderId: string) => Promise<void>>('updateOrder')

  const { enhance, submitting } = superForm(form, {
    onResult: async ({ result }: { result: ActionResult }) => {
      if (result.type === 'success' || result.type === 'failure') {
        const toast = result.type === 'success' ? toaster.success : toaster.error

        await updateOrder(order.id)
        toast({
          description: result.data?.form.message,
          duration: 5000,
        })
      }
    },
  })
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
    <div class="flex items-center border-b border-gray-200 bg-white px-6 py-4">
      <h2 class="text-xl font-semibold text-gray-900">주문 상세정보</h2>
      <button
        type="button"
        class="ml-auto flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        onclick={onClose}
        aria-label="닫기"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <div class="p-6">
      <div class="space-y-4">
        <div class="border-surface-200 rounded-lg border bg-white shadow-sm">
          <div class="border-surface-200 border-b border-dashed px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-primary-600 text-sm font-bold">주문번호:</span>
                  <span class="text-primary-600 text-sm font-bold">{order.id}</span>
                </div>
                <div class="text-surface-600 text-xs">
                  <span class="text-surface-900 font-semibold">[{order.store.name}] </span>
                  <span class="text-surface-600">{dayjs(order.createdAt).format('YYYY-MM-DD')}</span>
                  <span class="text-surface-300">{dayjs(order.createdAt).format('HH:mm:ss')}</span>
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
                  <div
                    class={[
                      'flex flex-1 items-center gap-3',
                      equalsEnum(OrderStatus.CANCELLED, item.status) && 'line-through opacity-50',
                    ]}
                  >
                    <img
                      src={item.images.find((image) => image.representative)?.url}
                      alt={item.coop.name}
                      class="h-12 w-12 rounded-lg object-cover"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="text-surface-900 truncate text-sm font-medium">
                        {item.coop.name}
                      </p>
                      <p class="text-surface-600 text-xs">
                        {formatCurrency(item.price)} × {item.quantity}개
                      </p>
                    </div>
                    <div class="text-surface-900 min-w-[90px] text-right text-sm font-semibold">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>

                  <form method="POST" use:enhance>
                    <input type="hidden" name="orderItemId" value={item.id} />
                    <div
                      class={[
                        'border-surface-100 ml-1 flex w-20 flex-row items-center justify-center gap-1 border-l pl-1 ',
                        equalsEnum(OrderStatus.CANCELLED, item.status) && 'line-through opacity-50',
                      ]}
                    >
                      {#if item.completableForAdmin}
                        <button
                          class="btn btn-xs bg-success-500 flex h-6 w-6 items-center justify-center rounded-full p-0 text-white"
                          formaction="?/confirmItem"
                          onclick={(e) => !confirm('이 상품을 주문 완료 처리하시겠습니까?') && e.preventDefault()}
                          title="확인"
                        >
                          <Check class="h-4 w-4" />
                        </button>
                      {/if}
                      {#if item.cancelableForAdmin}
                        <button
                          class="btn btn-xs bg-error-500 flex h-6 w-6 items-center justify-center rounded-full p-0 text-white"
                          formaction="?/cancelItem"
                          onclick={(e) => !confirm('이 상품을 주문 취소 처리하시겠습니까?') && e.preventDefault()}
                          title="취소"
                        >
                          <X class="h-4 w-4" />
                        </button>
                      {/if}
                      {#if item.restorableForAdmin}
                        <button
                          class="btn btn-xs bg-warning-500 flex h-6 w-6 items-center justify-center rounded-full p-0 text-white"
                          formaction="?/restoreItem"
                          onclick={(e) => !confirm('이 상품을 주문 복구 처리하시겠습니까?') && e.preventDefault()}
                          title="복구"
                        >
                          <RotateCcw class="h-4 w-4" />
                        </button>
                      {/if}
                    </div>
                  </form>
                </div>
              {/each}
            </div>
          </div>
          <div
            class="border-surface-200 flex items-center justify-between rounded-b-lg border-t border-dashed px-4 py-3"
          >
            <div
              class={[
                'text-surface-600 text-sm',
                equalsEnum(OrderStatus.CANCELLED, order.status) && 'line-through opacity-50',
              ]}
            >
              총 {order.items.length}개 상품
            </div>
            <div
              class={[
                'flex items-center gap-2',
                equalsEnum(OrderStatus.CANCELLED, order.status) && 'line-through opacity-50',
              ]}
            >
              <div class="text-primary-600 min-w-[90px] text-right text-lg font-bold">
                {formatCurrency(order.totalPrice)}
              </div>
              <form method="POST" use:enhance>
                <input type="hidden" name="orderId" value={order.id} />

                <div class="border-surface-100 ml-1 flex w-20 flex-row items-center justify-center gap-1 border-l pl-1">
                  {#if order.completableForAdmin}
                    <button
                      class="btn btn-xs bg-success-500 flex h-8 w-8 items-center justify-center rounded-full p-0 text-white"
                      formaction="?/confirm"
                      onclick={(e) => !confirm('주문 완료 처리 하시겠습니까?') && e.preventDefault()}
                      title="주문 확인"
                    >
                      <Check class="h-4 w-4" />
                    </button>
                  {/if}
                  {#if order.cancelableForAdmin}
                    <button
                      class="btn btn-xs bg-error-500 flex h-8 w-8 items-center justify-center rounded-full p-0 text-white"
                      formaction="?/cancel"
                      onclick={(e) => !confirm('주문 취소 처리 하시겠습니까?') && e.preventDefault()}
                      title="주문 취소"
                    >
                      <X class="h-4 w-4" />
                    </button>
                  {/if}
                  {#if order.restorableForAdmin}
                    <button
                      class="btn btn-xs bg-warning-500 flex h-8 w-8 items-center justify-center rounded-full p-0 text-white"
                      formaction="?/restore"
                      onclick={(e) => !confirm('주문 복구 처리 하시겠습니까?') && e.preventDefault()}
                      title="주문 복구"
                    >
                      <RotateCcw class="h-4 w-4" />
                    </button>
                  {/if}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
