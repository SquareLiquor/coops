<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import Notifications from '$lib/components/Notifications.svelte'
  import { initAuthListener, syncAuthFromUser } from '$lib/stores'
  import { onMount } from 'svelte'
  import '../app.css'

  let { data, children } = $props()
  let { user } = data

  // 서버 세션 정보 변경 시에만 store 동기화 (SSR 지원 + 효율적)
  $effect(() => {
    syncAuthFromUser(user)
  })

  onMount(() => {
    // initAuthListener를 즉시 호출하여 실시간 인증 상태 감지
    const unsubscribe = initAuthListener()

    return () => {
      // 컴포넌트 정리 시 auth listener도 정리
      if (unsubscribe) unsubscribe()
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="from-surface-50/50 to-surface-50/10 min-h-screen bg-gradient-to-br">
  {@render children?.()}
  <Notifications />
  <!-- </div> -->
</div>
