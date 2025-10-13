<script lang="ts">
  let users = [
    {
      id: 'USER-001',
      name: '김철수',
      email: 'kim@store1.com',
      phone: '010-1234-5678',
      storeName: '강남점',
      storeAddress: '서울시 강남구 테헤란로 123',
      businessNumber: '123-45-67890',
      status: 'pending',
      appliedDate: '2024-10-12',
      approvedDate: null,
      note: '신규 가맹점 신청',
    },
    {
      id: 'USER-002',
      name: '이영희',
      email: 'lee@store2.com',
      phone: '010-2345-6789',
      storeName: '홍대점',
      storeAddress: '서울시 마포구 홍익로 456',
      businessNumber: '234-56-78901',
      status: 'approved',
      appliedDate: '2024-10-10',
      approvedDate: '2024-10-11',
      note: '',
    },
    {
      id: 'USER-003',
      name: '박민수',
      email: 'park@store3.com',
      phone: '010-3456-7890',
      storeName: '잠실점',
      storeAddress: '서울시 송파구 잠실로 789',
      businessNumber: '345-67-89012',
      status: 'rejected',
      appliedDate: '2024-10-08',
      approvedDate: null,
      note: '서류 미비로 거부',
    },
    {
      id: 'USER-004',
      name: '최지현',
      email: 'choi@store4.com',
      phone: '010-4567-8901',
      storeName: '명동점',
      storeAddress: '서울시 중구 명동길 321',
      businessNumber: '456-78-90123',
      status: 'pending',
      appliedDate: '2024-10-11',
      approvedDate: null,
      note: '추가 서류 검토 중',
    },
    {
      id: 'USER-005',
      name: '정민호',
      email: 'jung@store5.com',
      phone: '010-5678-9012',
      storeName: '신촌점',
      storeAddress: '서울시 서대문구 신촌로 654',
      businessNumber: '567-89-01234',
      status: 'approved',
      appliedDate: '2024-10-09',
      approvedDate: '2024-10-10',
      note: '',
    },
  ]

  let selectedStatus = 'all'
  let searchName = ''
  let dateFrom = ''
  let dateTo = ''

  const statusOptions = [
    { value: 'all', label: '전체', count: users.length },
    {
      value: 'pending',
      label: '승인대기',
      count: users.filter((u) => u.status === 'pending').length,
    },
    {
      value: 'approved',
      label: '승인완료',
      count: users.filter((u) => u.status === 'approved').length,
    },
    {
      value: 'rejected',
      label: '거부됨',
      count: users.filter((u) => u.status === 'rejected').length,
    },
  ]

  $: filteredUsers = users.filter((user) => {
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    const matchesName =
      !searchName ||
      user.name.toLowerCase().includes(searchName.toLowerCase()) ||
      user.storeName.toLowerCase().includes(searchName.toLowerCase())
    const matchesDateFrom = !dateFrom || user.appliedDate >= dateFrom
    const matchesDateTo = !dateTo || user.appliedDate <= dateTo
    return matchesStatus && matchesName && matchesDateFrom && matchesDateTo
  })

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

  function approveUser(userId: string) {
    users = users.map((user) =>
      user.id === userId ? { ...user, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] } : user
    )
  }

  function rejectUser(userId: string) {
    users = users.map((user) => (user.id === userId ? { ...user, status: 'rejected', note: '본사에서 거부됨' } : user))
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR')
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
            ? 'bg-primary-300 text-primary-contrast shadow-sm'
            : 'text-surface-600 hover:text-surface-800'}"
          on:click={() => (selectedStatus = option.value)}
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
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">신청자 정보</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">매장 정보</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">신청일</th>
          <th class="text-surface-500 px-4 py-3 text-left text-xs font-medium">상태</th>
          <th class="text-surface-500 w-32 px-4 py-3 text-center text-xs font-medium">액션</th>
        </tr>
      </thead>
      <tbody class="divide-surface-100 divide-y bg-white">
        {#each filteredUsers as user, index}
          <tr class="hover:bg-surface-50">
            <td class="text-surface-500 px-4 py-4 text-center text-sm">
              {index + 1}
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <div class="bg-surface-200 flex h-10 w-10 items-center justify-center rounded-full">
                    <span class="text-surface-700 text-sm font-medium">{user.name.charAt(0)}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-surface-900 text-sm font-medium">{user.name}</div>
                  <div class="text-surface-500 text-sm">{user.email}</div>
                  <div class="text-surface-400 text-xs">{user.phone}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-900 text-sm font-medium">{user.storeName}</div>
              <div class="text-surface-500 text-sm">{user.storeAddress}</div>
              <div class="text-surface-400 text-xs">사업자번호: {user.businessNumber}</div>
            </td>
            <td class="px-4 py-4">
              <div class="text-surface-700 text-sm">{formatDate(user.appliedDate)}</div>
              {#if user.approvedDate}
                <div class="text-xs text-green-600">승인: {formatDate(user.approvedDate)}</div>
              {/if}
            </td>
            <td class="px-4 py-4">
              <span class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(user.status)}`}>
                {getStatusText(user.status)}
              </span>
              {#if user.note}
                <div class="text-surface-500 mt-1 text-xs">{user.note}</div>
              {/if}
            </td>
            <td class="px-4 py-4 text-center">
              {#if user.status === 'pending'}
                <div class="flex items-center justify-center gap-1">
                  <button
                    on:click={() => approveUser(user.id)}
                    class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                  >
                    승인
                  </button>
                  <button
                    on:click={() => rejectUser(user.id)}
                    class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    거부
                  </button>
                </div>
              {:else}
                <span class="text-surface-400 text-xs">-</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if filteredUsers.length === 0}
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
