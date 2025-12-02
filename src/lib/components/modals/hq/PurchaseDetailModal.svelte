<script lang="ts">
  import { buildForm } from '$lib/builders/form.builder'
  import PurchaseRejectModal from '$lib/components/modals/hq/PurchaseRejectModal.svelte'
  import { PurchaseStatusChangeSchema } from '$lib/schemas'
  import { showError, showSuccess } from '$lib/stores'
  import { PurchaseStatus, type PurchaseEntity } from '$lib/types'
  import { formatCurrency } from '$lib/utils'
  import { equalsEnum } from '$lib/utils/enum'
  import { ChevronDown, ChevronUp, X } from '@lucide/svelte'
  import dayjs from 'dayjs'
  import { getContext } from 'svelte'
  import type { SuperValidated } from 'sveltekit-superforms'

  interface Props {
    purchase: PurchaseEntity
    actionForm: SuperValidated<any>
    rejectForm: SuperValidated<any>
    onClose: () => void
  }

  let { purchase, actionForm, rejectForm, onClose }: Props = $props()

  const refreshPurchases = getContext<() => Promise<void>>('refreshPurchases')
  let showRejectModal = $state(false)
  let isBasicInfoOpen = $state(false)
  let isPriceInfoOpen = $state(false)
  let isDateInfoOpen = $state(false)

  actionForm.data.id = purchase.id

  const {
    form,
    enhance: actionEnhance,
    submitting: actionSubmitting,
  } = buildForm({
    form: actionForm,
    schema: PurchaseStatusChangeSchema,
    resultHandler: {
      handleSuccess: async (result) => {
        showSuccess({
          message: result.data?.message || '처리되었습니다.',
          onConfirm: () => {
            refreshPurchases?.()
            onClose()
          },
        })
      },
      handleFailure: async (result) => {
        showError({
          message: result.data?.message || '처리 중 오류가 발생했습니다.',
        })
      },
    },
    options: {
      resetForm: false,
      invalidateAll: false,
    },
  })

  const handleRejectModalClose = () => {
    showRejectModal = false
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && !showRejectModal && onClose()}
  onclick={(e) => e.target === e.currentTarget && !showRejectModal && onClose()}
>
  <section
    class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
    role="document"
  >
    {#if $actionSubmitting}
      <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
        <span class="loader-giant"></span>
      </div>
    {/if}

    <div class="flex items-center justify-between border-b border-gray-200 px-6 py-5">
      <h2 class="text-xl font-bold text-gray-900">발주 상세 정보</h2>
      <button
        type="button"
        class="flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
        onclick={onClose}
        aria-label="닫기"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 pt-6 pb-6">
      <div class="space-y-4">
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
            onclick={() => (isBasicInfoOpen = !isBasicInfoOpen)}
          >
            <div class="flex-1">
              <div class="mb-1 text-sm font-semibold text-gray-700">기본 정보</div>
              {#if !isBasicInfoOpen}
                <div class="text-xs text-gray-500">
                  {purchase.storeName}, {purchase.originProductName}
                </div>
              {/if}
            </div>
            {#if isBasicInfoOpen}
              <ChevronUp class="h-4 w-4 text-gray-500" />
            {:else}
              <ChevronDown class="h-4 w-4 text-gray-500" />
            {/if}
          </button>
          {#if isBasicInfoOpen}
            <div class="border-t border-gray-200 bg-gray-50 px-5 py-4">
              <dl class="space-y-2.5">
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">발주 ID</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.id}</dd>
                </div>
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">매장</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.storeName}</dd>
                </div>
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">상품명</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.originProductName}</dd>
                </div>
                {#if purchase.categoryName}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">카테고리</dt>
                    <dd class="text-sm text-gray-900">{purchase.categoryName}</dd>
                  </div>
                {/if}
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">발주 상태</dt>
                  <dd
                    class={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${purchase.status?.badgeClass}`}
                  >
                    {purchase.status?.label || '-'}
                  </dd>
                </div>
              </dl>
            </div>
          {/if}
        </div>

        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
            onclick={() => (isPriceInfoOpen = !isPriceInfoOpen)}
          >
            <div class="flex-1">
              <div class="mb-1 text-sm font-semibold text-gray-700">수량 및 가격</div>
              {#if !isPriceInfoOpen}
                <div class="text-xs text-gray-500">
                  총액:
                  <span class="text-primary-600 font-medium">
                    {formatCurrency(purchase.totalPrice)}
                  </span>
                </div>
              {/if}
            </div>
            {#if isPriceInfoOpen}
              <ChevronUp class="h-4 w-4 text-gray-500" />
            {:else}
              <ChevronDown class="h-4 w-4 text-gray-500" />
            {/if}
          </button>
          {#if isPriceInfoOpen}
            <div class="border-t border-gray-200 bg-blue-50 px-5 py-4">
              <dl class="space-y-2.5">
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">발주 수량</dt>
                  <dd class="text-sm font-medium text-gray-900">{purchase.quantity} {purchase.unit}</dd>
                </div>
                <div class="flex items-start justify-between">
                  <dt class="text-xs font-medium text-gray-500">단가</dt>
                  <dd class="text-sm text-gray-900">{formatCurrency(purchase.originProductPrice)}</dd>
                </div>
                <div class="flex items-start justify-between border-t border-gray-300 pt-2">
                  <dt class="text-xs font-semibold text-gray-900">발주 총액</dt>
                  <dd class="text-primary-600 text-base font-bold">{formatCurrency(purchase.totalPrice)}</dd>
                </div>
              </dl>
            </div>
          {/if}
        </div>

        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
            onclick={() => (isDateInfoOpen = !isDateInfoOpen)}
          >
            <div class="flex-1">
              <div class="mb-1 text-sm font-semibold text-gray-700">일자 정보</div>
              {#if !isDateInfoOpen}
                <div class="text-xs text-gray-500">
                  {#if purchase.requestedDate}
                    요청일: {dayjs(purchase.requestedDate).format('YYYY-MM-DD')}
                  {/if}
                </div>
              {/if}
            </div>
            {#if isDateInfoOpen}
              <ChevronUp class="h-4 w-4 text-gray-500" />
            {:else}
              <ChevronDown class="h-4 w-4 text-gray-500" />
            {/if}
          </button>
          {#if isDateInfoOpen}
            <div class="border-t border-gray-200 bg-gray-50 px-5 py-4">
              <dl class="space-y-2.5">
                {#if purchase.requestedDate}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">요청일</dt>
                    <dd class="text-sm text-gray-900">{dayjs(purchase.requestedDate).format('YYYY-MM-DD HH:mm')}</dd>
                  </div>
                {/if}
                {#if purchase.approvedDate}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">승인일</dt>
                    <dd class="text-sm text-gray-900">{dayjs(purchase.approvedDate).format('YYYY-MM-DD HH:mm')}</dd>
                  </div>
                {/if}
                {#if purchase.shippedDate}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">출고일</dt>
                    <dd class="text-sm text-gray-900">{dayjs(purchase.shippedDate).format('YYYY-MM-DD HH:mm')}</dd>
                  </div>
                {/if}
                {#if purchase.rejectedDate}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">거부일</dt>
                    <dd class="text-sm text-gray-900">{dayjs(purchase.rejectedDate).format('YYYY-MM-DD HH:mm')}</dd>
                  </div>
                {/if}
                {#if purchase.cancelledDate}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">취소일</dt>
                    <dd class="text-sm text-gray-900">{dayjs(purchase.cancelledDate).format('YYYY-MM-DD HH:mm')}</dd>
                  </div>
                {/if}
              </dl>
            </div>
          {/if}
        </div>

        {#if equalsEnum(PurchaseStatus.REJECTED, purchase.status) && purchase.rejectionReason}
          <div class="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 class="mb-2 text-sm font-semibold text-red-900">거부 사유</h3>
            <p class="text-sm text-red-800">{purchase.rejectionReason}</p>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-gray-200 px-6 py-3">
      <button
        type="button"
        class="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
        onclick={onClose}
        disabled={$actionSubmitting}
      >
        닫기
      </button>
      <div class="flex items-center gap-2">
        {#if purchase.approvable}
          <form method="POST" use:actionEnhance>
            <input type="hidden" name="id" value={$form.id} />
            <button
              type="submit"
              formaction="?/approve"
              class="bg-success-500 hover:bg-success-600 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onclick={(e) => !confirm('발주를 승인하시겠습니까?') && e.preventDefault()}
              disabled={$actionSubmitting}
            >
              승인
            </button>
          </form>
        {/if}

        {#if purchase.rejectable}
          <button
            type="button"
            class="bg-error-500 hover:bg-error-600 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors focus:outline-none"
            onclick={() => (showRejectModal = true)}
          >
            거부
          </button>
        {/if}

        {#if purchase.shippable}
          <form method="POST" use:actionEnhance>
            <input type="hidden" name="id" value={$form.id} />
            <button
              type="submit"
              formaction="?/ship"
              class="bg-primary-600 hover:bg-primary-700 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onclick={(e) => !confirm('발주를 출고 처리하시겠습니까?') && e.preventDefault()}
              disabled={$actionSubmitting}
            >
              출고
            </button>
          </form>
        {/if}
      </div>
    </div>
  </section>
</div>

{#if showRejectModal}
  <PurchaseRejectModal {purchase} {rejectForm} onClose={handleRejectModalClose} />
{/if}
