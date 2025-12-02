<script lang="ts">
  import { goto } from '$app/navigation'
  import StoreForm from '$lib/components/form/hq/StoreForm.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  function handleSuccess() {
    goto('/hq')
  }

  function handleCancel() {
    goto('/hq')
  }
</script>

<StoreForm {data} mode="edit" onSubmit={handleSuccess} onCancel={handleCancel} />
