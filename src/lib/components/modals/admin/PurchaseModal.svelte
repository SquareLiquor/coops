<script lang="ts">
  import { buildForm } from '$lib/builders/form.builder'
  import Alert from '$lib/components/ui/Alert.svelte'
  import { PurchaseCreateSchema, PurchaseUpdateSchema } from '$lib/schemas'
  import { PurchaseStatus } from '$lib/types'
  import { formatCurrency, formatNumberWithCommas } from '$lib/utils'
  import { equalsEnum } from '$lib/utils/enum'
  import { ChevronDown, ChevronUp, X } from '@lucide/svelte'
  import { getContext } from 'svelte'

  let { purchase, createForm, updateForm, onClose, mode = 'create' } = $props()

  let isOriginInfoOpen = $state(false)
  let isSalesInfoOpen = $state(false)
  const updatePurchases = getContext<() => Promise<void>>('updatePurchases')
  let alert = $state<{ type: 'success' | 'error'; message: string } | null>(null)

  const isEditMode = mode === 'edit' && !!purchase.id
  // 재신청 모드: 기존 id가 있고 reRequestable이면 update로 처리
  const isReRequestMode = mode === 'create' && !!purchase.id && purchase.reRequestable
  // View 모드: 승인, 출고, 입고 상태에서는 보기 전용
  const isViewMode =
    purchase.status &&
    (equalsEnum(PurchaseStatus.APPROVED, purchase.status) ||
      equalsEnum(PurchaseStatus.DELIVERY_STARTED, purchase.status) ||
      equalsEnum(PurchaseStatus.DELIVERED, purchase.status))
  const formAction = isEditMode || isReRequestMode ? '?/update' : '?/create'

  // Initialize form data based on mode
  if (isEditMode || isReRequestMode || isViewMode) {
    updateForm.data.id = purchase.id
    updateForm.data.quantity = purchase.quantity || 0
    updateForm.data.price = purchase.originProductPrice
    updateForm.data.unit = purchase.originProductPurchaseUnit
    updateForm.data.notes = purchase.notes || ''
  } else {
    createForm.data.storeId = purchase.storeId
    createForm.data.coopId = purchase.coopId
    createForm.data.productId = purchase.originProductId
    createForm.data.quantity = 0
    createForm.data.price = purchase.originProductPrice
    createForm.data.unit = purchase.originProductPurchaseUnit
    createForm.data.notes = ''
  }

  const { form, enhance, errors, constraints, submitting } = buildForm({
    form: isEditMode || isReRequestMode || isViewMode ? updateForm : createForm,
    schema: isEditMode || isReRequestMode || isViewMode ? PurchaseUpdateSchema : PurchaseCreateSchema,
    resultHandler: {
      handleSuccess: async (result) => {
        await updatePurchases()
        alert = {
          type: 'success',
          message: result.data?.message || (isEditMode ? '발주 정보가 수정되었습니다.' : '발주 신청이 완료되었습니다.'),
        }
      },
      handleFailure: async (result) => {
        await updatePurchases()
        alert = {
          type: 'error',
          message: result.data?.message || '오류가 발생했습니다.',
        }
      },
    },
    options: {
      resetForm: false,
      invalidateAll: false,
    },
  })

  let quantityDisplay = $derived.by(() => {
    return $form.quantity > 0 ? formatNumberWithCommas($form.quantity) : ''
  })

  const handleQuantityInput = (e: Event) => {
    const input = e.target as HTMLInputElement
    const value = input.value.replace(/,/g, '')
    const numValue = parseInt(value) || 0
    $form.quantity = numValue
  }

  const totalQuantity = $derived($form.quantity * (purchase.originProductPurchaseQty || 0))
  const totalPrice = $derived($form.quantity * purchase.originProductPrice * (purchase.originProductPurchaseQty || 1))
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
  role="dialog"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  onclick={(e) => e.target === e.currentTarget && onClose()}
>
  <form method="POST" action={formAction} use:enhance>
    <section
      class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      role="document"
    >
      {#if $submitting}
        <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
          <span class="loader-giant"></span>
        </div>
      {/if}

      <!-- Hidden inputs -->
      {#if isEditMode || isReRequestMode}
        <input type="hidden" name="id" value={($form as any).id} />
      {:else}
        <input type="hidden" name="storeId" value={($form as any).storeId} />
        <input type="hidden" name="coopId" value={($form as any).coopId} />
        <input type="hidden" name="productId" value={($form as any).productId} />
      {/if}
      <input type="hidden" name="price" value={$form.price} />
      <input type="hidden" name="unit" value={$form.unit} />
      <input type="hidden" name="totalPrice" value={totalPrice} />

      <!-- 헤더 -->
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <h2 class="text-xl font-bold text-gray-900">
          {isViewMode ? '발주 상세' : isEditMode ? '발주 수정' : isReRequestMode ? '발주 재신청' : '발주 신청'}
        </h2>
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
          <!-- 1단: 본사 상품 정보 (Collapsible) -->
          <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              onclick={() => (isOriginInfoOpen = !isOriginInfoOpen)}
            >
              <div class="flex-1">
                <div class="mb-1 text-sm font-semibold text-gray-700">본사 상품 정보</div>
                {#if !isOriginInfoOpen}
                  <div class="text-xs text-gray-500">
                    {purchase.originProductName}, 발주단위:
                    <span class="text-primary-600 font-medium">
                      {formatNumberWithCommas(purchase.originProductPurchaseQty)}개 / {purchase.originProductPurchaseUnit}
                    </span>
                  </div>
                {/if}
              </div>
              {#if isOriginInfoOpen}
                <ChevronUp class="h-4 w-4 text-gray-500" />
              {:else}
                <ChevronDown class="h-4 w-4 text-gray-500" />
              {/if}
            </button>
            {#if isOriginInfoOpen}
              <div class="border-t border-gray-200 bg-gray-50 px-5 py-4">
                <dl class="space-y-2.5">
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">상품명</dt>
                    <dd class="text-sm font-medium text-gray-900">{purchase.originProductName}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">원가</dt>
                    <dd class="text-sm font-medium text-gray-900">{formatCurrency(purchase.originProductPrice)}</dd>
                  </div>
                  {#if purchase.originProductCapacity}
                    <div class="flex items-start justify-between">
                      <dt class="text-xs font-medium text-gray-500">개별 용량</dt>
                      <dd class="text-sm text-gray-900">{purchase.originProductCapacity}</dd>
                    </div>
                  {/if}
                  {#if purchase.originProductSellUnit}
                    <div class="flex items-start justify-between">
                      <dt class="text-xs font-medium text-gray-500">개별 단위</dt>
                      <dd class="text-sm text-gray-900">{purchase.originProductSellUnit}</dd>
                    </div>
                  {/if}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">발주 단위</dt>
                    <dd class="text-primary-600 text-sm font-semibold">
                      {formatNumberWithCommas(purchase.originProductPurchaseQty)}개 / {purchase.originProductPurchaseUnit}
                    </dd>
                  </div>
                </dl>
              </div>
            {/if}
          </div>

          <!-- 2단: 판매 상품 정보 (Collapsible) -->
          <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              onclick={() => (isSalesInfoOpen = !isSalesInfoOpen)}
            >
              <div class="flex-1">
                <div class="mb-1 text-sm font-semibold text-gray-700">판매 상품 정보</div>
                {#if !isSalesInfoOpen}
                  <div class="text-xs text-gray-500">
                    {purchase.coopName}, 주문수량:
                    <span class="text-primary-600 font-medium">
                      {formatNumberWithCommas(purchase.orderedQuantity || 0)} / {formatNumberWithCommas(
                        purchase.maxQuantity
                      )}
                    </span>
                  </div>
                {/if}
              </div>
              {#if isSalesInfoOpen}
                <ChevronUp class="h-4 w-4 text-gray-500" />
              {:else}
                <ChevronDown class="h-4 w-4 text-gray-500" />
              {/if}
            </button>
            {#if isSalesInfoOpen}
              <div class="border-t border-gray-200 bg-blue-50 px-5 py-4">
                <dl class="space-y-2.5">
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매 상품명</dt>
                    <dd class="text-sm font-medium text-gray-900">{purchase.coopName}</dd>
                  </div>
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">판매 가격</dt>
                    <dd class="text-sm font-medium text-gray-900">{formatCurrency(purchase.salesPrice)}</dd>
                  </div>
                  {#if purchase.productCapacity}
                    <div class="flex items-start justify-between">
                      <dt class="text-xs font-medium text-gray-500">판매 용량</dt>
                      <dd class="text-sm text-gray-900">{purchase.productCapacity}</dd>
                    </div>
                  {/if}
                  {#if purchase.productSellUnit}
                    <div class="flex items-start justify-between">
                      <dt class="text-xs font-medium text-gray-500">판매 단위</dt>
                      <dd class="text-sm text-gray-900">{purchase.productSellUnit}</dd>
                    </div>
                  {/if}
                  <div class="flex items-start justify-between">
                    <dt class="text-xs font-medium text-gray-500">주문 수량</dt>
                    <dd class="text-primary-600 text-sm font-semibold">
                      {formatNumberWithCommas(purchase.orderedQuantity || 0)} / {formatNumberWithCommas(
                        purchase.maxQuantity
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            {/if}
          </div>

          <!-- 3단: 신청 폼 -->
          <div class="space-y-4 pt-2">
            <!-- 발주 수량 -->
            <div>
              <label for="quantity" class="mb-2 block text-sm font-medium"> 발주 수량 </label>
              <div class="relative">
                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  value={quantityDisplay}
                  oninput={handleQuantityInput}
                  class="focus:border-primary-500 focus:ring-primary-500/20 block w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-right text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="수량을 입력하세요."
                  inputmode="numeric"
                  disabled={isViewMode}
                  {...$constraints.quantity}
                />
                {#if $form.quantity > 0}
                  <span
                    class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-gray-400"
                    >{purchase.originProductPurchaseUnit}</span
                  >
                {/if}
              </div>
              {#if $errors.quantity}
                <p class="mt-1 text-xs text-red-500">{$errors.quantity}</p>
              {/if}
            </div>

            <!-- 발주 요약 -->
            {#if $form.quantity > 0}
              <div class="space-y-2 rounded-lg bg-blue-50 px-4 py-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">전체 발주 수량</span>
                  <span class="font-medium text-gray-900">
                    {formatNumberWithCommas($form.quantity)}
                    {purchase.originProductPurchaseUnit} × {formatNumberWithCommas(purchase.originProductPurchaseQty)} 개
                    =
                    {formatNumberWithCommas(totalQuantity)} 개
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">발주 예상 금액</span>
                  <span class="text-primary-600 text-lg font-bold">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            {/if}

            <!-- 비고 -->
            <div>
              <label for="notes" class="mb-2 block text-sm font-medium text-gray-700">비고</label>
              <textarea
                id="notes"
                name="notes"
                bind:value={$form.notes}
                rows="3"
                maxlength="240"
                class="focus:border-primary-500 focus:ring-primary-500/20 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="추가 요청사항을 입력하세요..."
                disabled={isViewMode}
                {...$constraints.notes}
              ></textarea>
              <div class="mt-1 text-right text-xs text-gray-400">{$form.notes?.length || 0}/240</div>
              {#if $errors.notes}
                <p class="mt-1 text-xs text-red-500">{$errors.notes}</p>
              {/if}
            </div>

            <!-- 현재 발주 상태 -->
            {#if purchase.status}
              <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-600">현재 발주 상태</span>
                  <span
                    class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-${purchase.status.color}-100 text-${purchase.status.color}-800`}
                  >
                    {purchase.status.label}
                  </span>
                </div>
                {#if purchase.rejectionReason}
                  <div class="mt-2 rounded-md bg-red-50 px-3 py-2">
                    <p class="text-xs font-medium text-red-800">거부 사유</p>
                    <p class="mt-0.5 text-xs text-red-700">{purchase.rejectionReason}</p>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- 푸터: 버튼 -->
      <div class="flex items-center justify-between border-t border-gray-200 px-6 py-3">
        <button
          type="button"
          class="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
          onclick={onClose}
        >
          {isViewMode ? '닫기' : '취소'}
        </button>
        {#if !isViewMode}
          <button
            type="submit"
            class="bg-primary-600 hover:bg-primary-700 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={$form.quantity <= 0 || $submitting}
          >
            {isEditMode ? '수정하기' : '신청하기'}
          </button>
        {/if}
      </div>
    </section>
  </form>
</div>

{#if alert}
  <Alert
    title={alert.type === 'success' ? '성공' : '오류'}
    type={alert.type}
    message={alert.message}
    {onClose}
    onConfirm={onClose}
  />
{/if}
