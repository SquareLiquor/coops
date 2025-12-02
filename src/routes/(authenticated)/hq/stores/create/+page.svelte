<script lang="ts">
  import { goto } from '$app/navigation'
  import StoreForm from '$lib/components/form/hq/StoreForm.svelte'
  import { showError, showSuccess } from '$lib/stores'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const handleSubmit = async () => {
    showSuccess({
      title: '등록 완료',
      message: '매장 등록을 성공했습니다.',
      onConfirm: () => goto('/hq/stores'),
    })
  }

  const handleError = async () => {
    showError({
      title: '등록 실패',
      message: '매장 등록 중 오류가 발생했습니다.',
    })
  }

  const handleCancel = () => {
    goto('/hq/stores')
  }
</script>

<StoreForm {data} mode="create" onSubmit={handleSubmit} onError={handleError} onCancel={handleCancel} />
