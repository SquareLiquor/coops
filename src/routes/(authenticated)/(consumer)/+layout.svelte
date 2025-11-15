<script lang="ts">
  import ConsumerHeader from '$lib/components/ConsumerHeader.svelte'
  import Toast from '$lib/components/ui/Toast.svelte'

  let { children } = $props()

  // PC 환경에서만 확대(줌) 방지 meta 태그 추가
  if (typeof window !== 'undefined') {
    const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isDesktop) {
      if (!document.querySelector('meta[name="viewport"][content*="user-scalable=no"]')) {
        const meta = document.createElement('meta')
        meta.name = 'viewport'
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        document.head.appendChild(meta)
      }
    }
  }
</script>

<svelte:head>
  <title>공동구매 소비자</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
</svelte:head>

<!-- 모바일 컨테이너 -->
<div class="mobile-container">
  <ConsumerHeader />

  <main>
    {@render children?.()}
    <Toast />
  </main>
</div>
