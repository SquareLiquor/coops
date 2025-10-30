<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte'
  import { onMount } from 'svelte'

  let { children } = $props()

  let mobileMenuOpen = $state(false)

  function closeMobileMenu() {
    mobileMenuOpen = false
  }

  // Admin 메뉴 아이템
  const adminMenuItems = [
    {
      href: '/admin',
      label: '대시보드',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
    },
    {
      href: '/admin/coops',
      label: '판매 상품 관리',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      href: '/admin/orders',
      label: '주문 관리',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    },
    {
      href: '/admin/purchases',
      label: '발주 관리',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6',
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

<div class="flex h-screen">
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

  <Sidebar {mobileMenuOpen} menuItems={adminMenuItems} settingsPath="/admin/settings" onCloseMobile={closeMobileMenu} />

  {#if mobileMenuOpen}
    <div
      class="bg-opacity-75 bg-surface-600 fixed inset-0 z-30 lg:hidden"
      onclick={() => (mobileMenuOpen = false)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          mobileMenuOpen = false
        }
      }}
      role="button"
      tabindex="0"
    ></div>
  {/if}

  <div class="flex-1 overflow-hidden">
    <main>
      <div class="border-surface-300 border-l bg-white md:h-[calc(100vh)] md:overflow-auto">
        {@render children?.()}
      </div>
    </main>
  </div>
</div>
