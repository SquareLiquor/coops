<script lang="ts">
  import { enhance } from '$app/forms'
  import { onlyEmailInput, onlyNumberInput } from '$lib/utils'
  import type { PageProps } from './$types'

  let { data, form }: PageProps = $props()
  let { stores } = $derived(data)

  let isSignUp = $state(false)
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
              class="input placeholder:text-surface-200 {form?.error?.email ? 'input-error' : ''}"
              type="email"
              name="email"
              placeholder="관리자 이메일을 입력하세요"
              required
              oninput={onlyEmailInput}
            />
            {#if form?.error?.email}
              <span class="text-error-500 mt-1 text-sm">{form.error.email}</span>
            {/if}
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200 {form?.error?.password ? 'input-error' : ''}"
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              required
            />
            {#if form?.error?.password}
              <span class="text-error-500 mt-1 text-sm">{form.error.password}</span>
            {/if}
          </label>

          <div class="flex justify-end text-sm">
            <button type="button" class="anchor" onclick={() => alert('비밀번호 찾기 기능은 추후 구현 예정입니다.')}>
              비밀번호 찾기
            </button>
          </div>

          <button
            type="submit"
            class="btn bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white">로그인</button
          >
        </form>
      {:else}
        <form class="space-y-4" method="POST" action="?/signup" use:enhance>
          <label class="label">
            <span>매장 선택</span>
            <select class="select h-9 px-4 {form?.error?.storeId ? 'input-error' : ''}" name="storeId" required>
              <option value="" disabled selected>선택</option>
              {#each stores as store}
                <option value={store.id} class={store.type === 'hq' ? 'pl-2 font-bold' : 'pl-2'}>
                  {store.name}
                </option>
              {/each}
            </select>
            {#if form?.error?.storeId}
              <span class="text-error-500 mt-1 text-sm">{form.error.storeId}</span>
            {/if}
          </label>

          <label class="label">
            <span>관리자 이메일</span>
            <input
              class="input placeholder:text-surface-200 {form?.error?.email ? 'input-error' : ''}"
              type="email"
              name="email"
              placeholder="관리자 이메일을 입력하세요"
              required
              oninput={onlyEmailInput}
              value="aaa@aaa.com"
            />
            {#if form?.error?.email}
              <span class="text-error-500 mt-1 text-sm">{form.error.email}</span>
            {/if}
          </label>

          <label class="label">
            <span>이름</span>
            <input
              class="input placeholder:text-surface-200 {form?.error?.name ? 'input-error' : ''}"
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              required
              value="김강남"
            />
            {#if form?.error?.name}
              <span class="text-error-500 mt-1 text-sm">{form.error.name}</span>
            {/if}
          </label>

          <label class="label">
            <span>전화번호</span>
            <div class="flex gap-2">
              <select class="select w-16 text-center {form?.error?.phone1 ? 'input-error' : ''}" name="phone1" required>
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
                class="input w-20 text-center {form?.error?.phone2 ? 'input-error' : ''}"
                type="tel"
                name="phone2"
                placeholder=""
                maxlength="4"
                required
                oninput={onlyNumberInput}
                value="1111"
              />
              <span class="self-center">-</span>
              <input
                class="input w-20 text-center {form?.error?.phone3 ? 'input-error' : ''}"
                type="tel"
                name="phone3"
                placeholder=""
                maxlength="4"
                required
                oninput={onlyNumberInput}
                value="1111"
              />
            </div>
            {#if form?.error?.phone1}
              <span class="text-error-500 mt-1 text-sm">{form.error.phone1}</span>
            {:else if form?.error?.phone2}
              <span class="text-error-500 mt-1 text-sm">{form.error.phone2}</span>
            {:else if form?.error?.phone3}
              <span class="text-error-500 mt-1 text-sm">{form.error.phone3}</span>
            {/if}
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200 {form?.error?.password ? 'input-error' : ''}"
              type="password"
              name="password"
              placeholder="8자 이상"
              minlength="8"
              required
              value="11111111"
            />
            {#if form?.error?.password}
              <span class="text-error-500 mt-1 text-sm">{form.error.password}</span>
            {/if}
          </label>
          <label class="label">
            <span>비밀번호 확인</span>
            <input
              class="input placeholder:text-surface-200 {form?.error?.confirmPassword ? 'input-error' : ''}"
              type="password"
              name="confirmPassword"
              placeholder="재입력"
              required
              value="11111111"
            />
            {#if form?.error?.confirmPassword}
              <span class="text-error-500 mt-1 text-sm">{form.error.confirmPassword}</span>
            {/if}
          </label>

          <button
            type="submit"
            class="btn bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white"
            >회원가입</button
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
