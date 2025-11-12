<script lang="ts">
  import { goto } from '$app/navigation'
  import CoopForm from '$lib/components/form/admin/CoopForm.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const goBack = () => {
    goto('/admin/coops')
  }

  const handleSubmit = async () => {
    await goto('/admin/coops')
  }
</script>

<svelte:head>
  <title>공동구매 수정 - 가맹점</title>
</svelte:head>

{#if data.form}
  <CoopForm {data} mode="edit" onSubmit={handleSubmit} onCancel={goBack} />
{:else}
  <!-- 로딩 상태 -->
  <div class="flex h-full items-center justify-center">
    <span class="loader-giant"></span>
  </div>
{/if}
