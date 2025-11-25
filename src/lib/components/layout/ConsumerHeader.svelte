<script lang="ts">
  import { goto } from '$app/navigation'
  import { signout } from '$lib/database'
  import { getAuth, getStore } from '$lib/stores'
  import { House } from '@lucide/svelte'

  const user = $derived(getAuth().user)
  const store = $derived(getStore())

  let showUserMenu = $state(false)
  let userMenuRef = $state<HTMLDivElement | null>(null)

  // 외부 클릭 시 닫힘 처리
  $effect(() => {
    if (!showUserMenu) return
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef && !userMenuRef.contains(e.target as Node)) {
        showUserMenu = false
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  })
</script>

{#if store}
  <header
    class="mobile-header bg-primary-500 sticky top-0 z-40 shadow-lg"
    style="box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);"
  >
    <div class="px-4 py-2">
      <div class="relative flex items-center">
        <House class="text-white" size={20} onclick={() => goto('/coops')} />
        <!-- <div class="flex items-center">
        <button
          type="button"
          class="ml-2 cursor-pointer border-none bg-transparent text-xl"
          aria-label="매장 홈으로 이동"
          onclick={() => goto('/coops')}
        >
          {store.logo}
        </button>
      </div> -->

        <div class="absolute left-1/2 -translate-x-1/2 transform">
          <h1 class="text-base font-bold text-white">{store.name}</h1>
        </div>

        <div class="relative ml-auto">
          {#if user}
            <button
              class="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white transition-colors hover:bg-white/10"
              onclick={() => (showUserMenu = !showUserMenu)}
            >
              <span class="text-xs text-white">{user.user_metadata?.name || user.email}님</span>
              <svg
                class="h-3 w-3 text-white transition-transform {showUserMenu ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {#if showUserMenu}
              <div
                bind:this={userMenuRef}
                class="absolute top-full right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg"
                style="border-color: #a6adc8;"
              >
                <div class="py-2">
                  <button
                    type="button"
                    class="text-surface-700 hover:bg-surface-50 block w-full px-4 py-2 text-left text-sm"
                    onclick={() => {
                      showUserMenu = false
                      goto('/orders')
                    }}
                  >
                    주문 내역
                  </button>
                  <!-- <button
                      type="button"
                      class="text-surface-700 hover:bg-surface-50 block w-full px-4 py-2 text-left text-sm"
                      onclick={() => {
                        showUserMenu = false
                        goto('/settings')
                      }}
                    >
                      설정
                    </button> -->
                  <hr class="my-2" style="border-color: #a6adc8;" />
                  <button
                    class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    type="button"
                    onclick={signout}
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  </header>
{/if}
