<script lang="ts">
  import { page } from '$app/state'
  import { getAuth } from '$lib/stores'
  import { signout } from '$lib/supabase'
  import { Settings } from '@lucide/svelte'

  let { menuItems, settingsPath } = $props()

  const currentPath = $derived(page.url.pathname)
  const user = $derived(getAuth().user)
</script>

<!-- Unified Sidebar -->
<aside
  class={`
    fixed
    inset-y-0 left-0 z-40 flex w-64
    -translate-x-full flex-col shadow-lg transition-transform
    duration-200 ease-in-out lg:static lg:translate-x-0 lg:shadow-none
  `}
>
  <!-- 브랜드/회사명 영역 -->
  <div class="mt-5 flex items-center gap-2 px-6 py-4">
    <div class="text-2xl"></div>
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
            class={[
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              currentPath.startsWith(item.href) && 'bg-primary-500 text-primary-50 border-primary-200 border',
              !currentPath.startsWith(item.href) && 'text-surface-700 hover:bg-surface-100',
            ]}
          >
            {@render item.icon({
              class: `h-2 w-2 ${
                currentPath === item.href ? 'text-primary-50' : 'text-surface-700 group-hover:text-surface-700'
              }`,
            })}
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- Settings 메뉴 -->
  <div class="px-2 py-2">
    <a
      href={settingsPath}
      class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
        {currentPath === settingsPath
        ? 'bg-primary-500 text-primary-50 border-primary-200 border'
        : 'text-surface-700 hover:bg-surface-100'}"
    >
      <Settings
        class="h-4 w-4 {currentPath === settingsPath
          ? 'text-primary-700'
          : 'text-surface-500 group-hover:text-surface-700'}"
      />
      설정
    </a>
  </div>

  <div class="px-2 py-2">
    <div class="flex items-center gap-3">
      <!-- Avatar Component (Skeleton UI Style) -->
      <!-- <div class="relative">
          <Avatar src={user.ima || 'https://i.pravatar.cc/35'} name="skeleton" />
        </div> -->
      <div class="min-w-0 flex-1">
        <p class="text-surface-900 truncate text-sm font-medium">{user?.user_metadata.display_name}</p>
        <p class="text-surface-500 truncate text-xs">{user?.email}</p>
      </div>
      <button
        class="text-surface-400 hover:text-surface-600 hover:bg-surface-200 focus:ring-surface-300 inline-flex items-center justify-center rounded-lg p-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
        title="로그아웃"
        aria-label="로그아웃"
        type="button"
        onclick={signout}
      >
        <Settings class="h-4 w-4" />
      </button>
    </div>
  </div>
</aside>
