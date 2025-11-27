<script lang="ts">
  import { getCart, removeFromCart, updateCartItem } from '$lib/stores'
  import { formatCurrency } from '$lib/utils'
  import { Minus, Plus, X } from '@lucide/svelte'

  let { isCartOpen = $bindable() } = $props()

  let cart = $derived(getCart())
  let { items, itemsCount, totalPrice, totalQuantity } = $derived(cart)
</script>

{#if isCartOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onclick={() => (isCartOpen = false)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Escape' && (isCartOpen = false)}
  >
    <div
      class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 w-full max-w-md space-y-4 rounded-xl border bg-white p-6 shadow-xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && e.stopPropagation()}
    >
      <header class="flex items-center">
        <h3 class="text-surface-900 dark:text-surface-100 text-xl font-bold">장바구니</h3>
      </header>
      <div class="border-surface-200 my-2 border-t border-solid"></div>

      {#if items.length === 0}
        <div class="py-8 text-center">
          <p class="text-surface-500">장바구니가 비어있습니다</p>
        </div>
      {:else}
        <div class="max-h-60 space-y-3 overflow-y-auto">
          {#each items as item}
            <div class="border-surface-200 flex flex-col border-b border-dashed py-3 last:border-b-0">
              <div class="flex items-center justify-between">
                <p class="text-surface-900 truncate text-sm font-medium">{item.name}</p>
                <span class="text-primary-600 text-base font-bold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <div class="flex w-full items-center justify-between">
                  <span class="text-surface-600 flex-shrink-0 text-xs"
                    >{formatCurrency(item.price)} × {item.quantity}개</span
                  >
                  <div class="flex flex-shrink-0 flex-row items-center space-x-2">
                    <button
                      type="button"
                      class="bg-surface-100 hover:bg-surface-200 text-surface-700 flex h-5 w-5 items-center justify-center rounded-full"
                      disabled={item.quantity === 1}
                      onclick={() => updateCartItem(item.coopId, -1)}
                      aria-label="수량 감소"
                    >
                      <Minus class="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      class="bg-primary-500 hover:bg-primary-600 flex h-5 w-5 items-center justify-center rounded-full text-white"
                      onclick={() => updateCartItem(item.coopId, 1)}
                      aria-label="수량 증가"
                    >
                      <Plus class="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      onclick={() => removeFromCart(item.coopId)}
                      aria-label="삭제"
                    >
                      <X class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <footer class="border-surface-200 border-t border-solid bg-white pt-4">
          <div class="flex w-full items-end justify-between">
            <div class="flex flex-row items-center gap-2">
              <span class="text-primary-600 text-base font-bold">{formatCurrency(totalPrice)}</span>
              <span class="text-surface-600 text-xs">총 {itemsCount}개</span>
            </div>
            <button
              type="submit"
              class="bg-primary-600 hover:bg-primary-700 ml-6 rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors"
            >
              주문하기
            </button>
          </div>
        </footer>
      {/if}
    </div>
  </div>
{/if}
