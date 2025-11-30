<script lang="ts">
  import { goto } from '$app/navigation'
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import Alert from '$lib/components/ui/Alert.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { StoresFilterSchema } from '$lib/schemas'
  import type { StoreEntity } from '$lib/types'
  import dayjs from 'dayjs'
  import { onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let stores: StoreEntity[] = $state([])

  // Alert 상태
  let showAlert = $state(false)
  let alertConfig = $state({
    type: 'info' as 'info' | 'error' | 'warning' | 'success',
    mode: 'alert' as 'alert' | 'confirm',
    title: '',
    message: '',
  })

  onMount(async () => {
    await tick()
    await asyncFilterSubmit()
  })

  const {
    form: filterForm,
    enhance: filterEnhance,
    submitting: filterSubmitting,
    asyncSubmit: asyncFilterSubmit,
    pagination,
  } = buildFilterForm<typeof StoresFilterSchema>({
    form: data.filterForm,
    schema: StoresFilterSchema,
    resultHandler: {
      handleSuccess: (result) => (stores = result.data?.stores || []),
      handleFailure: () => (stores = []),
    },
  })

  const handlePageChange = (page: number) => {
    $filterForm.page = page
    asyncFilterSubmit()
  }
</script>

<svelte:head>
  <title>가맹점 관리</title>
</svelte:head>

{@render alert()}
{@render loading()}

<div class="min-h-screen bg-gray-100 p-6">
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">가맹점 관리</h1>
    <button
      class="bg-primary-600 hover:bg-primary-700 rounded-full px-4 py-2 text-xs font-medium text-white transition-colors"
      onclick={() => goto('/hq/stores/create')}
    >
      새 매장 등록
    </button>
  </div>

  <div class="relative">
    {@render filter()}

    <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-white">
            <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">#</th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">매장 명</th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">주소</th>
            <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">전화번호</th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">상태</th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">등록일</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each stores as store, index}
            <tr
              class="border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50"
              onclick={() => goto(`/hq/stores/${store.id}`)}
            >
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {(pagination.currentPage - 1) * 10 + index + 1}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="flex items-center gap-2">
                  <div>
                    <div class="text-xs font-medium text-gray-900">{store.name}</div>
                    <div class="text-xs text-gray-500">{store.id}</div>
                  </div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="text-xs text-gray-900">{store.address || '-'}</div>
                <div class="text-xs text-gray-500">{store.addressDetail || ''}</div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-left">
                <div class="text-xs text-gray-900">{store.phone || '-'}</div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span
                  class={[
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                    store.active ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-500',
                  ]}
                >
                  {store.active ? '활성' : '비활성'}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center">
                <div class="text-xs text-gray-900">
                  {store.createdAt ? dayjs(store.createdAt).format('YYYY-MM-DD') : '-'}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {@render emptyList()}
    </div>

    {@render paging(pagination)}
  </div>
</div>

<!-- Snipperts -->
{#snippet loading()}
  {#if $filterSubmitting}
    <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
      <span class="loader-giant"></span>
    </div>
  {/if}
{/snippet}

{#snippet filter()}
  <form method="POST" action="?/fetch" use:filterEnhance>
    <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-2">
        <input
          type="text"
          name="search"
          bind:value={$filterForm.storeName}
          placeholder="매장명 검색"
          class="focus:border-primary-500 w-64 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
        />
      </div>
    </div>
  </form>
{/snippet}

{#snippet emptyList()}
  {#if stores.length === 0}
    <div class="py-12 text-center">
      <div class="flex flex-col items-center justify-center">
        <svg class="mb-2 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">등록된 매장이 없습니다</h3>
      </div>
    </div>
  {/if}
{/snippet}

{#snippet paging({ currentPage, totalPages }: { currentPage: number; totalPages: number })}
  {#if totalPages > 1}
    <div class="mt-4">
      <Pagination {currentPage} {totalPages} onPageChange={handlePageChange} />
    </div>
  {/if}
{/snippet}

{#snippet alert()}
  {#if showAlert}
    <Alert
      type={alertConfig.type}
      mode={alertConfig.mode}
      title={alertConfig.title}
      message={alertConfig.message}
      onClose={() => (showAlert = false)}
      onConfirm={() => (showAlert = false)}
    />
  {/if}
{/snippet}
