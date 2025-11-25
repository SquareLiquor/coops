<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte'
  import Toast from '$lib/components/ui/Toast.svelte'
  import { setStore } from '$lib/stores'
  import { PackageSearch, ShoppingBag, Truck } from '@lucide/svelte'
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
      icon: PackageSearch,
    },
    {
      href: '/admin/orders',
      label: '주문 관리',
      icon: ShoppingBag,
    },
    {
      href: '/admin/purchases',
      label: '발주 관리',
      icon: Truck,
    },
  ]
</script>

<div class="flex h-screen">
  <Sidebar menuItems={adminMenuItems} settingsPath="/admin/settings" />

  <div class="flex-1 overflow-hidden">
    <main>
      <div class="border-surface-400 border-l bg-white md:h-[calc(100vh)] md:overflow-auto">
        {@render children?.()}
        <Toast />
      </div>
    </main>
  </div>
</div>
