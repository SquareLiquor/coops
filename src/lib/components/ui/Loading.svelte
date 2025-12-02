<script lang="ts">
  let { show = true }: { show?: boolean } = $props()
</script>

{#if show}
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
    <span class="loader-giant"></span>
  </div>
{/if}
