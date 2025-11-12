<script lang="ts">
  import { goto } from '$app/navigation'
  import ProductForm from '$lib/components/form/hq/ProductForm.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const goBack = () => {
    goto('/hq/products')
  }

  const handleSubmit = async () => {
    await goto('/hq/products')
  }
</script>

<svelte:head>
  <title>상품 수정 - 본사</title>
</svelte:head>

{#if data.form}
  <ProductForm {data} mode="edit" onSubmit={handleSubmit} onCancel={goBack} />
{:else}
  <!-- 로딩 상태 -->
  <div class="flex h-full items-center justify-center">
    <span class="loader-giant"></span>
  </div>
{/if}
