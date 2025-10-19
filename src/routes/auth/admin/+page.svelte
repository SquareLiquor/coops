<script lang="ts">
  import { enhance } from '$app/forms'
  import type { StorePublic } from '$lib/types'
  import { onlyEmailInput, onlyNumberInput } from '$lib/utils'

  interface PageData {
    stores: StorePublic[]
  }

  interface ActionData {
    error?: string | undefined
  }

  let { data, form }: { data: PageData; form?: ActionData | null } = $props()

  let isSignUp = $state(false)
  let stores = $derived(data.stores)
  let errorMessage = $derived(form?.error)

  // Clear all error messages when isSignUp changes
  $effect(() => {
    if (isSignUp) {
      clearFormErrors()
    }
  })

  // Function to clear specific field errors
  const clearFormErrors = (fieldName?: string) => {
    if (!fieldName) {
      errorMessage = undefined
      formFieldErrors = {}
    } else {
      delete formFieldErrors[fieldName]
    }
  }

  // Initialize formFieldErrors to track field-specific errors
  let formFieldErrors: Record<string, string> = {}

  // Function to validate form fields
  // const validateFields = () => {
  //   formFieldErrors = {}

  //   if (isSignUp) {
  //     // Validate phone2
  //     if (!/^[0-9]{4}$/.test(formFieldErrors.phone2)) {
  //       formFieldErrors.phone2 = '전화번호 두 번째 부분은 4자리 숫자여야 합니다.'
  //     }

  //     // Validate phone3
  //     if (!/^[0-9]{4}$/.test(formFieldErrors.phone3)) {
  //       formFieldErrors.phone3 = '전화번호 세 번째 부분은 4자리 숫자여야 합니다.'
  //     }

  //     // Validate password
  //     if (formFieldErrors.password.length < 8) {
  //       formFieldErrors.password = '비밀번호는 8자 이상이어야 합니다.'
  //     }

  //     // Validate confirmPassword
  //     if (formFieldErrors.password !== formFieldErrors.confirmPassword) {
  //       formFieldErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
  //     }
  //   }

  //   // Update errorMessage if there are any errors
  //   errorMessage = Object.keys(formFieldErrors).length > 0 ? '입력값을 확인해주세요.' : undefined
  // }

  // // Call validateFields on form submission
  // const handleSubmit = (event: Event) => {
  //   event.preventDefault()
  //   validateFields()

  //   if (!errorMessage) {
  //     // Proceed with form submission
  //     event.target.submit()
  //   }
  // }
</script>

<!-- 가맹점/본사 관리자 로그인 페이지 - Skeleton UI 컨셉 -->
<div class="flex min-h-screen items-center justify-center p-4">
  <div class="w-full max-w-md">
    <!-- Main Content Card -->
    <div class="card preset-outlined-surface-200-800 bg-surface-50/10 space-y-5 p-8 shadow-lg">
      <!-- Login Form -->
      <header class="mb-6 space-y-2 text-center">
        <h2 class="h3 font-bold">{isSignUp ? '회원가입' : '로그인'}</h2>
        <p class="opacity-75">
          {isSignUp ? '새로운 매장을 등록하고 관리를 시작하세요' : '등록된 관리자 계정으로 로그인하세요'}
        </p>
      </header>

      <!-- Divider with Toggle Link -->
      <div class="mb-4 flex items-center justify-center">
        <hr class="border-surface-300 flex-1" />
        <button class="anchor hover:text-primary-600 px-4 text-sm" onclick={() => (isSignUp = !isSignUp)}>
          {isSignUp ? '로그인' : '회원가입'}
        </button>
        <hr class="border-surface-300 flex-1" />
      </div>

      {#if !isSignUp}
        <form class="space-y-4" method="POST" action="?/signin" use:enhance>
          <label class="label">
            <span>관리자 이메일</span>
            <input
              class="input placeholder:text-surface-200"
              type="email"
              name="email"
              placeholder="관리자 이메일을 입력하세요"
              required
              oninput={onlyEmailInput}
            />
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200"
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </label>

          <div class="flex justify-end text-sm">
            <button type="button" class="anchor" onclick={() => alert('비밀번호 찾기 기능은 추후 구현 예정입니다.')}>
              비밀번호 찾기
            </button>
          </div>

          {#if errorMessage}
            <div class="text-error-500 mb-2 text-center text-sm font-medium">{errorMessage}</div>
          {/if}
          <button
            type="submit"
            class="btn bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white"
            disabled={!!errorMessage}>로그인</button
          >
        </form>
      {:else}
        <form class="space-y-4" method="POST" action="?/signup" use:enhance>
          <label class="label">
            <span>매장 선택</span>
            <select class="select h-9 px-4" name="storeId" required>
              <option value="" disabled selected>선택</option>
              {#each stores as store}
                <option value={store.id} class={store.type === 'hq' ? 'pl-2 font-bold' : 'pl-2'}>
                  {store.name}
                </option>
              {/each}
            </select>
          </label>

          <label class="label">
            <span>관리자 이메일</span>
            <input
              class="input placeholder:text-surface-200"
              type="email"
              name="email"
              placeholder="관리자 이메일을 입력하세요"
              required
              oninput={onlyEmailInput}
              value="aaa@aaa.com"
            />
          </label>

          <label class="label">
            <span>이름</span>
            <input
              class="input placeholder:text-surface-200"
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              required
              value="김강남"
            />
          </label>

          <label class="label">
            <span>전화번호</span>
            <div class="flex gap-2">
              <select class="select w-16 text-center" name="phone1" required>
                <option value="" disabled selected>선택</option>
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </select>
              <span class="self-center">-</span>
              <input
                class="input w-20 text-center {formFieldErrors.phone2 ? 'input-error' : ''}"
                type="tel"
                name="phone2"
                placeholder=""
                maxlength="4"
                required
                oninput={onlyNumberInput}
                onfocus={() => clearFormErrors('phone2')}
                value="1111"
              />
              <span class="self-center">-</span>
              <input
                class="input w-20 text-center {formFieldErrors.phone3 ? 'input-error' : ''}"
                type="tel"
                name="phone3"
                placeholder=""
                maxlength="4"
                required
                oninput={onlyNumberInput}
                onfocus={() => clearFormErrors('phone3')}
                value="1111"
              />
            </div>
            {#if formFieldErrors.phone2}
              <span class="text-error-500 mt-1 text-sm">{formFieldErrors.phone2}</span>
            {:else if formFieldErrors.phone3}
              <span class="text-error-500 mt-1 text-sm">{formFieldErrors.phone3}</span>
            {/if}
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200 {formFieldErrors.password ? 'input-error' : ''}"
              type="password"
              name="password"
              placeholder="8자 이상"
              minlength="8"
              onfocus={() => {
                clearFormErrors('password')
              }}
              required
              value="11111111"
            />
            {#if formFieldErrors.password}
              <span class="text-error-500 mt-1 text-sm">{formFieldErrors.password}</span>
            {/if}
          </label>
          <label class="label">
            <span>비밀번호 확인</span>
            <input
              class="input placeholder:text-surface-200 {formFieldErrors.confirmPassword ? 'input-error' : ''}"
              type="password"
              name="confirmPassword"
              placeholder="재입력"
              onfocus={() => clearFormErrors('confirmPassword')}
              required
              value="11111111"
            />
            {#if formFieldErrors.confirmPassword}
              <span class="text-error-500 mt-1 text-sm">{formFieldErrors.confirmPassword}</span>
            {/if}
          </label>

          {#if errorMessage}
            <div class="text-error-500 mb-2 text-center text-sm font-medium">{errorMessage}</div>
          {/if}
          <button
            type="submit"
            class="btn bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white"
            disabled={!!errorMessage}>회원가입</button
          >
        </form>

        <!-- Divider -->
        <hr class="hr-divider" />

        <!-- Info Section -->
        <div class="space-y-2 text-center">
          <p class="text-sm opacity-75">신청 후 승인이 완료되면 서비스를 이용할 수 있습니다.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
