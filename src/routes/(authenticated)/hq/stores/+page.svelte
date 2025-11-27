<script lang="ts">
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

  const typeOptions = [
    { value: 'all', label: '전체' },
    { value: 'hq', label: '본사' },
    { value: 'branch', label: '가맹점' },
  ]

  // Filter form
  const {
    form: filterForm,
    enhance: filterEnhance,
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

  function getTypeText(type: string) {
    switch (type) {
      case 'hq':
        return '본사'
      case 'branch':
        return '가맹점'
      default:
        return type
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case 'hq':
        return 'bg-primary-100 text-primary-800'
      case 'branch':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function viewStoreDetails(store: StoreEntity) {
    alertConfig = {
      type: 'info',
      mode: 'alert',
      title: '매장 상세 정보',
      message: `매장명: ${store.name}\n주소: ${store.address || '-'}\n상세주소: ${store.addressDetail || '-'}\n전화번호: ${store.phone || '-'}\n등록일: ${store.createdAt ? dayjs(store.createdAt).format('YYYY-MM-DD') : '-'}`,
    }
    showAlert = true
  }
</script>

<svelte:head>
  <title>가맹점 관리 - 본사</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">가맹점 관리</h1>
    <button
      class="bg-primary-600 hover:bg-primary-700 rounded-full px-4 py-2 text-xs font-medium text-white transition-colors"
    >
      새 매장 등록
    </button>
  </div>

  <form method="POST" action="?/fetch" use:filterEnhance>
    <div class="relative">
      <!-- Filter Area -->
      <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2">
          <!-- 검색 필터 -->
          <input
            type="text"
            name="search"
            bind:value={$filterForm.search}
            oninput={() => {
              $filterForm.page = 1
              asyncFilterSubmit()
            }}
            placeholder="매장명, 주소, 전화번호 검색"
            class="focus:border-primary-500 w-64 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
          />
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-200 bg-white">
              <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                #
              </th>
              <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">
                매장 명
              </th>
              <th class="border-r border-gray-200 px-3 py-3 text-left text-sm font-semibold text-gray-900">주소</th>
              <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">상태</th>
              <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">
                등록일
              </th>
              <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">액션</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each stores as store, index}
              <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
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
                <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                  <span
                    class="bg-success-100 text-success-800 inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  >
                    활성
                  </span>
                </td>
                <td class="border-r border-gray-100 px-3 py-2 text-center">
                  <div class="text-xs text-gray-900">
                    {store.createdAt ? dayjs(store.createdAt).format('YYYY-MM-DD') : '-'}
                  </div>
                </td>
                <td class="border-r border-gray-100 px-3 py-2">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onclick={() => viewStoreDetails(store)}
                      class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      상세
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

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
      </div>

      <!-- Pagination -->
      {#if pagination.totalPages > 1}
        <div class="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      {/if}
    </div>
  </form>
</div>

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
