<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import Notifications from '$lib/components/Notifications.svelte'
  import { setupAuthStateListener, syncUserToAuthState } from '$lib/stores'
  import { onMount } from 'svelte'
  import '../app.css'

  let { data, children } = $props()
  let { session, user } = data

  // 서버 세션 정보 변경 시에만 store 동기화 (SSR 지원 + 효율적)
  $effect(() => {
    syncUserToAuthState(user, session)
  })

  onMount(() => {
    const cleanup = setupAuthStateListener()

    return () => {
      if (cleanup) cleanup()
    }
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="from-surface-50/50 to-surface-50/10 min-h-screen bg-gradient-to-br">
  {@render children?.()}
  <Notifications />
</div>
