<script lang="ts">
  import { buildForm } from '$lib/builders/form.builder'
  import Alert from '$lib/components/ui/Alert.svelte'
  import { PurchaseRejectSchema } from '$lib/schemas'
  import type { PurchaseEntity } from '$lib/types'
  import { X } from '@lucide/svelte'
  import { getContext } from 'svelte'
  import type { SuperValidated } from 'sveltekit-superforms'

  interface Props {
    purchase: PurchaseEntity
    rejectForm: SuperValidated<any>
    onClose: () => void
  }

  let { purchase, rejectForm, onClose }: Props = $props()

  const refreshPurchases = getContext<() => Promise<void>>('refreshPurchases')
  let alert = $state<{ type: 'success' | 'error'; message: string } | null>(null)

  rejectForm.data.id = purchase.id
  rejectForm.data.rejectionReason = ''

  const { form, enhance, errors, constraints, submitting } = buildForm({
    form: rejectForm,
    schema: PurchaseRejectSchema,
    resultHandler: {
      handleSuccess: async (result) => {
        alert = {
          type: 'success',
          message: result.data?.message || '발주가 거부되었습니다.',
        }
        setTimeout(() => {
          refreshPurchases?.()
          onClose()
        }, 1500)
      },
      handleFailure: async (result) => {
        alert = {
          type: 'error',
          message: result.data?.message || '발주 거부 중 오류가 발생했습니다.',
        }
      },
    },
    options: {
      resetForm: false,
      invalidateAll: false,
    },
  })
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <form method="POST" action="?/reject" use:enhance>
    <section
      class="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      role="document"
    >
      {#if $submitting}
        <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
          <span class="loader-giant"></span>
        </div>
      {/if}

      {#if alert}
        <Alert
          title={alert.type === 'success' ? '성공' : '오류'}
          type={alert.type}
          message={alert.message}
          onClose={() => (alert = null)}
        />
      {/if}

      <!-- Hidden input -->
      <input type="hidden" name="id" value={$form.id} />

      <!-- 헤더 -->
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <h2 class="text-xl font-bold text-gray-900">발주 거부</h2>
        <button
          type="button"
          class="flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          onclick={onClose}
          aria-label="닫기"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- 스크롤 가능한 본문 -->
      <div class="flex-1 overflow-y-auto px-6 pt-6 pb-6">
        <div class="space-y-4">
          <!-- 발주 정보 -->
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <dl class="space-y-2.5">
              <div class="flex items-start justify-between">
                <dt class="text-xs font-medium text-gray-500">매장</dt>
                <dd class="text-sm font-medium text-gray-900">{purchase.storeName}</dd>
              </div>
              <div class="flex items-start justify-between">
                <dt class="text-xs font-medium text-gray-500">상품</dt>
                <dd class="text-sm font-medium text-gray-900">{purchase.originProductName}</dd>
              </div>
              <div class="flex items-start justify-between">
                <dt class="text-xs font-medium text-gray-500">수량</dt>
                <dd class="text-sm font-medium text-gray-900">{purchase.quantity} {purchase.unit}</dd>
              </div>
            </dl>
          </div>

          <!-- 거부 사유 -->
          <div>
            <label for="rejectionReason" class="mb-1.5 block text-sm font-medium text-gray-700">
              거부 사유 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="rejectionReason"
              name="rejectionReason"
              rows="4"
              class="focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              placeholder="거부 사유를 입력해주세요"
              bind:value={$form.rejectionReason}
              {...$constraints.rejectionReason}
            ></textarea>
            {#if $errors.rejectionReason}
              <p class="mt-1 text-xs text-red-600">{$errors.rejectionReason}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- 푸터 -->
      <div class="flex items-center justify-between border-t border-gray-200 px-6 py-3">
        <button
          type="button"
          class="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
          onclick={onClose}
          disabled={$submitting}
        >
          취소
        </button>
        <button
          type="submit"
          class="bg-error-500 hover:bg-error-600 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={$submitting || !$form.rejectionReason}
        >
          거부
        </button>
      </div>
    </section>
  </form>
</div>
