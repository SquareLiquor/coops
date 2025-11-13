<script lang="ts">
  import { goto } from '$app/navigation'
  import CoopForm from '$lib/components/form/admin/CoopForm.svelte'
  import { toaster } from '$lib/utils'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    toaster.success({
      description: '상품 등록을 성공했습니다.',
      duration: Infinity,
      action: {
        label: '확인',
        onClick: () => goto('/admin/coops'),
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
    goto('/admin/coops')
  }
</script>

<svelte:head>
  <title>공동구매 등록 - 가맹점</title>
</svelte:head>

<CoopForm {data} mode="create" onSubmit={handleSubmit} onError={handleError} onCancel={handleCancel} />
