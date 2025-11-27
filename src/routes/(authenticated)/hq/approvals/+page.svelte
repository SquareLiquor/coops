<script lang="ts">
  import { enhance } from '$app/forms'
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import Alert from '$lib/components/ui/Alert.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { ApprovalsFilterSchema } from '$lib/schemas'
  import { ApprovalStatus, type ApprovalRequestEntity } from '$lib/types'
  import { extractFormData } from '$lib/utils'
  import { equalsEnum } from '$lib/utils/enum'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { onDestroy, onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { statuses, stores } = $derived(data)
  let requests: ApprovalRequestEntity[] = $state([])
  let isRowLoading: string[] = $state([])
  let alert: { type: 'info' | 'error' | 'warning' | 'success'; title: string; message: string } | null = $state(null)

  onMount(async () => {
    await tick()
    await asyncFilterSubmit()
  })

  onDestroy(() => debouncedSubmit?.cancel?.())

  const {
    form: filterForm,
    errors: filterErrors,
    constraints: filterConstraints,
    enhance: filterEnhance,
    submitting: filterSubmitting,
    asyncSubmit: asyncFilterSubmit,
    debouncedSubmit,
    pagination,
  } = buildFilterForm<typeof ApprovalsFilterSchema>({
    form: data.filterForm,
    schema: ApprovalsFilterSchema,
    resultHandler: {
      handleSuccess: (result) => (requests = result.data?.requests || []),

      handleFailure: () => (requests = []),
    },
  })

  const handlePageChange = (page: number) => {
    $filterForm.page = page
    asyncFilterSubmit()
  }

  const requestFormEnhance = async ({ formData }: { formData: FormData }) => {
    const { id } = await extractFormData(formData, ['id'])
    if (!!id) isRowLoading = [...isRowLoading, id]

    return ({ result }: { result: ActionResult }) => {
      isRowLoading = isRowLoading.filter((_id) => _id !== id) || []

      if (result?.type === 'success') {
        const updatedRequest = result?.data?.request

        const idx = requests.findIndex((req) => req.id === updatedRequest.id)
        if (idx !== -1) requests[idx] = updatedRequest

        // Alert 메시지 표시
        if (result?.data?.alert) {
          alert = result.data.alert
        }
      } else if (result?.type === 'failure') {
        // 에러 Alert 메시지 표시
        if (result?.data?.alert) {
          alert = result.data.alert
        }
      }
    }
  }
</script>

<svelte:head>
  <title>사용자 관리 - 본사</title>
</svelte:head>

{#if alert}
  <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => (alert = null)} />
{/if}

<div class="min-h-screen bg-gray-100 p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">사용자 관리</h1>
  </div>

  <div class="relative">
    <form method="POST" action="?/fetch" use:filterEnhance class="mb-4">
      <input type="hidden" name="page" bind:value={$filterForm.page} />
      <!-- Filters Row -->
      <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2">
          <!-- 날짜 필터 -->
          <input
            type="date"
            name="date_from"
            bind:value={$filterForm.dateFrom}
            class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
            {...$filterConstraints.dateFrom}
          />
          <span class="text-xs text-gray-400">~</span>
          <input
            type="date"
            name="date_to"
            bind:value={$filterForm.dateTo}
            class="focus:border-primary-500 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
            {...$filterConstraints.dateTo}
          />

          <!-- 매장 선택 필터 -->
          <select
            name="store_id"
            bind:value={$filterForm.storeId}
            class="focus:border-primary-500 min-w-[100px] rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs transition-colors focus:outline-none"
          >
            <option value={undefined} selected>전체</option>
            {#each stores as store}
              <option value={store.id}>{store.name}</option>
            {/each}
          </select>
        </div>

        <!-- 상태 필터 (우측 또는 아래) -->
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <input type="hidden" name="status" bind:value={$filterForm.status} />
          {#each statuses as option}
            <button
              type="button"
              class={[
                'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                $filterForm.status === option.code && 'bg-primary-600 text-white',
                $filterForm.status !== option.code && 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
              ]}
              onclick={() => ($filterForm.status = option.code)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>

      {#if $filterErrors.dateFrom || $filterErrors.dateTo}
        <div class="flex flex-col gap-1">
          {#if $filterErrors.dateFrom}
            <div class="text-sm text-red-600">{$filterErrors.dateFrom}</div>
          {/if}
          {#if $filterErrors.dateTo}
            <div class="text-sm text-red-600">{$filterErrors.dateTo}</div>
          {/if}
        </div>
      {/if}
    </form>

    <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
      {#if $filterSubmitting}
        <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
          <span class="loader-giant"></span>
        </div>
      {/if}
      <!-- Users Table -->
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-white">
            <th class="w-10 border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"> # </th>
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900"
              >신청자 정보</th
            >
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">매장 정보</th
            >
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">상태</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900">신청일</th>
            <th class="border-r border-gray-200 px-3 py-3 text-right text-sm font-semibold text-gray-900"
              >승인일/취소일</th
            >
            <th class="border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold text-gray-900">액션</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each requests as request, index}
            <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {index + 1}
              </td>
              <td class="border-r border-gray-100 px-3 py-2">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-xs font-medium text-gray-900">{request.applicant?.name}</div>
                  <div class="text-xs text-gray-500">{request.applicant?.email}</div>
                </div>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center text-xs text-gray-600">
                {request.store?.name}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-center whitespace-nowrap">
                <span
                  class={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-${request.status?.color}-800 bg-${request.status?.color}-100`}
                >
                  {request.status?.label}
                </span>
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {dayjs(request.requestedAt).format('YYYY.MM.DD')}
              </td>
              <td class="border-r border-gray-100 px-3 py-2 text-right text-xs whitespace-nowrap text-gray-600">
                {#if equalsEnum(ApprovalStatus.PENDING, request.status)}
                  -
                {:else}
                  {equalsEnum(ApprovalStatus.APPROVED, request.status)
                    ? dayjs(request.approvedAt).format('YYYY.MM.DD')
                    : dayjs(request.cancelledAt).format('YYYY.MM.DD')}
                {/if}
              </td>
              <td class="border-r border-gray-100 px-3 py-2">
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
                        class="bg-success-500 hover:bg-success-600 min-w-[50px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
                        formaction="?/approve"
                        disabled={isRowLoading.includes(request.id)}
                      >
                        승인
                      </button>
                    {/if}
                    {#if !equalsEnum(ApprovalStatus.REJECTED, request.status)}
                      <button
                        class="bg-error-500 hover:bg-error-600 min-w-[50px] rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
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
          <div class="flex flex-col items-center justify-center">
            <svg class="mb-2 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">사용자가 없습니다</h3>
          </div>
        </div>
      {/if}
    </div>

    {#if requests.length > 0 || pagination.totalPages > 1}
      <div class="mt-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    {/if}
  </div>
</div>
