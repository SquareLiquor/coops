<script lang="ts">
  import ConsumerHeader from '$lib/components/ConsumerHeader.svelte'

  let { children } = $props()
</script>

<!-- 모바일 컨테이너 -->
<div class="mobile-container">
  <ConsumerHeader />

  <main>
    {@render children?.()}
  </main>
</div>
