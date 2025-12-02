<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    title: string
    actions?: Snippet
  }

  let { title, actions }: Props = $props()
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
  <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
  {#if actions}
    <div class="flex items-center gap-2">
      {@render actions()}
    </div>
  {/if}
</div>
