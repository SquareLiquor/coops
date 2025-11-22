<script lang="ts">
  import { enhance } from '$app/forms'
  import { ApprovalsFilterSchema as FilterSchema } from '$lib/schemas'
  import { ApprovalStatus, equalsEnum, type ApprovalRequestData } from '$lib/types'
  import { extractFormData } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onMount, tick } from 'svelte'
  import { superForm } from 'sveltekit-superforms'
  import { valibot } from 'sveltekit-superforms/adapters'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { statuses, stores } = $derived(data)
  let requests: ApprovalRequestData[] = $state([])
  let isRowLoading: string[] = $state([])

  onMount(async () => {
    await tick()
    filterSubmit()
  })

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
    onChange: async (event) => {
      try {
        const result = await validateFilterForm({ update: true })

        if (result.valid) filterSubmit()
      } catch (e) {
        console.error('validate form error:', e)
      }
    },
    onResult: ({ result }: { result: ActionResult }) => {
      if (result?.type === 'success') {
        requests = result.data?.requests || []
      }
      if (result?.type === 'failure') {
        requests = []
      }
    },
  })

  const requestFormEnhance = async ({ formData }: { formData: FormData }) => {
    const { id } = await extractFormData(formData, ['id'])
    if (!!id) isRowLoading = [...isRowLoading, id]

    return ({ result }: { result: ActionResult }) => {
      isRowLoading = isRowLoading.filter((_id) => _id !== id) || []

      if (result?.type === 'success') {
        const updatedRequest = result?.data?.request

        const idx = requests.findIndex((req) => req.id === updatedRequest.id)
        if (idx !== -1) requests[idx] = updatedRequest
      }
    }
  }
</script>

<svelte:head>
  <title>사용자 관리 - 본사</title>
</svelte:head>

<!-- Header -->
<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <div class="flex items-center space-x-4">
    <h1 class="text-surface-900 text-2xl font-bold">사용자 관리</h1>
  </div>
</div>

<div class="relative p-6">
  <!-- Filter Area -->
  <form method="POST" action="?/fetch" use:filterEnhance class="mb-6 flex items-center justify-between">
    <!-- 좌측 필터 영역 (왼쪽 그룹과 아래 에러 영역을 함께 포함) -->
    <div class="flex flex-col">
      <div class="flex items-center gap-4">
        <!-- 날짜 필터 -->
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <input
              type="date"
              name="date_from"
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
              name="date_to"
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

        <!-- 매장 선택 필터 -->
        <select
          name="store_id"
          bind:value={$filterForm.storeId}
          class={[
            'focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none',
            $filterForm.storeId && 'border-primary-500 text-primary-700',
            !$filterForm.storeId && 'border-surface-100',
          ]}
        >
          <option value={undefined} selected>전체</option>
          {#each stores as store}
            <option value={store.id}>{store.name}</option>
          {/each}
        </select>
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
      <!-- hidden status input synced with searchForm.status -->
      <input type="hidden" name="status" bind:value={$filterForm.status} />
      {#each statuses as option}
        <button
          class={[
            'rounded px-3 py-1.5 text-sm font-medium transition-colors',
            $filterForm.status === option.code && 'bg-primary-500 text-primary-50 shadow-sm',
            $filterForm.status !== option.code && 'text-surface-600 hover:text-surface-800',
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
    <!-- Users Table -->
    <table class="min-w-full">
      <thead class="bg-surface-50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-4 text-center">
            <span class="text-surface-500 ont-bold">#</span>
          </th>
          <th class="text-surface-500 px-4 text-center font-bold">신청자 정보</th>
          <th class="text-surface-500 px-4 text-center font-bold">매장 정보</th>
          <th class="text-surface-500 px-4 text-center font-bold">상태</th>
          <th class="text-surface-500 px-4 text-center font-bold">신청일</th>
          <th class="text-surface-500 px-4 text-center font-bold">승인일/취소일</th>
          <!-- <th class="text-surface-500  text-center font-bold">사유</th> -->
          <th class="text-surface-500 w-32 px-6 text-center font-bold"></th>
        </tr>
      </thead>
      <tbody class="divide-surface-100 divide-y bg-white">
        {#each requests as request, index}
          <tr class="hover:bg-surface-50 text-center">
            <td class="text-surface-500 py-4 text-sm">
              {index + 1}
            </td>
            <td>
              <div class="flex items-center justify-center">
                <div class="ml-4">
                  <div class="text-surface-900 text-sm font-medium">{request.applicant?.name}</div>
                  <div class="text-surface-400 text-xs">{request.applicant?.email}</div>
                </div>
              </div>
            </td>
            <td class="items-center px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">{request.store?.name}</div>
            </td>
            <td class="px-6 py-4 text-sm">
              <span
                class={`inline-flex rounded-full px-2 py-1 text-xs font-medium text-${request.status?.color}-800 bg-${request.status?.color}-100`}
              >
                {request.status?.label}
              </span>
            </td>
            <td>
              <div class="text-surface-700 text-xs">{dayjs(request.requestedAt).format('YYYY-MM-DD')}</div>
              <div class="text-surface-300 text-xs">{dayjs(request.requestedAt).format('HH:mm:ss')}</div>
            </td>
            <td>
              {#if equalsEnum(ApprovalStatus.PENDING, request.status)}
                -
              {:else}
                <div class={['text-xs', request.status && `text-${request.status.color}-500`]}>
                  {equalsEnum(ApprovalStatus.APPROVED, request.status)
                    ? dayjs(request.approvedAt).format('YYYY-MM-DD')
                    : dayjs(request.cancelledAt).format('YYYY-MM-DD')}
                </div>
                <div class="text-surface-300 text-xs">
                  {equalsEnum(ApprovalStatus.APPROVED, request.status)
                    ? dayjs(request.approvedAt).format('HH:mm:ss')
                    : dayjs(request.cancelledAt).format('HH:mm:ss')}
                </div>
              {/if}
            </td>
            <!-- <td>
              <div
                class="text-sm {request.cancelled_at
                  ? 'text-red-600'
                  : request.approved_at
                    ? 'text-green-600'
                    : 'text-yellow-600'}"
              >
                {request.reason}
              </div>
            </td> -->
            <td>
              <form method="POST" use:enhance={requestFormEnhance}>
                <input type="hidden" name="id" value={request.id} />
                <input type="hidden" name="userId" value={request.applicantId} />
                <input type="hidden" name="storeId" value={request.storeId} />
                <div class="relative flex items-center justify-center gap-1">
                  {#if isRowLoading.includes(request.id)}
                    <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                      <span class="loader"></span>
                    </div>
                  {/if}
                  {#if !equalsEnum(ApprovalStatus.APPROVED, request.status)}
                    <button
                      class="bg-success-500 hover:bg-success-200 rounded px-4 py-2 text-xs font-medium text-white"
                      formaction="?/approve"
                      disabled={isRowLoading.includes(request.id)}
                    >
                      승인
                    </button>
                  {/if}
                  {#if !equalsEnum(ApprovalStatus.REJECTED, request.status)}
                    <button
                      class="bg-error-500 hover:bg-error-200 rounded px-4 py-2 text-xs font-medium text-white"
                      formaction="?/reject"
                      disabled={isRowLoading.includes(request.id)}
                    >
                      거부
                    </button>
                  {/if}
                </div>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if requests.length === 0}
      <div class="py-12 text-center">
        <h3 class="text-surface-900 mt-2 text-sm font-medium">사용자가 없습니다</h3>
      </div>
    {/if}
  </div>
  <!-- TODO: Pagination -->
  <!-- <Pagination
    current={currentPage}
    total={Math.max(1, Math.ceil(snapshotFiltered().length / pageSize))}
    on:navigate={(e) => (currentPage = e.detail)}
  /> -->
</div>
