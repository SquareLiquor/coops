<script lang="ts">
  let {
    show = true,
    title = '데이터가 없습니다',
    description,
  }: {
    show?: boolean
    title?: string
    description?: string
  } = $props()
</script>

{#if show}
  <div class="py-12 text-center">
    <div class="flex flex-col items-center justify-center">
      <svg class="mb-2 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {#if description}
        <p class="mt-1 text-xs text-gray-500">{description}</p>
      {/if}
    </div>
  </div>
{/if}
