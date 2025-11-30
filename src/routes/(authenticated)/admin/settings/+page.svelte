<script lang="ts">
  import { goto } from '$app/navigation'
  import StoreForm from '$lib/components/form/hq/StoreForm.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const handleSuccess = () => {
    goto('/admin')
  }

  const handleCancel = () => {
    goto('/admin')
  }
</script>

<svelte:head>
  <title>매장 정보 수정 - 관리자</title>
</svelte:head>

<div class="flex h-full flex-col">
  <StoreForm {data} mode="edit" onSubmit={handleSuccess} onCancel={handleCancel} />
</div>
