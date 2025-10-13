<script lang="ts">
  let isSignUp = $state(false)
  let loginForm = $state({
    email: '',
    password: '',
  })
  let signupForm = $state({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    storeId: '',
  })

  const storeTypes = [
    { value: 'hq', label: '본사' },
    { value: 'store1', label: '강남점' },
    { value: 'store2', label: '동대문점' },
    { value: 'store3', label: '용산점' },
    { value: 'store4', label: '잠실점' },
  ]
</script>

<!-- 가맹점/본사 관리자 로그인 페이지 - Skeleton UI 컨셉 -->
<div class="flex min-h-screen items-center justify-center bg-surface-100 p-4">
  <div class="w-full max-w-md">
    <!-- Main Content Card -->
    <div class="space-y-5 card preset-outlined-surface-200-800 bg-surface-50 p-8 shadow-lg">
      <!-- Login Form -->
      <header class="mb-6 space-y-2 text-center">
        <h2 class="h3 font-bold">{isSignUp ? '회원가입' : '로그인'}</h2>
        <p class="opacity-75">
          {isSignUp ? '새로운 매장을 등록하고 관리를 시작하세요' : '등록된 관리자 계정으로 로그인하세요'}
        </p>
      </header>

      <!-- Divider with Toggle Link -->
      <div class="mb-4 flex items-center justify-center">
        <hr class="flex-1 border-surface-300" />
        <button class="px-4 anchor text-sm hover:text-primary-600" onclick={() => (isSignUp = !isSignUp)}>
          {isSignUp ? '로그인' : '회원가입'}
        </button>
        <hr class="flex-1 border-surface-300" />
      </div>

      {#if isSignUp}
        <form class="space-y-4">
          <label class="label">
            <span>관리자 이메일</span>
            <input
              class="input placeholder:text-surface-200"
              type="email"
              bind:value={loginForm.email}
              placeholder="관리자 이메일을 입력하세요"
            />
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200"
              type="password"
              bind:value={loginForm.password}
              placeholder="비밀번호를 입력하세요"
            />
          </label>

          <div class="flex justify-end text-sm">
            <button type="button" class="anchor" onclick={() => alert('비밀번호 찾기 기능은 추후 구현 예정입니다.')}>
              비밀번호 찾기
            </button>
          </div>

          <button
            type="submit"
            class="btn w-full rounded-lg bg-primary-500 py-3 font-medium text-white hover:bg-primary-600">로그인</button
          >
        </form>
      {:else}
        <form class="space-y-4">
          <label class="label">
            <span>매장 선택</span>
            <select class="select h-8 px-4" bind:value={signupForm.storeId}>
              {#each storeTypes as type}
                <option value={type.value} class={type.value === 'hq' ? 'pl-2 font-bold' : 'pl-2'}>
                  {type.label}
                </option>
              {/each}
            </select>
          </label>

          <label class="label">
            <span>관리자 이메일</span>
            <input
              class="input placeholder:text-surface-200"
              type="email"
              bind:value={signupForm.email}
              placeholder="관리자 이메일을 입력하세요"
            />
          </label>

          <label class="label">
            <span>이름</span>
            <input
              class="input placeholder:text-surface-200"
              type="text"
              bind:value={signupForm.name}
              placeholder="이름을 입력하세요"
            />
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200"
              type="password"
              bind:value={signupForm.password}
              placeholder="8자 이상"
            />
          </label>
          <label class="label">
            <span>비밀번호 확인</span>
            <input
              class="input placeholder:text-surface-200"
              type="password"
              bind:value={signupForm.confirmPassword}
              placeholder="재입력"
            />
          </label>

          <button
            type="submit"
            class="btn w-full rounded-lg bg-primary-500 py-3 font-medium text-white hover:bg-primary-600"
            >회원가입</button
          >
        </form>

        <!-- Divider -->
        <hr class="hr-divider" />

        <!-- Info Section -->
        <div class="space-y-2 text-center">
          <p class="text-sm opacity-75">신청 후 본사 승인이 완료되면 서비스를 이용할 수 있습니다.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
