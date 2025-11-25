<script lang="ts">
  import { getCart } from '$lib/stores'
  import { formatCurrency } from '$lib/utils'
  import { ShoppingCart } from '@lucide/svelte'

  let { isCartOpen = $bindable() } = $props()

  let cart = $derived(getCart())
  let { itemsCount, totalPrice } = $derived(cart)
</script>

<footer
  class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl border-t bg-white p-4 shadow-2xl"
>
  <div class="container mx-auto flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="relative">
        <ShoppingCart />

        {#if itemsCount > 0}
          <span
            class="bg-primary-500 absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
          >
            {itemsCount}
          </span>
        {/if}
      </div>
      <span class="text-surface-700 dark:text-surface-300 text-sm font-medium">
        {#if totalPrice > 0}{formatCurrency(totalPrice)}{/if}
      </span>
    </div>

    <button
      class="bg-primary-500 hover:bg-primary-600 rounded-lg px-6 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      onclick={() => (isCartOpen = true)}
      disabled={itemsCount === 0}
    >
      장바구니
    </button>
  </div>
</footer>
