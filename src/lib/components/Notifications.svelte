<script lang="ts">
  import { notifications, removeNotification } from '$lib/stores/notifications.svelte'
</script>

<div class="notifications">
  {#each notifications as n (n.id)}
    <div class="notification {n.type}">
      {n.message}
      <button onclick={() => removeNotification(n.id)}>×</button>
    </div>
  {/each}
</div>
