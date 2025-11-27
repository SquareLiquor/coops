<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte'
  import Toast from '$lib/components/ui/Toast.svelte'
  import { setStore } from '$lib/stores'
  import { ChevronLeft, ChevronRight, IdCard, PackageSearch, Store, Truck } from '@lucide/svelte'
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
      label: '발주 관리',
      icon: Truck,
    },
    {
      href: '/hq/stores',
      label: '매장 관리',
      icon: Store,
    },
    {
      href: '/hq/approvals',
      label: '관리자 승인 관리',
      icon: IdCard,
    },
  ]

  let isCollapsed = $state(false)
  let isAutoHidden = $state(false)
</script>

<div class="flex h-screen bg-white">
  <!-- 토글 버튼 (항상 표시) -->
  <button
    type="button"
    onclick={() => (isCollapsed = !isCollapsed)}
    class="fixed top-8 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all hover:bg-gray-50
      {isCollapsed ? '-left-4' : 'left-[240px]'}"
    aria-label={isCollapsed ? '메뉴 열기' : '메뉴 닫기'}
  >
    {#if isCollapsed}
      <ChevronRight class="h-4 w-4 text-gray-700" />
    {:else}
      <ChevronLeft class="h-4 w-4 text-gray-700" />
    {/if}
  </button>

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
