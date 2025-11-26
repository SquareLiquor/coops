<script lang="ts">
  import { page } from '$app/state'
  import { signout } from '$lib/database'
  import { getAuth } from '$lib/stores'

  let { menuItems, settingsPath, isCollapsed = $bindable(false), isAutoHidden = $bindable(false) } = $props()

  const currentPath = $derived(page.url.pathname)
  const user = $derived(getAuth().user)

  // 화면 크기 감지하여 자동으로 숨기기/펼치기
  $effect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)')
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      isAutoHidden = e.matches
      if (e.matches) {
        isCollapsed = true
      } else {
        isCollapsed = false
      }
    }
    handleResize(mediaQuery)
    mediaQuery.addEventListener('change', handleResize)
    return () => mediaQuery.removeEventListener('change', handleResize)
  })
</script>

<!-- Modern Sidebar -->
<aside
  class="flex h-full w-64 flex-col bg-white shadow-lg transition-all duration-300
    {isCollapsed ? '-ml-64' : 'ml-0'}"
>
  <!-- 상점명 영역 -->
  <div class="flex h-20 items-center border-b border-gray-200 px-5 py-4">
    <div>
      <h1 class="text-lg font-bold text-gray-900">강남점</h1>
      <p class="text-xs text-gray-500">공동구매 관리</p>
    </div>
  </div>

  <!-- 메뉴 네비게이션 -->
  <nav class="flex-1 overflow-y-auto px-3 py-6">
    <ul class="space-y-1.5">
      {#each menuItems as item}
        <li>
          <a
            href={item.href}
            class="group relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all
              {currentPath.startsWith(item.href)
              ? 'bg-gray-200 text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'}"
          >
            <span class="transition-transform group-hover:scale-105">{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- 하단: 설정 + 사용자 정보 -->
  <div class="border-t border-gray-200 px-3 py-4">
    <!-- 설정 버튼 -->
    <a
      href={settingsPath}
      class="mb-3 flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all
        {currentPath === settingsPath ? 'bg-gray-200 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
    >
      <span>설정</span>
    </a>

    <!-- 사용자 정보 -->
    <div class="flex items-center gap-3 rounded-2xl bg-gray-50 p-2.5 transition-all hover:bg-gray-100">
      <div
        class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-900"
      >
        {user?.user_metadata.display_name?.charAt(0) || 'U'}
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-gray-900">{user?.user_metadata.display_name}</p>
        <p class="truncate text-xs text-gray-500">{user?.email}</p>
      </div>
      <button
        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none"
        title="로그아웃"
        aria-label="로그아웃"
        type="button"
        onclick={signout}
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  </div>
</aside>
