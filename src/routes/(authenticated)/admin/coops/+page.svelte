<script lang="ts">
  import CoopDetailModal from '$lib/components/modals/admin/CoopDetailModal.svelte'
  import { CoopsFilterSchema as FilterSchema } from '$lib/schemas'
  import type { CoopData } from '$lib/types'
  import { debounce, formatCurrency } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, tick } from 'svelte'
  import { superForm } from 'sveltekit-superforms'
  import { valibot } from 'sveltekit-superforms/adapters'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { categories, salesStatuses } = data
  let coops: CoopData[] = $state([])
  let selectedCoopId: string | null = $state(null)
  let debouncedFilterSubmit: ReturnType<typeof debounce>

  onMount(async () => {
    await tick()

    debouncedFilterSubmit = debounce(async () => {
      const result = await validateFilterForm({ update: true })
      if (result.valid) filterSubmit()
    }, 300)

    filterSubmit()
  })

  onDestroy(() => debouncedFilterSubmit?.cancel?.())

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    validateForm: validateFilterForm,
    enhance: filterEnhance,
    submit: filterSubmit,
    submitting: filterSubmitting,
  } = superForm(data.filterForm, {
    validators: valibot(FilterSchema),
    resetForm: false,
    onChange: async ({ target }) => {
      try {
        if ((target as HTMLInputElement)?.type === 'text') {
          debouncedFilterSubmit()
        } else {
          const result = await validateFilterForm({ update: true })
          if (result.valid) filterSubmit()
        }
      } catch (e) {
        console.error('validate form error:', e)
      }
    },
    onResult: ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') {
        coops = result.data?.coops || []
      }
      if (result?.type === 'failure') {
        coops = []
      }
    },
  })

  // 진행률 색상 클래스 반환 함수
  function getProgressColor(coop: { currentQuantity: number; maxQuantity: number }) {
    const percent = Math.round((coop.currentQuantity / coop.maxQuantity) * 100)
    if (percent >= 90) return 'bg-primary-500'
    if (percent >= 70) return 'bg-primary-400'
    if (percent >= 50) return 'bg-primary-300'
    if (percent >= 30) return 'bg-primary-200'
    if (percent >= 10) return 'bg-primary-100'
    return 'bg-primary-50'
  }
</script>

<svelte:head>
  <title>공구 관리 - 관리자</title>
</svelte:head>

<!-- Header -->
<div class="border-surface-200 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">판매 상품 관리</h1>
  </div>
  <a
    href="/admin/coops/create"
    class="btn bg-primary-500 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >새 상품 등록</a
  >
</div>
<div class="relative p-6">
  <form method="POST" action="?/fetch" use:filterEnhance class="mb-6 flex items-center justify-between">
    <input type="hidden" name="storeId" bind:value={$filterForm.storeId} />

    <div class="flex flex-col">
      <div class="flex items-center gap-4">
        <!-- 날짜 필터 -->
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <input
              type="date"
              name="dateFrom"
              bind:value={$filterForm.dateFrom}
              class={[
                'focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none',
                $filterForm.dateFrom && 'border-primary-500 text-primary-700',
                !$filterForm.dateFrom && 'border-surface-100',
              ]}
              {...$filterConstraints.dateFrom}
            />
            <span class="text-surface-400">~</span>
            <input
              type="date"
              name="dateTo"
              bind:value={$filterForm.dateTo}
              class={[
                'focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none',
                $filterForm.dateTo && 'border-primary-500 text-primary-700',
                !$filterForm.dateTo && 'border-surface-100',
              ]}
              {...$filterConstraints.dateTo}
            />
          </div>
        </div>

        <!-- 카테고리 필터 -->
        <select
          class="border-surface-100 focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
          name="categoryId"
          bind:value={$filterForm.categoryId}
        >
          <option value={undefined} selected>전체</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>

        <!-- 상품명 검색 -->
        <input
          type="text"
          name="name"
          bind:value={$filterForm.name}
          placeholder="상품명 검색"
          class={[
            'focus:border-primary-500 w-40 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none',
            $filterForm.name && 'border-primary-500 text-primary-700',
            !$filterForm.name && 'border-surface-100',
          ]}
        />
      </div>

      {#if $filterErrors.dateFrom || $filterErrors.dateTo}
        <div class="mt-1 flex flex-col gap-1">
          {#if $filterErrors.dateFrom}
            <div class="text-error-500 text-sm">{$filterErrors.dateFrom}</div>
          {/if}
          {#if $filterErrors.dateTo}
            <div class="text-error-500 text-sm">{$filterErrors.dateTo}</div>
          {/if}
        </div>
      {/if}
    </div>
    <!-- 우측 상태 필터 영역 -->
    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      <input type="hidden" name="status" bind:value={$filterForm.status} />
      {#each salesStatuses as option}
        <button
          type="button"
          class={[
            'rounded px-3 py-1.5 text-sm font-medium transition-colors',
            $filterForm.status === option.code && 'bg-primary-500 text-white shadow-sm',
            $filterForm.status !== option.code && 'text-surface-600 hover:bg-surface-100',
          ]}
          onclick={() => ($filterForm.status = option.code)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </form>

  <div class="border-surface-100 bg-surface-50/50 relative overflow-hidden rounded-lg border">
    {#if $filterSubmitting}
      <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
        <span class="loader-giant"></span>
      </div>
    {/if}

    <table class="min-w-full">
      <thead class="bg-surface-50/50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-3 text-center">
            <span class="text-surface-500 text-xs font-medium">#</span>
          </th>
          <th class="text-surface-500 w-[10%] px-4 text-center font-bold">판매 상태</th>
          <th class="text-surface-500 w-[10%] px-4 text-center font-bold">카테고리</th>
          <th class="text-surface-500 w-[25%] px-4 text-center font-bold">상품명</th>
          <th class="text-surface-500 w-[15%] px-4 text-center font-bold">가격</th>
          <th class="text-surface-500 w-[15%] px-4 text-center font-bold">판매일</th>
          <th class="text-surface-500 w-[15%] px-4 text-center font-bold">진행률</th>
        </tr>
      </thead>
      <tbody class="divide-surface-100 divide-y bg-white">
        {#each coops as coop, index}
          <tr class="hover:bg-surface-50 text-center">
            <td class="text-surface-500 py-4 text-sm">
              {index + 1}
            </td>
            <td class="text-surface-500 px-6 py-4 text-sm">
              <span
                class={`inline-flex rounded-full px-2 py-1 text-xs font-medium text-white bg-${coop.status.color}-500`}
              >
                {coop.status?.label}
              </span>
            </td>
            <td>{coop.category?.name}</td>
            <td>
              <div class="flex items-center justify-start">
                <button
                  type="button"
                  class="text-primary-500 m-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium hover:underline"
                  onclick={() => (selectedCoopId = coop.id)}
                >
                  {coop.name}
                </button>
              </div>
            </td>
            <td class="px-4 py-4 text-center whitespace-nowrap">
              <span class="text-surface-900 text-sm font-bold">{formatCurrency(coop.salesPrice)}</span>
            </td>
            <td>
              <div class="text-surface-700 text-xs">{dayjs(coop.salesDate).format('YYYY-MM-DD')}</div>
            </td>

            <td class="px-4 py-4 text-center">
              <div class="flex flex-col items-center gap-1">
                <div class="mb-1 flex w-full items-center justify-between text-xs">
                  <span class="text-surface-700 font-medium">{coop.currentQuantity}</span>
                  <span class="text-surface-600 mx-auto text-base font-medium"
                    >{Math.round((coop.currentQuantity / coop.maxQuantity) * 100)}%</span
                  >
                  <span class="text-surface-400 font-medium">{coop.maxQuantity}</span>
                </div>
                <div class="relative w-full">
                  <div class="bg-surface-50/50 h-2 justify-between overflow-hidden rounded-full">
                    <div
                      class="h-full rounded-full transition-all duration-300 {getProgressColor(coop)}"
                      style="width: {Math.round((coop.currentQuantity / coop.maxQuantity) * 100)}%"
                    ></div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if coops.length === 0}
      <div class="py-12 text-center">
        <h3 class="text-surface-900 mt-2 text-sm font-medium">판매 상품 정보가 없습니다</h3>
      </div>
    {/if}
  </div>
</div>

{#if selectedCoopId}
  <CoopDetailModal coop={coops.find((c) => c.id === selectedCoopId) || null} onClose={() => (selectedCoopId = null)} />
{/if}
