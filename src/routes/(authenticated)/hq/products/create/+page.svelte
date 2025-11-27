<script lang="ts">
  import { goto } from '$app/navigation'
  import ProductForm from '$lib/components/form/hq/ProductForm.svelte'
  import Alert from '$lib/components/ui/Alert.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  let showAlert = $state(false)
  let alertConfig = $state({
    type: 'success' as 'info' | 'error' | 'warning' | 'success',
    title: '',
    message: '',
  })

  const handleSubmit = async () => {
    alertConfig = {
      type: 'success',
      title: '등록 완료',
      message: '상품 등록을 성공했습니다.',
    }
    showAlert = true
  }

  const handleError = async () => {
    alertConfig = {
      type: 'error',
      title: '등록 실패',
      message: '상품 등록 중 오류가 발생했습니다.',
    }
    showAlert = true
  }

  const handleCancel = () => {
    goto('/hq/products')
  }

  const handleAlertClose = () => {
    showAlert = false
    if (alertConfig.type === 'success') {
      goto('/hq/products')
    }
  }
</script>

<svelte:head>
  <title>상품 등록</title>
</svelte:head>

<ProductForm {data} mode="create" onSubmit={handleSubmit} onError={handleError} onCancel={handleCancel} />

{#if showAlert}
  <Alert
    type={alertConfig.type}
    mode="alert"
    title={alertConfig.title}
    message={alertConfig.message}
    onClose={handleAlertClose}
    onConfirm={handleAlertClose}
  />
{/if}
