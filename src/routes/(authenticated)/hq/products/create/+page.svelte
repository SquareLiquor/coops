<script lang="ts">
  import { goto } from '$app/navigation'
  import ProductForm from '$lib/components/form/hq/ProductForm.svelte'
  import { toaster } from '$lib/utils'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    toaster.success({
      description: '상품 등록을 성공했습니다.',
      duration: Infinity,
      action: {
        label: '확인',
        onClick: () => goto('/hq/products'),
      },
    })
  }

  const handleError = async () => {
    toaster.error({
      description: '상품 등록 중 오류가 발생했습니다.',
      duration: 5000,
    })
  }

  const handleCancel = () => {
    goto('/hq/products')
  }
</script>

<svelte:head>
  <title>상품 등록</title>
</svelte:head>

<ProductForm {data} mode="create" onSubmit={handleSubmit} onError={handleError} onCancel={handleCancel} />
