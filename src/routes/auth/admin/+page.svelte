<script lang="ts">
  import type { StorePublic } from '$lib/types/store.js'
  import { onlyEmailInput, onlyNumberInput } from '$lib/utils/input'

  let { data, form } = $props()

  let isSignUp = $state(false)
  const stores: StorePublic[] = data.stores || []
</script>

<!-- 가맹점/본사 관리자 로그인 페이지 - Skeleton UI 컨셉 -->
<div class="bg-surface-100 flex min-h-screen items-center justify-center p-4">
  <div class="w-full max-w-md">
    <!-- Main Content Card -->
    <div class="card preset-outlined-surface-200-800 bg-surface-50 space-y-5 p-8 shadow-lg">
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
        <!-- Login Error Display -->
        {#if form?.error && !isSignUp}
          <div class="alert variant-filled-error mb-4">
            <div class="alert-message">
              <p>{form.error}</p>
            </div>
          </div>
        {/if}

        <form class="space-y-4" method="POST" action="?/signin">
          <label class="label">
            <span>관리자 이메일</span>
            <input
              class="input placeholder:text-surface-200 {form?.errors?.email ? 'input-error' : ''}"
              type="email"
              name="email"
              placeholder="관리자 이메일을 입력하세요"
              required
              oninput={onlyEmailInput}
            />
            {#if form?.errors?.email}
              <span class="text-error-500 mt-1 text-sm">{form.errors.email}</span>
            {/if}
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200 {form?.errors?.password ? 'input-error' : ''}"
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              required
            />
            {#if form?.errors?.password}
              <span class="text-error-500 mt-1 text-sm">{form.errors.password}</span>
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
        <!-- Signup Error Display -->
        {#if form?.error && isSignUp}
          <div class="alert variant-filled-error mb-4">
            <div class="alert-message">
              <p>{form.error}</p>
            </div>
          </div>
        {/if}

        <!-- Signup Success Display -->
        {#if form?.success && isSignUp}
          <div class="alert variant-filled-success mb-4">
            <div class="alert-message">
              <p>{form.message || '회원가입이 완료되었습니다.'}</p>
            </div>
          </div>
        {/if}

        <form class="space-y-4" method="POST" action="?/signup">
          <label class="label">
            <span>매장 선택</span>
            <select class="select h-9 px-4 {form?.errors?.storeId ? 'input-error' : ''}" name="store" required>
              <option value="" disabled selected>선택</option>
              {#each stores as store}
                <option
                  value={[store.type, store.id].join('|')}
                  class={store.type === 'hq' ? 'pl-2 font-bold' : 'pl-2'}
                >
                  {store.name}
                </option>
              {/each}
            </select>
            {#if form?.errors?.storeId}
              <span class="text-error-500 mt-1 text-sm">{form.errors.storeId}</span>
            {/if}
          </label>

          <label class="label">
            <span>관리자 이메일</span>
            <input
              class="input placeholder:text-surface-200 {form?.errors?.email ? 'input-error' : ''}"
              type="email"
              name="email"
              placeholder="관리자 이메일을 입력하세요"
              required
              oninput={onlyEmailInput}
              value="aaa@aaa.com"
            />
            {#if form?.errors?.email}
              <span class="text-error-500 mt-1 text-sm">{form.errors.email}</span>
            {/if}
          </label>

          <label class="label">
            <span>이름</span>
            <input
              class="input placeholder:text-surface-200 {form?.errors?.name ? 'input-error' : ''}"
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              required
              value="김강남"
            />
            {#if form?.errors?.name}
              <span class="text-error-500 mt-1 text-sm">{form.errors.name}</span>
            {/if}
          </label>

          <label class="label">
            <span>전화번호</span>
            <div class="flex gap-2">
              <select
                class="select w-16 text-center {form?.errors?.phone1 ? 'input-error' : ''}"
                name="phone1"
                required
              >
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
                class="input w-20 text-center {form?.errors?.phone2 ? 'input-error' : ''}"
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
                class="input w-20 text-center {form?.errors?.phone3 ? 'input-error' : ''}"
                type="tel"
                name="phone3"
                placeholder=""
                maxlength="4"
                required
                oninput={onlyNumberInput}
                value="1111"
              />
            </div>
            {#if form?.errors?.phone1}
              <span class="text-error-500 mt-1 text-sm">{form.errors.phone1}</span>
            {:else if form?.errors?.phone2}
              <span class="text-error-500 mt-1 text-sm">{form.errors.phone2}</span>
            {:else if form?.errors?.phone3}
              <span class="text-error-500 mt-1 text-sm">{form.errors.phone3}</span>
            {/if}
          </label>

          <label class="label">
            <span>비밀번호</span>
            <input
              class="input placeholder:text-surface-200 {form?.errors?.password ? 'input-error' : ''}"
              type="password"
              name="password"
              placeholder="8자 이상"
              minlength="8"
              required
              value="11111111"
            />
            {#if form?.errors?.password}
              <span class="text-error-500 mt-1 text-sm">{form.errors.password}</span>
            {/if}
          </label>
          <label class="label">
            <span>비밀번호 확인</span>
            <input
              class="input placeholder:text-surface-200 {form?.errors?.confirmPassword ? 'input-error' : ''}"
              type="password"
              name="confirmPassword"
              placeholder="재입력"
              required
              value="11111111"
            />
            {#if form?.errors?.confirmPassword}
              <span class="text-error-500 mt-1 text-sm">{form.errors.confirmPassword}</span>
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
