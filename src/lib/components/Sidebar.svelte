<script lang="ts">
  import { page } from '$app/state'
  import { getAuth } from '$lib/stores'

  let { mobileMenuOpen, menuItems, settingsPath, onCloseMobile } = $props()

  const currentPath = $derived(page.url.pathname)
  const user = $derived(getAuth().user)

  function handleMenuClick() {
    onCloseMobile()
  }
</script>

<!-- Unified Sidebar -->
<aside
  class={`
    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    fixed inset-y-0 left-0 z-40 flex
    w-64 flex-col shadow-lg transition-transform
    duration-200 ease-in-out lg:static lg:translate-x-0 lg:shadow-none
  `}
>
  <!-- 브랜드/회사명 영역 -->
  <div class="mt-5 flex items-center gap-2 px-6 py-4">
    <div class="text-2xl">🏪</div>
    <div>
      <h1 class="text-surface-900 text-lg font-bold">공동구매 관리자</h1>
      <p class="text-surface-500 text-xs">강남점</p>
    </div>
  </div>

  <!-- 네비게이션 -->
  <nav class="flex-1 px-4 pt-6">
    <ul class="space-y-1">
      {#each menuItems as item}
        <li>
          <a
            href={item.href}
            class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              {currentPath === item.href
              ? 'bg-primary-500 text-primary-50 border-primary-200 border'
              : 'text-surface-700 hover:bg-surface-100'}"
            onclick={handleMenuClick}
          >
            <svg
              class="h-4 w-4 {currentPath === item.href
                ? 'text-primary-50'
                : 'text-surface-700 group-hover:text-surface-700'}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Settings 메뉴 -->
  <div class="mt-auto px-4 py-2">
    <a
      href={settingsPath}
      class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
        {currentPath === settingsPath
        ? 'bg-primary-500 text-primary-50 border-primary-200 border'
        : 'text-surface-700 hover:bg-surface-100'}"
      onclick={handleMenuClick}
    >
      <svg
        class="h-4 w-4 {currentPath === settingsPath
          ? 'text-primary-700'
          : 'text-surface-500 group-hover:text-surface-700'}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
      </svg>
      설정
    </a>
  </div>

  <!-- 사용자 프로필 -->
  <form method="POST">
    <div class="mb-6 px-4 py-4">
      <div class="flex items-center gap-3">
        <!-- Avatar Component (Skeleton UI Style) -->
        <!-- <div class="relative">
          <Avatar src={user.ima || 'https://i.pravatar.cc/35'} name="skeleton" />
        </div> -->
        <div class="min-w-0 flex-1">
          <p class="text-surface-900 truncate text-sm font-medium">{user?.user_metadata.name}</p>
          <p class="text-surface-500 truncate text-xs">{user?.email}</p>
        </div>
        <button
          class="text-surface-400 hover:text-surface-600 hover:bg-surface-200 focus:ring-surface-300 inline-flex items-center justify-center rounded-lg p-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          title="로그아웃"
          aria-label="로그아웃"
          type="submit"
          formaction="/auth/signout?redirectTo=/auth/admin"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </form>
</aside>
