<script lang="ts">
  import { goto } from '$app/navigation'
  import { getAuth } from '$lib/stores'

  const user = $derived(getAuth().user)
  const store = {
    name: '강남점',
    logo: '🏪',
  }

  let showUserMenu = $state(false)
</script>

<!-- 반응형 헤더 -->
<header
  class="mobile-header bg-primary-500 sticky top-0 z-40 shadow-lg"
  style="box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);"
>
  <div class="px-4 py-2">
    <div class="relative flex items-center">
      <!-- 로고 (왼쪽) -->
      <div class="flex items-center">
        <button
          type="button"
          class="ml-2 cursor-pointer border-none bg-transparent text-xl"
          aria-label="매장 홈으로 이동"
          onclick={() => goto('/coops')}
        >
          {store.logo}
        </button>
      </div>

      <!-- 상점명 (가운데) -->
      <div class="absolute left-1/2 -translate-x-1/2 transform">
        <h1 class="text-base font-bold text-white">{store.name}</h1>
      </div>

      <!-- 사용자 메뉴 (오른쪽) -->
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

          <!-- 드롭다운 메뉴 -->
          {#if showUserMenu}
            <div
              class="absolute top-full right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg"
              style="border-color: #a6adc8;"
            >
              <form method="POST">
                <div class="py-2">
                  <a href="/orders" class="text-surface-700 hover:bg-surface-50 block px-4 py-2 text-sm"> 주문 내역 </a>
                  <a href="/settings" class="text-surface-700 hover:bg-surface-50 block px-4 py-2 text-sm"> 설정 </a>
                  <hr class="my-2" style="border-color: #a6adc8;" />
                  <button
                    class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    type="submit"
                    formaction="/auth/signout?redirectTo=/"
                    onclick={() => localStorage.removeItem('store')}
                  >
                    로그아웃
                  </button>
                </div>
              </form>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</header>
