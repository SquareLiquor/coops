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
      href: '/hq',
      label: '대시보드',
      icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    },
    {
      href: '/hq/users',
      label: '관리자 승인',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
    },
    {
      href: '/hq/stores',
      label: '가맹점 관리',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      href: '/hq/products',
      label: '상품 관리',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      href: '/hq/purchases',
      label: '발주 관리',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      href: '/hq/settings',
      label: '설정',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    },
  ]

  $: currentPath = $page.url.pathname

  function handleMenuClick() {
    dispatch('closeMobile')
  }
</script>

<!-- HQ 사이드바 -->
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
    <div class="text-2xl">🏢</div>
    <div>
      <h1 class="text-lg font-bold text-gray-900">협업농산 본사</h1>
      <p class="text-xs text-gray-500">HQ Management</p>
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
      href="/hq/settings"
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
        {currentPath === '/hq/settings'
        ? 'bg-primary-100 text-primary-900 border border-primary-200'
        : 'text-gray-700 hover:bg-gray-100'}"
      on:click={handleMenuClick}
    >
      <svg
        class="w-4 h-4 {currentPath === '/hq/settings'
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
      설정
    </a>

    <!-- 프로필 섹션 -->
    <div class="mt-4 p-3 bg-gray-100 rounded-lg">
      <div class="flex items-center gap-3">
        <Avatar
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
          background="bg-primary-500"
          rounded="rounded-full"
          name="본사관리자"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">본사 관리자</p>
          <p class="text-xs text-gray-500 truncate">admin@hq.coops.co.kr</p>
        </div>
      </div>
    </div>
  </div>
</aside>
