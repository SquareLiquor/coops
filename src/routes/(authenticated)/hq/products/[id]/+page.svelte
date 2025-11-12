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

  const handleDelete = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const formData = new FormData()
      formData.append('/_action', 'delete')

      try {
        const response = await fetch('?/delete', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          alert('삭제되었습니다.')
          goto('/hq/products')
        } else {
          alert('삭제 중 오류가 발생했습니다.')
        }
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.')
      }
    }
  }
</script>

<svelte:head>
  <title>상품 수정 - 본사</title>
</svelte:head>

{#if data.form}
  <ProductForm {data} mode="edit" onSubmit={handleSubmit} onCancel={goBack} />

  <!-- 삭제 버튼을 별도로 추가 -->
  <div class="fixed right-8 bottom-8">
    <button
      class="rounded-full bg-red-500 px-6 py-3 font-medium text-white shadow-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
      onclick={handleDelete}
    >
      삭제
    </button>
  </div>
{:else}
  <!-- 로딩 상태 -->
  <div class="flex h-full items-center justify-center">
    <span class="loader-giant"></span>
  </div>
{/if}
