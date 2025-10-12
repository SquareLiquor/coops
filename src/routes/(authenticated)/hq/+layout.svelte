<script lang="ts">
  import HQSidebar from '$lib/components/HQSidebar.svelte';

  // Mobile menu toggle
  let mobileMenuOpen = false;
</script>

<div class="flex h-screen bg-surface-100">
  <!-- Mobile menu button -->
  <button
    class="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-white shadow-sm border border-gray-200"
    on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
    aria-label="메뉴 토글"
  >
    <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
      />
    </svg>
  </button>

  <!-- HQSidebar Component -->
  <HQSidebar {mobileMenuOpen} on:closeMobile={() => (mobileMenuOpen = false)} />

  <!-- Overlay for mobile -->
  {#if mobileMenuOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
      on:click={() => (mobileMenuOpen = false)}
      role="button"
      tabindex="0"
    ></div>
  {/if}

  <!-- Main content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Main content area -->
    <main class="flex-1 overflow-auto bg-surface-50 p-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
        <slot />
      </div>
    </main>
  </div>
</div>
