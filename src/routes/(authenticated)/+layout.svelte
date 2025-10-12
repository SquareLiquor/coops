<script lang="ts">
  let { children } = $props();
</script>

<!-- 모바일 컨테이너 -->
<div class="mobile-container">
  <main>
    {@render children?.()}
  </main>
</div>
