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
    delayed: filterDelayed,
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
              bind:value={$filterForm.date_from}
              class="focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              class:border-primary-500={$filterForm.date_from}
              class:text-primary-700={$filterForm.date_from}
              class:border-surface-100={!$filterForm.date_from}
              {...$filterConstraints.date_from}
            />
            <span class="text-surface-400">~</span>
            <input
              type="date"
              name="date_to"
              bind:value={$filterForm.date_to}
              class="focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
              class:border-primary-500={$filterForm.date_to}
              class:text-primary-700={$filterForm.date_to}
              class:border-surface-100={!$filterForm.date_to}
              {...$filterConstraints.date_to}
            />
          </div>
        </div>

        <!-- 매장 선택 필터 -->
        <select
          name="store_id"
          bind:value={$filterForm.store_id}
          class="focus:border-primary-500 border-0 border-b bg-transparent px-3 py-1.5 text-sm focus:outline-none"
          class:border-primary-500={$filterForm.store_id}
          class:text-primary-700={$filterForm.store_id}
          class:border-surface-100={!$filterForm.store_id}
        >
          <option value={undefined} selected>전체</option>
          {#each stores as store}
            <option value={store.id}>{store.name}</option>
          {/each}
        </select>
      </div>

      {#if $filterErrors.date_from || $filterErrors.date_to}
        <div class="mt-1 flex flex-col gap-1">
          {#if $filterErrors.date_from}
            <div class="text-error-500 text-sm">{$filterErrors.date_from}</div>
          {/if}
          {#if $filterErrors.date_to}
            <div class="text-error-500 text-sm">{$filterErrors.date_to}</div>
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
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors"
          class:bg-primary-500={$filterForm.status === option.code}
          class:text-primary-50={$filterForm.status === option.code}
          class:shadow-sm={$filterForm.status === option.code}
          class:text-surface-600={$filterForm.status !== option.code}
          class:hover:text-surface-800={$filterForm.status !== option.code}
          onclick={() => ($filterForm.status = option.code)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </form>

  <div class="border-surface-100 bg-surface-50/50 relative overflow-hidden rounded-lg border">
    {#if $filterDelayed}
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
            <td class="text-surface-500 px-6 py-4 text-sm">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium text-white"
                class:bg-success-500={equalsEnum(ApprovalStatus.APPROVED, request.status)}
                class:bg-error-500={equalsEnum(ApprovalStatus.REJECTED, request.status)}
                class:bg-warning-500={equalsEnum(ApprovalStatus.PENDING, request.status)}
              >
                {request.status?.label}
              </span>
            </td>
            <td>
              <div class="text-surface-700 text-xs">{dayjs(request.requested_at).format('YYYY-MM-DD')}</div>
              <div class="text-surface-300 text-xs">{dayjs(request.requested_at).format('HH:mm:ss')}</div>
            </td>
            <td>
              {#if equalsEnum(ApprovalStatus.PENDING, request.status)}
                -
              {:else}
                <div
                  class="text-xs"
                  class:text-success-500={equalsEnum(ApprovalStatus.APPROVED, request.status)}
                  class:text-error-500={equalsEnum(ApprovalStatus.REJECTED, request.status)}
                  class:text-warning-500={equalsEnum(ApprovalStatus.PENDING, request.status)}
                >
                  {equalsEnum(ApprovalStatus.APPROVED, request.status)
                    ? dayjs(request.approved_at).format('YYYY-MM-DD')
                    : dayjs(request.cancelled_at).format('YYYY-MM-DD')}
                </div>
                <div class="text-surface-300 text-xs">
                  {equalsEnum(ApprovalStatus.APPROVED, request.status)
                    ? dayjs(request.approved_at).format('HH:mm:ss')
                    : dayjs(request.cancelled_at).format('HH:mm:ss')}
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
                <input type="hidden" name="user_id" value={request.applicant_id} />
                <input type="hidden" name="store_id" value={request.store_id} />
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
