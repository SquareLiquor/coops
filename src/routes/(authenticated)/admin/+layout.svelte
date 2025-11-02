<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte'
  import { setStore } from '$lib/stores/store/state.svelte.js'
  import { onMount } from 'svelte'

  let { data, children } = $props()
  let { store } = $derived(data)

  onMount(() => {
    setStore(store)
  })

  // Admin 메뉴 아이템
  const adminMenuItems = [
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
</script>

<div class="flex h-screen">
  <Sidebar menuItems={adminMenuItems} settingsPath="/admin/settings" />

  <div class="flex-1 overflow-hidden">
    <main>
      <div class="border-surface-400 border-l bg-white md:h-[calc(100vh)] md:overflow-auto">
        {@render children?.()}
      </div>
    </main>
  </div>
</div>
