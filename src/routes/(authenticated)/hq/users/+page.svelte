<script lang="ts">
  import dayjs from 'dayjs'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let requests = $derived(data.requests)

  let selectedStatus = 'all'
  let searchName = ''
  let dateFrom = ''
  let dateTo = ''

  const statusOptions = [
    { value: 'all', label: '전체' },
    {
      value: 'pending',
      label: '승인대기',
    },
    {
      value: 'approved',
      label: '승인완료',
    },
    {
      value: 'rejected',
      label: '거부됨',
    },
  ]

  // TODO: filter
  // TODO: do action
  // TODO: pagination

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-surface-100 text-surface-800'
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'pending':
        return '승인대기'
      case 'approved':
        return '승인완료'
      case 'rejected':
        return '거부됨'
      default:
        return status
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
  <div class="mb-6 flex items-center justify-between">
    <!-- 좌측 필터 영역 -->
    <div class="flex items-center gap-4">
      <!-- 날짜 필터 -->
      <div class="flex items-center gap-2">
        <input
          type="date"
          bind:value={dateFrom}
          class="border-0 border-b px-3 py-1.5 text-sm {dateFrom
            ? 'border-primary-500 text-primary-700'
            : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
          placeholder="From"
        />
        <span class="text-surface-400">~</span>
        <input
          type="date"
          bind:value={dateTo}
          class="border-0 border-b px-3 py-1.5 text-sm {dateTo
            ? 'border-primary-500 text-primary-700'
            : 'border-surface-100'} focus:border-primary-500 bg-transparent focus:outline-none"
          placeholder="To"
        />
      </div>

      <!-- 검색 필터 -->
      <input
        type="text"
        bind:value={searchName}
        placeholder="이름 또는 매장명 검색"
        class="border-0 border-b px-3 py-1.5 text-sm {searchName
          ? 'border-primary-500 text-primary-700'
          : 'border-surface-100'} focus:border-primary-500 w-64 bg-transparent focus:outline-none"
      />
    </div>

    <!-- 우측 상태 필터 영역 -->
    <div class="bg-surface-50/50 flex items-center gap-1 rounded-lg p-1">
      {#each statusOptions as option}
        <button
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors {selectedStatus === option.value
            ? 'bg-primary-500 text-primary-50 shadow-sm'
            : 'text-surface-600 hover:text-surface-800'}"
          onclick={() => (selectedStatus = option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="border-surface-100 bg-surface-50/50 overflow-hidden rounded-lg border">
    <!-- Users Table -->
    <table class="min-w-full">
      <thead class="bg-surface-50 border-surface-100 border-b">
        <tr>
          <th class="w-8 px-4 py-3 text-center">
            <span class="text-surface-500 text-xs font-medium">#</span>
          </th>
          <th class="text-surface-500 px-4 py-3 text-center text-xs font-medium">신청자 정보</th>
          <th class="text-surface-500 px-4 py-3 text-center text-xs font-medium">매장 정보</th>
          <th class="text-surface-500 px-4 py-3 text-center text-xs font-medium">상태</th>
          <th class="text-surface-500 px-4 py-3 text-center text-xs font-medium">신청일</th>
          <th class="text-surface-500 px-4 py-3 text-center text-xs font-medium">승인일/취소일</th>
          <th class="text-surface-500 px-4 py-3 text-center text-xs font-medium">사유</th>
          <th class="text-surface-500 w-32 px-4 py-3 text-center text-xs font-medium"></th>
        </tr>
      </thead>
      <tbody class="divide-surface-100 divide-y bg-white">
        {#each requests as request, index}
          <tr class="hover:bg-surface-50 text-center">
            <td class="text-surface-500 px-4 py-4 text-sm">
              {index + 1}
            </td>
            <td class="px-4 py-4">
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
            <td class="px-4 py-4">
              <span class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(request.status)}`}>
                {getStatusText(request.status)}
              </span>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-700 text-sm">{dayjs(request.requested_at).format('YYYY-MM-DD')}</div>
              <div class="text-surface-500 text-xs">{dayjs(request.requested_at).format('HH:mm:ss')}</div>
            </td>
            <td class="px-4 py-4">
              {#if request.approved_at}
                <div class="text-primary-600 text-sm">{dayjs(request.approved_at).format('YYYY-MM-DD')}</div>
                <div class="text-surface-500 text-xs">{dayjs(request.approved_at).format('HH:mm:ss')}</div>
              {/if}
              {#if request.cancelled_at}
                <div class="text-sm text-red-600">{dayjs(request.cancelled_at).format('YYYY-MM-DD')}</div>
                <div class="text-surface-500 text-xs">{dayjs(request.cancelled_at).format('HH:mm:ss')}</div>
              {/if}
            </td>
            <td class="px-4 py-4">
              <div class="text-sm {request.cancelled_at ? 'text-red-600' : 'text-primary-600'}">{request.reason}</div>
            </td>
            <td class="px-4 py-4">
              {#if request.status === 'pending'}
                <div class="flex items-center justify-center gap-1">
                  <button class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200">
                    승인
                  </button>
                  <button class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200">
                    거부
                  </button>
                </div>
              {:else}
                <span class="text-surface-400 text-xs"> - </span>
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
</div>
