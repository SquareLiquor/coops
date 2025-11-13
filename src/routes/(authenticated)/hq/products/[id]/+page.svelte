<script lang="ts">
  import { goto } from '$app/navigation'
  import ProductForm from '$lib/components/form/hq/ProductForm.svelte'
  import { toaster } from '$lib/utils'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    toaster.success({
      description: '상품 정보 수정을 성공했습니다.',
      duration: 5000,
      action: {
        label: '확인',
        onClick: () => goto('/hq/products'),
      },
    })
  }
  const handleError = async () => {
    toaster.error({
      description: '상품 정보 수정 중 오류가 발생했습니다.',
      duration: 5000,
    })
  }
  const handleCancel = () => {
    goto('/hq/products')
  }
</script>

<svelte:head>
  <title>상품 수정</title>
</svelte:head>

{#if data.form}
  <ProductForm {data} mode="edit" onSubmit={handleSubmit} onError={handleError} onCancel={handleCancel} />
{:else}
  <!-- 로딩 상태 -->
  <div class="flex h-full items-center justify-center">
    <span class="loader-giant"></span>
  </div>
{/if}
