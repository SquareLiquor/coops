<script lang="ts">
  import { goto } from '$app/navigation'
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import PageHeader from '$lib/components/layout/PageHeader.svelte'
  import EmptyState from '$lib/components/ui/EmptyState.svelte'
  import Loading from '$lib/components/ui/Loading.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { StoresFilterSchema } from '$lib/schemas'
  import type { StoreEntity } from '$lib/types'
  import dayjs from 'dayjs'
  import { onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let stores: StoreEntity[] = $state([])

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
</script>

<div class="min-h-screen bg-gray-100 p-6">
  <PageHeader title="가맹점 관리">
    {#snippet actions()}
      <button
        class="bg-primary-600 hover:bg-primary-700 rounded-full px-4 py-2 text-xs font-medium text-white transition-colors"
        onclick={() => goto('/hq/stores/create')}
      >
        새 매장 등록
      </button>
    {/snippet}
  </PageHeader>

  <div class="relative">
    <Loading show={$filterSubmitting} />

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
                {(pagination.page - 1) * 10 + index + 1}
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

      <EmptyState show={stores.length === 0} title="등록된 매장이 없습니다" />
    </div>

    <Pagination {pagination} onPageChange={(page) => ($filterForm.page = page)} />
  </div>
</div>

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
