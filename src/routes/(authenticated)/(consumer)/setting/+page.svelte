<script lang="ts">
  // Types
  type UserProfile = {
    name: string
    email: string
    phone: string
    profileImage: string
  }

  // State management
  let userProfile = $state<UserProfile>({
    name: '김지훈',
    email: 'jihoon.kim@example.com',
    phone: '010-1234-5678',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format',
  })

  let isEditing = $state(false)
  let tempProfile = $derived(userProfile)

  // Functions
  function startEdit() {
    tempProfile = { ...userProfile }
    isEditing = true
  }

  function cancelEdit() {
    tempProfile = { ...userProfile }
    isEditing = false
  }

  function saveProfile() {
    userProfile = { ...tempProfile }
    isEditing = false
    // TODO: API 호출로 프로필 업데이트
  }

  function logout() {
    // TODO: 로그아웃 처리
    alert('로그아웃되었습니다.')
  }

  function handleImageChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      // TODO: 실제 이미지 업로드 처리
      const reader = new FileReader()
      reader.onload = (e) => {
        tempProfile.profileImage = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
</script>

<svelte:head>
  <title>설정 - 공동구매</title>
</svelte:head>

<!-- 소비자 설정 페이지 - Mobile First -->
<div class="to-surface-50/30 min-h-screen bg-gradient-to-br from-white">
  <!-- Main Content -->
  <main class="container mx-auto px-4 py-6 pb-20">
    <!-- Profile Section -->
    <div
      class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 mb-6 overflow-hidden rounded-xl border bg-white shadow-sm"
    >
      <div class="border-surface-100 dark:border-surface-700 border-b p-4">
        <h2 class="text-surface-900 dark:text-surface-100 text-lg font-semibold">프로필 정보</h2>
      </div>

      <div class="p-6">
        <!-- Profile Image -->
        <div class="mb-6 flex flex-col items-center">
          <div class="relative mb-4">
            <img
              src={isEditing ? tempProfile.profileImage : userProfile.profileImage}
              alt="프로필 사진"
              class="border-surface-100 dark:border-surface-600 h-24 w-24 rounded-full border-4 object-cover"
            />
            {#if isEditing}
              <label
                class="bg-primary-500 hover:bg-primary-600 absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-colors"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input type="file" accept="image/*" class="hidden" onchange={handleImageChange} />
              </label>
            {/if}
          </div>

          {#if !isEditing}
            <p class="text-surface-900 dark:text-surface-100 text-xl font-semibold">
              {userProfile.name}
            </p>
            <p class="text-surface-600 dark:text-surface-400 text-sm">{userProfile.email}</p>
          {/if}
        </div>

        <!-- Profile Form -->
        <div class="space-y-4">
          <div>
            <label for="user-name" class="text-surface-700 dark:text-surface-300 mb-1 block text-sm font-medium">
              이름
            </label>
            {#if isEditing}
              <input
                id="user-name"
                type="text"
                bind:value={tempProfile.name}
                class="border-surface-300 focus:border-primary-500 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                placeholder="이름을 입력하세요"
              />
            {:else}
              <p
                class="bg-surface-50 text-surface-900 dark:bg-surface-700 dark:text-surface-100 rounded-lg px-3 py-2 text-sm"
              >
                {userProfile.name}
              </p>
            {/if}
          </div>

          <div>
            <label for="user-email" class="text-surface-700 dark:text-surface-300 mb-1 block text-sm font-medium">
              이메일
            </label>
            <p
              id="user-email"
              class="bg-surface-50 text-surface-600 dark:bg-surface-700 dark:text-surface-400 rounded-lg px-3 py-2 text-sm"
            >
              {userProfile.email}
              <span class="text-surface-500 ml-2 text-xs">(변경불가)</span>
            </p>
          </div>

          <div>
            <label for="user-phone" class="text-surface-700 dark:text-surface-300 mb-1 block text-sm font-medium">
              전화번호
            </label>
            {#if isEditing}
              <input
                id="user-phone"
                type="tel"
                bind:value={tempProfile.phone}
                class="border-surface-300 focus:border-primary-500 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                placeholder="전화번호를 입력하세요"
              />
            {:else}
              <p
                class="bg-surface-50 text-surface-900 dark:bg-surface-700 dark:text-surface-100 rounded-lg px-3 py-2 text-sm"
              >
                {userProfile.phone}
              </p>
            {/if}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex space-x-3">
          {#if isEditing}
            <button
              onclick={cancelEdit}
              class="border-surface-300 text-surface-700 hover:bg-surface-50 dark:border-surface-600 dark:text-surface-300 dark:hover:bg-surface-700 flex-1 rounded-lg border py-2 text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              onclick={saveProfile}
              class="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg py-2 text-sm font-medium text-white transition-colors"
            >
              저장
            </button>
          {:else}
            <button
              onclick={startEdit}
              class="bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors"
            >
              프로필 수정
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Settings Section -->
    <div
      class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 mb-6 overflow-hidden rounded-xl border bg-white shadow-sm"
    >
      <div class="border-surface-100 dark:border-surface-700 border-b p-4">
        <h2 class="text-surface-900 dark:text-surface-100 text-lg font-semibold">설정</h2>
      </div>

      <div class="divide-surface-100 dark:divide-surface-700 divide-y">
        <!-- Notification Settings -->
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-surface-900 dark:text-surface-100 text-sm font-medium">주문 알림</h3>
              <p class="text-surface-600 dark:text-surface-400 text-xs">주문 상태 변경 시 알림을 받습니다</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" checked class="peer sr-only" />
              <div
                class="bg-surface-200 peer-checked:bg-primary-500 after:border-surface-300 dark:border-surface-600 dark:bg-surface-700 peer h-6 w-11 rounded-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"
              ></div>
            </label>
          </div>
        </div>

        <!-- Marketing Settings -->
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-surface-900 dark:text-surface-100 text-sm font-medium">마케팅 정보 수신</h3>
              <p class="text-surface-600 dark:text-surface-400 text-xs">할인 정보 및 이벤트 알림을 받습니다</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" class="peer sr-only" />
              <div
                class="bg-surface-200 peer-checked:bg-primary-500 after:border-surface-300 dark:border-surface-600 dark:bg-surface-700 peer h-6 w-11 rounded-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"
              ></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- App Info Section -->
    <div
      class="border-surface-200 dark:border-surface-700 dark:bg-surface-800 mb-6 overflow-hidden rounded-xl border bg-white shadow-sm"
    >
      <div class="border-surface-100 dark:border-surface-700 border-b p-4">
        <h2 class="text-surface-900 dark:text-surface-100 text-lg font-semibold">앱 정보</h2>
      </div>

      <div class="divide-surface-100 dark:divide-surface-700 divide-y">
        <button
          type="button"
          class="hover:bg-surface-50 dark:hover:bg-surface-700 block w-full p-4 text-left transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-surface-900 dark:text-surface-100 text-sm">이용약관</span>
            <svg class="text-surface-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          type="button"
          class="hover:bg-surface-50 dark:hover:bg-surface-700 block w-full p-4 text-left transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-surface-900 dark:text-surface-100 text-sm">개인정보처리방침</span>
            <svg class="text-surface-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <div class="p-4">
          <div class="flex items-center justify-between">
            <span class="text-surface-900 dark:text-surface-100 text-sm">앱 버전</span>
            <span class="text-surface-600 dark:text-surface-400 text-sm">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="mb-6">
      <button
        onclick={logout}
        class="w-full rounded-lg border border-red-300 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        로그아웃
      </button>
    </div>
  </main>
</div>
