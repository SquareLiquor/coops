<script lang="ts">
  import { goto } from '$app/navigation'
  import CoopFooter from '$lib/components/CoopFooter.svelte'
  import CartModal from '$lib/components/modals/consumer/CartModal.svelte'
  import CoopDetailModal from '$lib/components/modals/consumer/CoopDetailModal.svelte'
  import DatePicker from '$lib/components/ui/DatePicker.svelte'
  import { coopDataConverter } from '$lib/converters'
  import { convertCartDataToOrderInput } from '$lib/schemas'
  import {
    addToCart,
    clearCart,
    getAuth,
    getCart,
    getCartItem,
    getStore,
    hasCartItem,
    updateCartItem,
  } from '$lib/stores'
  import { getCategories } from '$lib/supabase'
  import type { CategoryData, CoopData } from '$lib/types'
  import { formatCurrency, toaster } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onMount, tick } from 'svelte'
  import { superForm } from 'sveltekit-superforms'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { supabase, coopsSelectQuery } = data

  let coops = $state<CoopData[]>([])
  let categories = $state<CategoryData[]>([])
  let filteredCoops = $derived.by(() => {
    return coops.filter((coop) => {
      const matchesDate = dayjs(coop.salesDate).isSame(dayjs(selectedDate), 'day')
      const matchesCategory = selectedCategory ? coop.category.id === selectedCategory : true
      return matchesDate && matchesCategory
    })
  })

  let isCartOpen = $state(false)
  let selectedCoopId = $state<string | null>(null)
  let selectedDate = $state(dayjs().format('YYYY-MM-DD'))
  let selectedCategory: string | undefined = $state(undefined)

  onMount(async () => {
    await tick()
    const store = getStore()

    const [coopsRes, categoriesRes] = await Promise.all([
      supabase.from('coops').select(coopsSelectQuery).eq('store_id', store.id).eq('status', 'ONGOING'),
      getCategories(store.id),
    ])

    coops = coopDataConverter().convertAll(coopsRes.data ?? [])
    categories = categoriesRes.categories

    $cartForm.store_id = store.id
    $cartForm.user_id = getAuth().user!.id
  })

  const {
    form: cartForm,
    enhance,
    submitting,
  } = superForm(data.form, {
    dataType: 'json',
    onSubmit: async () => {
      $cartForm = convertCartDataToOrderInput(getAuth(), getStore(), getCart())
      isCartOpen = false
    },
    onResult: async ({ result, ...results }: { result: ActionResult }) => {
      if (result.type === 'success') {
        toaster.success({
          description: '주문이 성공적으로 생성되었습니다.',
          duration: 5000,
          action: {
            label: '확인',
            onClick: () => {
              clearCart()
              goto('/orders')
            },
          },
        })
      }

      if (result.type === 'failure') {
        toaster.error({
          title: '주문 생성 실패',
          description: '주문 생성에 실패했습니다. 다시 시도해 주세요.',
          duration: 5000,
        })
      }
    },
    invalidateAll: false,
  })

  const handleChangeQuantity = (coop: CoopData, quantity: number) => {
    if (hasCartItem(coop.id)) {
      updateCartItem(coop.id, quantity)
      return
    }

    const {
      name,
      salesPrice: price,
      salesDate: sales_date,
      product: { images },
    } = coop

    addToCart({
      coopId: coop.id,
      productId: coop.product.id,
      name,
      quantity,
      price,
      sales_date,
      image: images.find((image) => image.representative)?.url || '',
    })
  }
</script>

{#if $submitting}
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
    <span class="loader-giant"></span>
  </div>
{/if}

<div class="border-surface-200 from-primary-500/5 border-b bg-gradient-to-b to-white px-4 pt-2 pb-4">
  <div class="container mx-auto">
    <div class="flex items-center space-x-4">
      <div class="w-35 flex-shrink-0">
        <DatePicker bind:selectedDate options={{ useLimit: true }} />
      </div>

      <div class="scrollbar-hide flex flex-1 space-x-2 overflow-x-scroll">
        {#each [{ id: undefined, name: '전체' }, ...categories] as category}
          <button
            class="rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap"
            class:text-white={selectedCategory === category.id}
            class:bg-primary-500={selectedCategory === category.id}
            class:text-surface-700={selectedCategory !== category.id}
            class:border-surface-200={selectedCategory !== category.id}
            class:hover:bg-surface-50={selectedCategory !== category.id}
            class:border={selectedCategory !== category.id}
            class:bg-white={selectedCategory !== category.id}
            onclick={() => (selectedCategory = category.id)}
          >
            {category.name}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<main class="container mx-auto px-4 py-3 pb-20">
  {#if filteredCoops.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <svg class="text-surface-400 mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="text-surface-900 dark:text-surface-100 mb-2 text-lg font-semibold">진행 중인 공동구매가 없습니다</h3>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {#each filteredCoops as coop}
        <div
          class="border-surface-200 overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
          role="button"
          tabindex="0"
          onclick={() => (selectedCoopId = coop.id)}
          onkeydown={() => (selectedCoopId = coop.id)}
        >
          <div class="from-surface-100 to-surface-200 relative aspect-[5/3] bg-gradient-to-br">
            <img
              src={coop.images.find((image) => image.representative)?.url}
              alt={coop.name}
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div class="absolute top-2 left-2">
              <span class="bg-primary-500 rounded-full px-2 py-1 text-sm font-medium text-white">
                {coop.category.name}
              </span>
            </div>
            <div class="absolute right-2 bottom-2 flex flex-col items-end space-y-1">
              <div class="relative rounded-full bg-black/40 p-1 backdrop-blur-sm">
                <svg class="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <path
                    class="text-white/40"
                    d="M18 2.0845
											a 15.9155 15.9155 0 0 1 0 31.831
											a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  />
                  <path
                    class="text-primary-400"
                    d="M18 2.0845
											a 15.9155 15.9155 0 0 1 0 31.831
											a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-dasharray="0, 100"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xs font-bold text-white drop-shadow-md"
                    >{coop.currentQuantity} / {coop.maxQuantity}</span
                  >
                </div>
              </div>
              <div class="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                {#if dayjs().isSame(dayjs(coop.salesDate), 'day')}
                  <!-- {coop.remaining_time}일 남음 -->
                  오늘 마감
                {/if}
              </div>
            </div>
          </div>
          <div class="p-2.5">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-surface-900 line-clamp-1 text-sm font-bold">
                  {coop.name}
                </h3>
                <div class="mt-0.5 flex items-center space-x-1">
                  <span class="text-primary-600 text-sm font-bold">{formatCurrency(coop.salesPrice)}</span>
                </div>
              </div>
              <div
                class="ml-2 flex items-center space-x-1.5"
                role="dialog"
                tabindex="0"
                onclick={(e) => e.stopPropagation()}
                onkeydown={(e) => e.stopPropagation()}
              >
                <button
                  class="bg-surface-100 hover:bg-surface-200 flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-50"
                  disabled={getCartItem(coop.id)?.quantity === 0}
                  onclick={() => handleChangeQuantity(coop, -1)}
                  aria-label="수량 감소"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="text-surface-900 w-8 text-center text-sm font-medium">
                  {getCartItem(coop.id)?.quantity ?? 0}
                </span>
                <button
                  class="bg-primary-500 hover:bg-primary-600 flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                  onclick={() => handleChangeQuantity(coop, 1)}
                  aria-label="수량 증가"
                >
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

<CoopFooter bind:isCartOpen />

<form method="POST" action="?/createOrder" use:enhance>
  <CartModal bind:isCartOpen />
</form>

{#if selectedCoopId}
  <CoopDetailModal bind:selectedCoopId coops={filteredCoops} />
{/if}
