<script lang="ts">
  export let store = {
    name: '강남점',
    logo: '🏪',
  }

  export let user = {
    name: '김고객',
    avatar: '👤',
  }

  let showUserMenu = false

  function toggleUserMenu() {
    showUserMenu = !showUserMenu
  }
</script>

<!-- 반응형 헤더 -->
<header
  class="mobile-header sticky top-0 z-40 bg-primary-500 shadow-lg"
  style="box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);"
>
  <div class="px-4 py-2">
    <div class="relative flex items-center">
      <!-- 로고 (왼쪽) -->
      <div class="flex items-center">
        <div class="ml-2 text-xl">{store.logo}</div>
      </div>

      <!-- 상점명 (가운데) -->
      <div class="absolute left-1/2 -translate-x-1/2 transform">
        <h1 class="text-base font-bold text-white">{store.name}</h1>
      </div>

      <!-- 사용자 메뉴 (오른쪽) -->
      <div class="relative ml-auto">
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white transition-colors hover:bg-white/10"
          onclick={toggleUserMenu}
        >
          <span class="text-xs text-white">{user.name}님</span>
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
            <div class="py-2">
              <a href="/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"> 주문 내역 </a>
              <a href="/setting" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"> 설정 </a>
              <hr class="my-2" style="border-color: #a6adc8;" />
              <button class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"> 로그아웃 </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>
