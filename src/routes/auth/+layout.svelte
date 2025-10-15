<script lang="ts">
  import Notifications from '$lib/components/Notifications.svelte'

  let { children } = $props()
</script>

<!-- Auth Layout -->
<div class="min-h-screen">
  <!-- Notifications -->
  <Notifications />

  {@render children?.()}
</div>

<!-- <style>
  :global(.notifications) {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 24rem;
  }

  :global(.notification) {
    @apply bg-surface-50 flex items-center justify-between rounded-lg border-l-4 p-4 shadow-lg;
    animation: slideIn 0.3s ease-out;
  }

  :global(.notification.success) {
    @apply border-success-500 bg-success-50 text-success-900;
  }

  :global(.notification.error) {
    @apply border-error-500 bg-error-50 text-error-900;
  }

  :global(.notification.info) {
    @apply border-primary-500 bg-primary-50 text-primary-900;
  }

  :global(.notification button) {
    @apply ml-4 text-lg leading-none font-bold text-current opacity-70 hover:opacity-100;
    background: none;
    border: none;
    cursor: pointer;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style> -->
