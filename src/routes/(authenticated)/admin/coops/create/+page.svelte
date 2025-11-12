<script lang="ts">
  import { goto } from '$app/navigation'
  import CoopForm from '$lib/components/form/admin/CoopForm.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    await goto('/admin/coops')
  }

  const handleCancel = () => {
    goto('/admin/coops')
  }
</script>

<svelte:head>
  <title>공동구매 등록 - 가맹점</title>
</svelte:head>

<CoopForm {data} mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
