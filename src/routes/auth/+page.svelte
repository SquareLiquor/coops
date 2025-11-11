<script>
  import { enhance } from '$app/forms'
</script>

<div class="flex min-h-screen items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="card preset-outlined-surface-200-800 bg-surface-50/10 space-y-6 p-8 shadow-lg">
      <header class="space-y-2 text-center">
        <h2 class="h3 font-bold">카카오로 시작하기</h2>
        <p class="opacity-75">카카오 계정으로 간편하게 시작하세요</p>
      </header>

      <form method="POST" use:enhance>
        <button
          formaction="?/signin_kakao"
          class="btn w-full rounded-lg bg-yellow-400 py-3 font-medium text-black shadow-md hover:bg-yellow-500"
        >
          <svg class="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.93 5.31 4.78 6.74l-1.2 4.41c-.14.51.33.94.8.72L11.96 20C11.97 20 11.99 20 12 20c5.52 0 10-3.58 10-8S17.52 3 12 3z"
            />
          </svg>
          <span>카카오로 시작하기</span>
        </button>
      </form>

      <hr class="hr-divider" />

      <div class="text-center">
        <p class="text-surface-500 text-xs">로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.</p>
      </div>
    </div>
  </div>
</div>
