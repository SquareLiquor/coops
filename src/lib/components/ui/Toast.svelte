<script lang="ts">
  import { toaster } from '$lib/utils'
  import { CircleAlert, CircleCheck, Info, TriangleAlert } from '@lucide/svelte'
  import { Toast } from '@skeletonlabs/skeleton-svelte'
</script>

<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast {toast} class="text-white">
      {#if toast.type === 'success'}
        {@render success()}
      {:else if toast.type === 'warning'}
        {@render warning()}
      {:else if toast.type === 'error'}
        {@render error()}
      {:else}
        {@render info()}
      {/if}
      <Toast.Message>
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Description>{@html toast.description}</Toast.Description>
      </Toast.Message>
      {#if toast.action}
        <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
      {/if}
      <Toast.CloseTrigger />
    </Toast>
  {/snippet}
</Toast.Group>

{#snippet info()}
  <Info />
{/snippet}

{#snippet success()}
  <CircleCheck />
{/snippet}

{#snippet warning()}
  <TriangleAlert />
{/snippet}

{#snippet error()}
  <CircleAlert />
{/snippet}
