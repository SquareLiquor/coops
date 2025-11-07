<script lang="ts">
  import { goto } from '$app/navigation'
  import { setStore } from '$lib/stores'
  import type { StoreData } from '$lib/types'

  let { data } = $props()
  let stores: StoreData[] = $derived(data.stores)
  let selectedStoreId: string = $state('')

  const handleSelectStore = async () => {
    const store = stores.find((s) => s.id === selectedStoreId)

    if (store) {
      setStore(store)
      await goto('/coops')
    }
  }
</script>

{#if stores.length > 0}
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md text-center">
      <h2 class="mb-4 text-2xl font-bold">환영합니다!</h2>
      <p class="mb-6 text-gray-600">매장을 선택해 주세요.</p>
      <div class="mb-6">
        <select class="w-full rounded border p-2" bind:value={selectedStoreId}>
          <option value="" disabled selected>매장 선택</option>
          {#each stores as store}
            <option value={store.id}>{store.name}</option>
          {/each}
        </select>
      </div>
      <button
        class="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300"
        onclick={handleSelectStore}
        disabled={!selectedStoreId}
      >
        선택
      </button>
    </div>
  </div>
{:else}
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md text-center">
      <h2 class="mb-4 text-2xl font-bold">매장 정보가 없습니다.</h2>
      <p class="text-gray-600">관리자에게 문의해 주세요.</p>
    </div>
  </div>
{/if}
