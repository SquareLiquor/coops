<script lang="ts">
  import DatePicker from '$lib/components/ui/DatePicker.svelte'
  import { ConsumerOrdersFilterSchema as FilterSchema } from '$lib/schemas'
  import { equalsEnum, OrderStatus, type OrderData } from '$lib/types'
  import { formatCurrency, toaster } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onMount, tick } from 'svelte'
  import { superForm } from 'sveltekit-superforms'
  import { valibot } from 'sveltekit-superforms/adapters'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { statuses } = data

  let isRowLoading: string[] = $state([])
  let orders = $state<OrderData[]>([])
  let selectOrderId = $state<string | null>(null)

  onMount(async () => {
    await tick()
    filterSubmit()
  })

  const {
    form: filterForm,
    enhance: filterEnhance,
    submit: filterSubmit,
    submitting: filterSubmitting,
  } = superForm(data.filterForm, {
    validators: valibot(FilterSchema),
    resetForm: false,
    onResult: ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') orders = result.data?.orders || []
      if (result?.type === 'failure') orders = []
    },
  })

  const { form, enhance, submitting } = superForm(data.form, {
    onResult: async ({ result }: { result: ActionResult }) => {
      if (result.type === 'success' || result.type === 'failure') {
        const toast = result.type === 'success' ? toaster.success : toaster.error

        filterSubmit()
        toast({
          description: result.data?.form.message,
          duration: 5000,
        })
      }
    },
  })
</script>

<svelte:head>
  <title>주문내역 - 공동구매</title>
</svelte:head>

{#if $submitting || $filterSubmitting}
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
    <span class="loader-giant"></span>
  </div>
{/if}

<div class="border-surface-200 from-primary-500/5 border-b bg-gradient-to-b to-white px-4 pt-2 pb-4">
  <form method="POST" action="?/fetch" use:filterEnhance>
    <input type="hidden" name="userId" value={$filterForm.userId} />

    <div class="container mx-auto">
      <div class="flex items-center space-x-4">
        <div class="w-35 flex-shrink-0">
          <DatePicker bind:selectedDate={$filterForm.dateAt} />
        </div>

        <div class="scrollbar-hide flex flex-1 space-x-2 overflow-x-scroll">
          <input type="hidden" name="status" bind:value={$filterForm.status} />

          {#each [{ code: undefined, label: '전체' }, ...statuses] as status}
            <button
              class="rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap"
              class:text-white={$filterForm.status === status.code}
              class:bg-primary-500={$filterForm.status === status.code}
              class:text-surface-700={$filterForm.status !== status.code}
              class:border-surface-200={$filterForm.status !== status.code}
              class:hover:bg-surface-50={$filterForm.status !== status.code}
              class:border={$filterForm.status !== status.code}
              class:bg-white={$filterForm.status !== status.code}
              onclick={() => ($filterForm.status = status.code)}
            >
              {status.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </form>
</div>

<main class="container mx-auto px-4 py-4 pb-20">
  {#if orders.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <svg class="text-surface-400 mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="text-surface-900 dark:text-surface-100 mb-2 text-lg font-semibold">주문 내역이 없습니다.</h3>
    </div>
  {:else}
    <div class="space-y-4">
      {#each orders as order (order.id)}
        <form method="POST" use:enhance>
          <input type="hidden" name="orderId" value={order.id} />

          <div
            class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 overflow-hidden rounded-xl border bg-white shadow-sm"
          >
            <div class="border-surface-300 dark:border-surface-600 border-b border-dashed p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="text-left">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-primary-600 flex min-w-0 flex-1 cursor-pointer items-center text-sm font-semibold"
                      >
                        주문번호:
                        <span class="ml-1 max-w-[100px] truncate sm:max-w-none sm:min-w-0 sm:flex-1">
                          {order.id}
                        </span>
                      </span>
                    </div>
                    <div class="text-surface-600 dark:text-surface-400 text-xs">
                      <span class="text-surface-700 text-sm">{dayjs(order.orderedAt).format('YYYY-MM-DD')}</span>
                      <span class="text-surface-400 text-xs">{dayjs(order.orderedAt).format('HH:mm:ss')}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <span
                    class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white bg-${order.status.color}-500`}
                  >
                    {order.status.label}
                  </span>
                  {#if order.cancelable}
                    <button
                      class="rounded-lg border border-red-300 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      formaction="?/cancel"
                    >
                      취소
                    </button>
                  {/if}
                </div>
              </div>
            </div>

            <div class="p-4">
              <div class="space-y-3">
                {#each order.items as item}
                  <div class="flex items-center space-x-3">
                    <img
                      src={item.images.find((image) => image.representative)?.url}
                      alt={item.coop.name}
                      class="h-12 w-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div class="min-w-0 flex-1">
                      <p
                        class="text-surface-900 dark:text-surface-100 truncate text-sm font-medium"
                        class:line-through={equalsEnum(item.status, OrderStatus.CANCELLED)}
                      >
                        {item.coop.name}
                      </p>
                      <p
                        class="text-surface-600 dark:text-surface-400 text-xs"
                        class:line-through={equalsEnum(item.status, OrderStatus.CANCELLED)}
                      >
                        {formatCurrency(item.price)} × {item.quantity}개
                      </p>
                    </div>
                    <div
                      class="text-surface-900 dark:text-surface-100 text-sm font-semibold"
                      class:line-through={equalsEnum(item.status, OrderStatus.CANCELLED)}
                    >
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <div class="border-surface-300 dark:border-surface-600 border-t border-dashed bg-white p-4 dark:bg-white">
              <div class="flex items-center justify-between">
                <div
                  class="text-surface-600 dark:text-surface-400 text-sm"
                  class:line-through={equalsEnum(order.status, OrderStatus.CANCELLED)}
                >
                  총 {order.items.length}개 상품
                </div>
                <div
                  class="text-primary-600 text-lg font-bold"
                  class:line-through={equalsEnum(order.status, OrderStatus.CANCELLED)}
                >
                  {formatCurrency(order.totalPrice)}
                </div>
              </div>
            </div>
          </div>
        </form>
      {/each}
    </div>
  {/if}
</main>
