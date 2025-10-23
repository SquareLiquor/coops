<script lang="ts">
  import { enhance } from '$app/forms'
  import Pagination from '$lib/components/Pagination.svelte'
  import { approvalRequestDataConverter } from '$lib/converters'
  import { ApprovalStatus, equalsEnum, type ApprovalRequestData } from '$lib/types'
  import { extractFormData } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import dayjs from 'dayjs'
  import { produce } from 'immer'
  import { onDestroy, onMount, tick } from 'svelte'
  import type { PageProps } from './$types'

  const { convertAll } = approvalRequestDataConverter()

  let { data }: PageProps = $props()
  let { supabase, statusOptions } = $derived(data)

  let isLoading = $state(false)
  let isRowLoading: string[] = $state([])
  let requests: ApprovalRequestData[] = $state([])
  let searchCondition = $state({
    status: 'all',
    name: undefined,
    date_from: undefined,
    date_to: undefined,
    pagination: {},
  })

  // TODO: 삭제
  let currentPage = $state(1)
  const pageSize = 10

  let searchFormElem: HTMLFormElement | null = null

  onMount(async () => {
    await tick()
    if (searchFormElem) {
      ;(searchFormElem as HTMLFormElement).requestSubmit()
    }
  })

  // auto-submit behavior when searchCondition changes
  // - status / date changes -> submit immediately
  // - name changes -> debounced submit (500ms)
  let initialFiltersEffect = false
  let initialNameEffect = false
  let nameDebounceTimer: ReturnType<typeof setTimeout> | null = null

  function submitSearchForm() {
    if (!searchFormElem) return
    ;(searchFormElem as HTMLFormElement).requestSubmit?.()
  }

  $effect(() => {
    const { status, date_from, date_to } = searchCondition
    // skip first run (we already submit on mount)
    if (!initialFiltersEffect) {
      initialFiltersEffect = true
      return
    }
    // immediate submit for status/date changes
    submitSearchForm()
  })

  $effect(() => {
    const name = searchCondition.name
    if (!initialNameEffect) {
      initialNameEffect = true
      return
    }

    if (nameDebounceTimer) clearTimeout(nameDebounceTimer)
    nameDebounceTimer = setTimeout(() => {
      submitSearchForm()
      nameDebounceTimer = null
    }, 500)
  })

  onDestroy(() => {
    if (nameDebounceTimer) clearTimeout(nameDebounceTimer)
  })

  // helper to snapshot filtered requests as an array for template use
  function snapshotFiltered(): any[] {
    try {
      const val: any = requests as any
      return Array.isArray(val) ? val : []
    } catch (e) {
      return []
    }
  }

  // enhance handler for the search form: sets loading and updates `requests` when action returns
  const searchFormEnhance = ({ formData }: { formData: FormData }) => {
    isLoading = true

    return ({ result }: { result: ActionResult }) => {
      isLoading = false
      if (result?.type === 'success') {
        requests = (result?.data as any)?.requests
        currentPage = 1
      }
    }
  }

  const requestFormEnhance = async ({ formData }: { formData: FormData }) => {
    const { id } = await extractFormData(formData, ['id'])
    if (!!id) isRowLoading = [...isRowLoading, id]

    return ({ result }: { result: ActionResult }) => {
      isRowLoading = isRowLoading.filter((_id) => _id !== id) || []

      if (result?.type === 'success') {
        const updatedRequest = result?.data?.request

        requests = produce(requests, (draft) => {
          const idx = draft.findIndex((req) => req.id === updatedRequest.id)
          if (idx !== -1) draft[idx] = updatedRequest
        })
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

<div class="p-6">
  <!-- Filter Area -->
  <form
    method="POST"
    action="?/fetch"
    use:enhance={searchFormEnhance}
    bind:this={searchFormElem}
    class="mb-6 flex items-center justify-between"
  >
    <!-- 좌측 필터 영역 -->
    <div class="flex items-center gap-4">
      <!-- 날짜 필터 -->
      <div class="flex items-center gap-2">
        <input
          type="date"
          name="date_from"
          bind:value={searchCondition.date_from}
          class="border-0 border-b px-3 py-1.5 text-sm {searchCondition.date_from
            ? 'border-primary-500 text-surface-700'
            : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
          placeholder="From"
        />
        <span class="text-surface-400">~</span>
        <input
          type="date"
          name="date_to"
          bind:value={searchCondition.date_to}
          class="border-0 border-b px-3 py-1.5 text-sm {searchCondition.date_to
            ? 'border-primary-500 text-surface-700'
            : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
          placeholder="To"
        />
      </div>

      <!-- 검색 필터 -->
      <input
        type="text"
        name="name"
        bind:value={searchCondition.name}
        placeholder="이름 또는 매장명 검색"
        class="border-0 border-b px-3 py-1.5 text-sm {searchCondition.name
          ? 'border-primary-500 text-primary-700'
          : 'border-surface-100'} focus:border-primary-500 w-64 bg-transparent focus:outline-none"
      />
    </div>

    <!-- 우측 상태 필터 영역 -->
    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      <!-- hidden status input synced with searchForm.status -->
      <input type="hidden" name="status" bind:value={searchCondition.status} />
      {#each statusOptions as option}
        <button
          type="button"
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors {searchCondition.status === option.code
            ? 'bg-primary-500 text-white shadow-sm'
            : 'text-surface-600 hover:bg-surface-100'}"
          onclick={() => (searchCondition.status = option.code)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </form>

  <div class="border-surface-100 bg-surface-50/50 overflow-hidden rounded-lg border">
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
              {(currentPage - 1) * pageSize + index + 1}
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
                  {dayjs(request.approved_at).format('YYYY-MM-DD')}
                </div>
                <div class="text-surface-300 text-xs">
                  {dayjs(request.approved_at).format('HH:mm:ss')}
                </div>
              {/if}
              <!-- {#if request.status?.code === ApprovalStatus.APPROVED.code}
                <div class="text-primary-600 text-sm">{dayjs(request.approved_at).format('YYYY-MM-DD')}</div>
                <div class="text-surface-200 text-xs">{dayjs(request.approved_at).format('HH:mm:ss')}</div>
              {/if}
              {#if request.status?.code === ApprovalStatus.REJECTED.code}
                <div class="text-sm text-red-600">{dayjs(request.cancelled_at).format('YYYY-MM-DD')}</div>
                <div class="text-surface-200 text-xs">{dayjs(request.cancelled_at).format('HH:mm:ss')}</div>
              {/if} -->
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
              {#if equalsEnum(ApprovalStatus.PENDING, request.status)}
                <form method="POST" use:enhance={requestFormEnhance}>
                  <input type="hidden" name="id" value={request.id} />
                  <div class="relative flex items-center justify-center gap-1">
                    {#if isRowLoading.includes(request.id)}
                      <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                        <span class="loader"></span>
                      </div>
                    {/if}
                    <button
                      class="bg-success-500 hover:bg-success-200 rounded px-4 py-2 text-xs font-medium text-white"
                      formaction="?/approve"
                      disabled={isRowLoading.includes(request.id)}
                    >
                      승인
                    </button>

                    <button
                      class="bg-error-500 hover:bg-error-200 rounded px-4 py-2 text-xs font-medium text-white"
                      formaction="?/reject"
                      disabled={isRowLoading.includes(request.id)}
                    >
                      거부
                    </button>
                  </div>
                </form>
              {:else}
                -
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if requests.length === 0}
      <div class="py-12 text-center">
        <svg class="text-surface-400 mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
        <h3 class="text-surface-900 mt-2 text-sm font-medium">사용자가 없습니다</h3>
        <p class="text-surface-500 mt-1 text-sm">현재 조건에 맞는 사용자가 없습니다.</p>
      </div>
    {/if}
  </div>
  <!-- Pagination -->
  <Pagination
    current={currentPage}
    total={Math.max(1, Math.ceil(snapshotFiltered().length / pageSize))}
    on:navigate={(e) => (currentPage = e.detail)}
  />
</div>

<style>
  .loader {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
    display: inline-block;
    vertical-align: middle;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
