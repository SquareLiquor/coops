<script lang="ts">
  import { goto } from '$app/navigation'
  import CoopForm from '$lib/components/form/admin/CoopForm.svelte'
  import { showError, showSuccess } from '$lib/stores'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    showSuccess({
      message: '상품 정보 수정을 성공했습니다.',
      onConfirm: () => goto('/admin/coops'),
    })
  }

  const handleError = async () => {
    showError({
      message: '상품 정보 수정 중 오류가 발생했습니다.',
    })
  }

  const handleCancel = () => {
    goto('/admin/coops')
  }
</script>

<CoopForm {data} mode="edit" onSubmit={handleSubmit} onError={handleError} onCancel={handleCancel} />
