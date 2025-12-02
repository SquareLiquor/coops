<script lang="ts">
  import { goto } from '$app/navigation'
  import CoopForm from '$lib/components/form/admin/CoopForm.svelte'
  import { showError, showSuccess } from '$lib/stores'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    showSuccess({
      title: '등록 완료',
      message: '상품 등록을 성공했습니다.',
      onConfirm: () => goto('/admin/coops'),
    })
  }

  const handleError = async () => {
    showError({
      title: '등록 실패',
      message: '상품 등록 중 오류가 발생했습니다.',
    })
  }

  const handleCancel = () => {
    goto('/admin/coops')
  }
</script>

<CoopForm {data} mode="create" onSubmit={handleSubmit} onError={handleError} onCancel={handleCancel} />
