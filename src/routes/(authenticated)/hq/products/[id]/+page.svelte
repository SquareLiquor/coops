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
      title: '수정 완료',
      message: '상품 정보 수정을 성공했습니다.',
    }
    showAlert = true
  }

  const handleError = async () => {
    alertConfig = {
      type: 'error',
      title: '수정 실패',
      message: '상품 정보 수정 중 오류가 발생했습니다.',
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
