<script lang="ts">
  import { goto } from '$app/navigation'
  import ProductForm from '$lib/components/hq/ProductForm.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    await goto('/hq/products')
  }

  const handleCancel = () => {
    goto('/hq/products')
  }
</script>

<svelte:head>
  <title>상품 등록 - 본사</title>
</svelte:head>

<ProductForm {data} mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
