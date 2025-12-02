<script lang="ts">
  import { enhance } from '$app/forms'
  import { buildFilterForm } from '$lib/builders/filter.builder'
  import PageHeader from '$lib/components/layout/PageHeader.svelte'
  import EmptyState from '$lib/components/ui/EmptyState.svelte'
  import Loading from '$lib/components/ui/Loading.svelte'
  import Pagination from '$lib/components/ui/Pagination.svelte'
  import { ApprovalsFilterSchema } from '$lib/schemas'
  import { showError, showSuccess } from '$lib/stores'
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

  const requestFormEnhance = async ({ formData }: { formData: FormData }) => {
    const { id } = await extractFormData(formData, ['id'])
    if (!!id) isRowLoading = [...isRowLoading, id]

    return ({ result }: { result: ActionResult }) => {
      isRowLoading = isRowLoading.filter((_id) => _id !== id) || []

      if (result?.type === 'success') {
        const updatedRequest = result?.data?.request

        const idx = requests.findIndex((req) => req.id === updatedRequest.id)
        if (idx !== -1) requests[idx] = updatedRequest

        if (result?.data?.alert) {
          showSuccess({ message: result.data.alert.message, title: result.data.alert.title })
        }
      } else if (result?.type === 'failure') {
        if (result?.data?.alert) {
          showError({ message: result.data.alert.message, title: result.data.alert.title })
        }
      }
    }
  }
</script>

<div class="min-h-screen bg-gray-100 p-6">
  <PageHeader title="사용자 관리" />

  <div class="relative">
    <Loading show={$filterSubmitting} />

    {@render filter()}

    <div class="relative overflow-hidden rounded-2xl bg-white shadow-sm">
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
                <span class={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${request.status?.badgeClass}`}>
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

      <EmptyState show={requests.length === 0} title="승인 요청 내역이 없습니다" />
    </div>

    <Pagination {pagination} onPageChange={(page) => ($filterForm.page = page)} />
  </div>
</div>

{#snippet filter()}
  <form method="POST" action="?/fetch" use:filterEnhance class="mb-4">
    <input type="hidden" name="page" bind:value={$filterForm.page} />
    <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-2">
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
{/snippet}
