<script lang="ts">
  import { page } from '$app/stores'
  import { Avatar } from '@skeletonlabs/skeleton-svelte'
  import { createEventDispatcher } from 'svelte'

  // Props
  export let mobileMenuOpen: boolean = false

  // Event dispatcher
  const dispatch = createEventDispatcher()

  const mainMenuItems = [
    {
      href: '/admin',
      label: '대시보드',
      icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    },
    {
      href: '/admin/coops',
      label: '공동구매 관리',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    },
    {
      href: '/admin/orders',
      label: '주문 관리',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      href: '/admin/purchases',
      label: '발주 관리',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
  ]

  $: currentPath = $page.url.pathname

  function handleMenuClick() {
    dispatch('closeMobile')
  }
</script>

<!-- Admin 사이드바 -->
<aside
  class={`
    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
    w-64 bg-surface-50 flex flex-col
    transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none
  `}
>
  <!-- 브랜드/회사명 영역 -->
  <div class="flex items-center gap-2 px-6 py-4 mt-5">
    <div class="text-2xl">🏪</div>
    <div>
      <h1 class="text-lg font-bold text-gray-900">공동구매 관리자</h1>
      <p class="text-xs text-gray-500">신선마트 강남점</p>
    </div>
  </div>

  <!-- 네비게이션 - 컨텐츠 헤더 구분선 아래 정렬 -->
  <nav class="flex-1 px-4 pt-6">
    <ul class="space-y-1">
      {#each mainMenuItems as item}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
              {currentPath === item.href
              ? 'bg-primary-100 text-primary-900 border border-primary-200'
              : 'text-gray-700 hover:bg-gray-100'}"
            on:click={handleMenuClick}
          >
            <svg
              class="w-4 h-4 {currentPath === item.href
                ? 'text-primary-700'
                : 'text-gray-500 group-hover:text-gray-700'}"
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
  <div class="px-4 py-2 mt-auto">
    <a
      href="/admin/settings"
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
        {currentPath === '/admin/settings'
        ? 'bg-primary-100 text-primary-900 border border-primary-200'
        : 'text-gray-700 hover:bg-gray-100'}"
      on:click={handleMenuClick}
    >
      <svg
        class="w-4 h-4 {currentPath === '/admin/settings'
          ? 'text-primary-700'
          : 'text-gray-500 group-hover:text-gray-700'}"
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
      Settings
    </a>
  </div>

  <!-- 사용자 프로필 -->
  <div class="px-4 py-4 mb-6">
    <div class="flex items-center gap-3">
      <!-- Avatar Component (Skeleton UI Style) -->
      <div class="relative">
        <Avatar src="https://i.pravatar.cc/35" name="skeleton" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">김관리자</p>
        <p class="text-xs text-gray-500 truncate">admin@coops.com</p>
      </div>
      <button
        class="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        title="로그아웃"
        aria-label="로그아웃"
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
</aside>
