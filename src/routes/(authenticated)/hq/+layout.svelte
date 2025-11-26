<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte'
  import Toast from '$lib/components/ui/Toast.svelte'
  import { setStore } from '$lib/stores'
  import { IdCard, Menu, PackageSearch, Store, Truck } from '@lucide/svelte'
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
      icon: PackageSearch,
    },
    {
      href: '/hq/purchases',
      label: '본사 발주',
      icon: Truck,
    },
    {
      href: '/hq/stores',
      label: '매장 관리',
      icon: Store,
    },
    {
      href: '/hq/approvals',
      label: '사용자 관리',
      icon: IdCard,
    },
  ]

  let isCollapsed = $state(false)
  let isAutoHidden = $state(false)
</script>

<div class="flex h-screen bg-white">
  <!-- 토글 버튼 (모바일/숨겨진 상태에서만 표시) -->
  {#if isAutoHidden || isCollapsed}
    <button
      type="button"
      onclick={() => (isCollapsed = !isCollapsed)}
      class="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50"
      aria-label="메뉴 열기"
    >
      <Menu class="h-5 w-5 text-gray-700" />
    </button>
  {/if}

  <!-- 오버레이 (모바일에서 사이드바 열렸을 때) -->
  {#if isAutoHidden && !isCollapsed}
    <button
      type="button"
      onclick={() => (isCollapsed = true)}
      class="fixed inset-0 z-40 bg-black/20"
      aria-label="메뉴 닫기"
    ></button>
  {/if}

  <div class="flex h-full w-full overflow-hidden">
    <Sidebar menuItems={hqMenuItems} settingsPath="/hq/settings" bind:isCollapsed bind:isAutoHidden />

    <div class="relative flex-1 overflow-hidden transition-all duration-300">
      <main class="h-full overflow-auto rounded-tl-3xl bg-white shadow-xl">
        {@render children?.()}
        <Toast />
      </main>
    </div>
  </div>
</div>
