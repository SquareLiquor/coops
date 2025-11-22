<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte'
  import Toast from '$lib/components/ui/Toast.svelte'
  import { setStore } from '$lib/stores'
  import { IdCard, PackageSearch, Store, Truck } from '@lucide/svelte'
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
</script>

<div class="flex h-screen">
  <Sidebar menuItems={hqMenuItems} settingsPath="/hq/settings" />

  <div class="flex-1 overflow-hidden">
    <main>
      <div class="border-surface-400 border-l bg-white md:h-[calc(100vh)] md:overflow-auto">
        {@render children?.()}
        <Toast />
      </div>
    </main>
  </div>
</div>
