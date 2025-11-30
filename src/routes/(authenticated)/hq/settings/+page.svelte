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

<svelte:head>
  <title>매장 정보 수정</title>
</svelte:head>

<StoreForm {data} mode="edit" onSubmit={handleSuccess} onCancel={handleCancel} />
