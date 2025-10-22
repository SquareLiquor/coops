<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte'
  import { onMount } from 'svelte'

  let { children } = $props()
  let mobileMenuOpen = $state(false)

  function closeMobileMenu() {
    mobileMenuOpen = false
  }

  // HQ 메뉴 아이템
  const hqMenuItems = [
    {
      href: '/hq',
      label: '대시보드',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
    },
    {
      href: '/hq/stores',
      label: '매장 관리',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      href: '/hq/products',
      label: '상품 관리',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6',
    },
    {
      href: '/hq/purchases',
      label: '본사 발주',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    },
    {
      href: '/hq/users',
      label: '사용자 관리',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    },
  ]

  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        mobileMenuOpen = false
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })
</script>

<!-- <div class="flex min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50"></div> -->
<div class="flex h-screen">
  <!-- Mobile menu button -->
  <button
    class="border-surface-200 fixed top-4 left-4 z-50 rounded-md border bg-white p-2 shadow-sm lg:hidden"
    onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
    aria-label="메뉴 토글"
  >
    <svg class="text-surface-600 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
      />
    </svg>
  </button>

  <!-- Unified Sidebar Component -->
  <Sidebar {mobileMenuOpen} menuItems={hqMenuItems} settingsPath="/hq/settings" on:closeMobile={closeMobileMenu} />

  <!-- Overlay for mobile -->
  {#if mobileMenuOpen}
    <button
      type="button"
      class="bg-opacity-75 bg-surface-600 fixed inset-0 z-30 lg:hidden"
      onclick={() => (mobileMenuOpen = false)}
      aria-label="모바일 메뉴 닫기"
    ></button>
  {/if}

  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Main content area -->
    <main class="flex-1 p-6">
      <div class="border-surface-100 rounded-lg border bg-white shadow-sm md:h-[calc(100vh-3rem)] md:overflow-auto">
        {@render children?.()}
      </div>
    </main>
  </div>
</div>
