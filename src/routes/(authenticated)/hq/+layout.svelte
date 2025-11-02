<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte'
  import { setStore } from '$lib/stores/store/state.svelte'
  import { onMount } from 'svelte'

  let { data, children } = $props()
  let { store } = $derived(data)

  onMount(() => {
    setStore(store)
  })

  // HQ 메뉴 아이템
  const hqMenuItems = [
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
      href: '/hq/stores',
      label: '매장 관리',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      href: '/hq/approvals',
      label: '사용자 관리',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    },
  ]
</script>

<div class="flex h-screen">
  <Sidebar menuItems={hqMenuItems} settingsPath="/hq/settings" />

  <div class="flex-1 overflow-hidden">
    <main>
      <div class="border-surface-400 border-l bg-white md:h-[calc(100vh)] md:overflow-auto">
        {@render children?.()}
      </div>
    </main>
  </div>
</div>
