<script lang="ts">
  import { enhance } from '$app/forms'
  import { onlyEmailInput } from '$lib/utils'
  import type { ActionResult } from '@sveltejs/kit'
  import { untrack } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let stores = $derived(data.stores)
  let isSignUp = $state(false)
  let errors = $state<{ message: string | null; fieldErrors: Record<string, string> }>({
    message: null,
    fieldErrors: {},
  })

  let formEl: HTMLFormElement | null = null

  $effect(() => {
    if (isSignUp !== undefined) {
      untrack(() => resetForm())
    }
  })

  const validate = (formData: FormData): Record<string, string> => {
    let errors: Record<string, string> = {}

    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (isSignUp && password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    return errors
  }

  const resetForm = () => {
    if (formEl) formEl.reset() // ✅ 입력값 초기화
    clearErrors() // ✅ 오류 초기화
  }

  const clearErrors = () => {
    errors = {
      message: null,
      fieldErrors: {},
    }
  }

  /**
   * TODO: SSR 갱신, CSR 페이지 변경 이슈로 enhance가 아니라 form actions 직접 처리하도록 변경해야 됨
   *  - form actions에서 throw redirect
   */
  const handleEnhance = ({ formData, cancel }: { formData: FormData; cancel: () => void }) => {
    const error = validate(formData)

    if (Object.keys(error).length > 0) {
      errors.fieldErrors = error
      cancel()
    }

    return async ({ result }: { result: ActionResult }) => {
      if (result?.type === 'failure') {
        errors.message = (result?.data?.message as string) || null
      }

      // TODO: goto로 변경, SSR 문제로 인해 location.href 사용
      if (result?.type === 'success') {
        location.href = result.data?.redirectTo || '/admin'
      }
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="card preset-outlined-surface-200-800 bg-surface-50/10 space-y-5 p-8 shadow-lg">
      <header class="mb-6 space-y-2 text-center">
        <h2 class="h3 font-bold">{isSignUp ? '회원가입' : '로그인'}</h2>
        <p class="opacity-75">
          {isSignUp ? '새로운 매장을 등록하고 관리를 시작하세요' : '등록된 관리자 계정으로 로그인하세요'}
        </p>
      </header>

      <div class="mb-4 flex items-center justify-center">
        <hr class="border-surface-300 flex-1" />
        <button class="anchor hover:text-primary-600 px-4 text-sm" onclick={() => (isSignUp = !isSignUp)}>
          {isSignUp ? '로그인' : '회원가입'}
        </button>
        <hr class="border-surface-300 flex-1" />
      </div>
      <form
        bind:this={formEl}
        class="space-y-4"
        method="POST"
        action={isSignUp ? '?/signup' : '?/signin'}
        use:enhance={handleEnhance}
      >
        {#if isSignUp}
          <label class="label">
            <span>매장 선택</span>
            <select class="select h-9 px-4" name="store" required>
              <option value="" disabled selected>선택</option>
              {#each stores as store}
                <option
                  value={[store.id, store.type].join('|')}
                  class={store.type === 'hq' ? 'pl-2 font-bold' : 'pl-2'}
                >
                  {store.name}
                </option>
              {/each}
            </select>
          </label>
        {/if}
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

        {#if isSignUp}
          <label class="label">
            <span>이름</span>
            <input
              class="input placeholder:text-surface-200"
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              required
            />
          </label>
        {/if}

        <label class="label">
          <span>비밀번호</span>
          <input
            class="input placeholder:text-surface-200 {errors.fieldErrors?.password ? 'input-error' : ''}"
            type="password"
            name="password"
            placeholder="8자 이상"
            minlength="8"
            oninput={clearErrors}
            required
          />
          {#if errors.fieldErrors.password}
            <span class="text-error-500 mt-1 text-sm">{errors.fieldErrors.password}</span>
          {/if}
        </label>

        {#if isSignUp}
          <label class="label">
            <span>비밀번호 확인</span>
            <input
              class="input placeholder:text-surface-200 {errors.fieldErrors.confirmPassword ? 'input-error' : ''}"
              type="password"
              name="confirmPassword"
              placeholder="재입력"
              oninput={clearErrors}
              required
            />
            {#if errors.fieldErrors.confirmPassword}
              <span class="text-error-500 mt-1 text-sm">{errors.fieldErrors.confirmPassword}</span>
            {/if}
          </label>
        {/if}

        {#if errors.message}
          <div class="text-error-500 mb-2 text-center text-sm font-medium">{errors.message}</div>
        {/if}
        <button
          type="submit"
          class="btn bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white"
        >
          {isSignUp ? '회원가입' : '로그인'}
        </button>
      </form>

      <hr class="hr-divider" />

      {#if isSignUp}
        <div class="space-y-2 text-center">
          <p class="text-sm opacity-75">신청 후 승인이 완료되면 서비스를 이용할 수 있습니다.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
