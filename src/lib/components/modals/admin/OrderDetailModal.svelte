<script lang="ts">
  import { buildForm } from '$lib/builders/form.builder'
  import Alert from '$lib/components/ui/Alert.svelte'
  import { OrderUpdateSchema } from '$lib/schemas'
  import { OrderStatus, type OrderEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import { equalsEnum } from '$lib/utils/enum'
  import { Check, RotateCcw, X } from '@lucide/svelte'
  import dayjs from 'dayjs'
  import { getContext } from 'svelte'

  let { form, order, onClose }: { form: any; order: OrderEntity; onClose: () => void } = $props()

  const updateOrder = getContext<(orderId: string) => Promise<void>>('updateOrder')
  let alert: { type: 'success' | 'error'; message: string } | null = $state(null)

  const { enhance, submitting } = buildForm({
    form,
    schema: OrderUpdateSchema,
    resultHandler: {
      handleSuccess: async (result) => {
        await updateOrder(order.id)
        alert = { type: 'success', message: result.data?.form.message || '성공했습니다.' }
      },
      handleFailure: async (result) => {
        await updateOrder(order.id)
        alert = { type: 'error', message: result.data?.form.message || '오류가 발생했습니다.' }
      },
    },
  })
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
      <h2 class="text-xl font-bold text-gray-900">주문 상세</h2>
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
        <div class="rounded-lg border border-gray-200 bg-white">
          <div class="border-b border-gray-200 px-4 py-3">
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
          <div class="px-4 py-3">
            <div class="space-y-3">
              {#each order.items as item}
                <div class="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
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
          <div class="flex items-center justify-between rounded-b-lg border-t border-gray-200 px-4 py-3">
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

{#if alert}
  <Alert
    type={alert.type}
    mode="alert"
    title={alert.type === 'success' ? '성공' : '오류'}
    message={alert.message}
    onClose={() => (alert = null)}
  />
{/if}
