<script lang="ts">
  import { buildForm } from '$lib/builders/form.builder'
  import PageHeader from '$lib/components/layout/PageHeader.svelte'
  import ProductSearchModal from '$lib/components/modals/hq/ProductSearchModal.svelte'
  import Combobox from '$lib/components/ui/Combobox.svelte'
  import FileUploader from '$lib/components/ui/ImageUploader.svelte'
  import Loading from '$lib/components/ui/Loading.svelte'
  import TipTapEditor from '$lib/components/ui/TipTapEditor.svelte'
  import { convertProductToCoop } from '$lib/converters/coop.converter'
  import { createCategory } from '$lib/database'
  import { CoopCreateSchema, CoopUpdateSchema } from '$lib/schemas'
  import type { CategoryEntity, ImageEntity, ProductEntity, SalesStatus, UnitType } from '$lib/types'

  interface Props {
    data: {
      form: any
      categories: CategoryEntity[]
      unitTypes: UnitType[]
      salesStatuses: SalesStatus[]
      hqStore?: any
    }
    mode?: 'create' | 'edit'
    onSubmit?: () => void
    onError?: () => void
    onCancel?: () => void
  }

  let { data, mode = 'create', onSubmit, onError, onCancel }: Props = $props()
  let { categories, unitTypes, salesStatuses, hqStore } = $derived(data)

  // 상품 매핑 모달
  let productMappingModalOpen = $state(false)
  const schema = mode === 'create' ? CoopCreateSchema : CoopUpdateSchema

  const {
    form: formData,
    message,
    errors,
    constraints,
    enhance,
    submitting,
  } = buildForm<typeof schema>({
    form: data.form,
    schema,
    resultHandler: {
      handleSuccess: async () => onSubmit?.(),
      handleFailure: async (result) => result.status !== 400 && onError?.(), // 400 에러는 폼 검증 오류이므로 onError 호출 안함
    },
    options: {
      dataType: 'json',
      resetForm: false,
      invalidateAll: false,
    },
  })

  const handleNewCategory = async (categoryName: string) => {
    const { category } = await createCategory({ name: categoryName, store_id: $formData.storeId })

    if (!!category) {
      categories = [...categories, category].sort((a, b) => a.name.localeCompare(b.name))
      $formData.categoryId = category.id
    }
  }

  const handleSelectProduct = ({ product, images }: { product: ProductEntity; images: ImageEntity[] }) => {
    $formData = {
      ...$formData,
      ...convertProductToCoop({ product, images }),
    }
  }

  const isEditMode = $derived(mode === 'edit')
  const formAction = $derived(isEditMode ? '?/update' : '?/create')
  const submitButtonText = $derived(isEditMode ? '수정' : '등록')
  const titleText = $derived(isEditMode ? '판매 상품 수정' : '판매 상품 등록')

  // Collapse 상태
  let basicInfoCollapsed = $state(false)
  let salesInfoCollapsed = $state(false)
  let purchaseInfoCollapsed = $state(false)
  let detailsInfoCollapsed = $state(false)

  // 필수 항목 완료 상태
  const basicInfoComplete = $derived(!!$formData.name && !!$formData.categoryId)
  const salesInfoComplete = $derived(
    !!$formData.status && !!$formData.salesDate && $formData.maxQuantity > 0 && $formData.salesPrice > 0
  )
  const purchaseInfoComplete = $derived(true) // 발주정보는 선택사항
  const detailsInfoComplete = $derived(!!$formData.description && $formData.images?.length > 0)
</script>

<div class="min-h-screen bg-gray-100 p-6">
  <PageHeader title={titleText}>
    {#snippet actions()}
      <button
        type="button"
        class="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        onclick={() => onCancel?.()}
      >
        취소
      </button>
      <button
        type="submit"
        class="bg-primary-600 hover:bg-primary-700 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors"
      >
        {submitButtonText}
      </button>
    {/snippet}
  </PageHeader>

  <form method="POST" action={formAction} use:enhance class="flex h-full min-h-0 flex-1 flex-col">
    <Loading show={$submitting} />

    {#if isEditMode}
      <input type="hidden" name="id" value={($formData as any).id} />
      <input type="hidden" name="productId" value={($formData as any).productId} />
    {/if}
    <input type="hidden" name="storeId" value={$formData.storeId} />

    <div class="scrollbar-gutter-stable flex min-h-0 flex-1 flex-col gap-6 overflow-y-scroll pr-2 lg:flex-row">
      <div class="flex w-full flex-col gap-6 lg:w-1/3">
        <section class="rounded-2xl bg-white shadow-sm">
          <div class="flex w-full items-center justify-between p-6">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="text-sm font-semibold text-gray-900 hover:text-gray-700"
                onclick={() => (basicInfoCollapsed = !basicInfoCollapsed)}
              >
                <h2>기본 정보</h2>
              </button>
              {#if mode === 'create'}
                <button
                  type="button"
                  class="rounded-full bg-gray-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
                  onclick={() => (productMappingModalOpen = true)}
                >
                  상품 정보 가져오기
                </button>
              {/if}
            </div>
            <button
              type="button"
              class="flex items-center gap-2"
              onclick={() => (basicInfoCollapsed = !basicInfoCollapsed)}
            >
              {#if basicInfoComplete}
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              {:else}
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
              {/if}
              <svg
                class="h-5 w-5 text-gray-400 transition-transform"
                class:rotate-180={!basicInfoCollapsed}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
          {#if !basicInfoCollapsed}
            <div class="flex flex-col gap-4 px-6 pb-6">
              <div class="flex flex-col">
                <div class="mb-2 flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">상품명</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  name="name"
                  class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  bind:value={$formData.name}
                  placeholder="상품명을 입력하세요"
                  disabled={mode === 'create' && !$formData.product?.originId}
                />
                <div class="mt-1 min-h-[20px]">
                  {#if $errors.name}
                    <span class="text-xs text-red-500">{$errors.name}</span>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col">
                <div class="mb-2 flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">카테고리</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                <Combobox
                  bind:selected={$formData.categoryId}
                  data={categories}
                  options={{ allowNewItem: true, placeholder: 'Select category', handleAddNewItem: handleNewCategory }}
                  disabled={mode === 'create' && !$formData.product?.originId}
                />
                <input type="hidden" name="categoryId" bind:value={$formData.categoryId} />
                <div class="mt-1 min-h-[20px]">
                  {#if $errors.categoryId}
                    <span class="text-xs text-red-500">{$errors.categoryId}</span>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </section>

        <section class="rounded-2xl bg-white shadow-sm">
          <button
            type="button"
            class="flex w-full items-center justify-between p-6 text-left"
            onclick={() => (salesInfoCollapsed = !salesInfoCollapsed)}
          >
            <h2 class="text-sm font-semibold text-gray-900">판매 정보</h2>
            <div class="flex items-center gap-2">
              {#if salesInfoComplete}
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              {:else}
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
              {/if}
              <svg
                class="h-5 w-5 text-gray-400 transition-transform"
                class:rotate-180={!salesInfoCollapsed}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>
          {#if !salesInfoCollapsed}
            <div class="flex flex-col gap-4 px-6 pb-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <div class="mb-2 flex items-center gap-1.5">
                    <span class="text-sm text-gray-700">판매 상태</span>
                    <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5"></circle>
                    </svg>
                  </div>
                  <select
                    name="status"
                    class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    bind:value={$formData.status}
                    disabled={mode === 'create' && !$formData.product?.originId}
                  >
                    {#each salesStatuses as status}
                      <option value={status.code}>{status.label}</option>
                    {/each}
                  </select>
                  <div class="mt-1 min-h-[20px]"></div>
                </div>
                <div class="flex flex-col">
                  <div class="mb-2 flex items-center gap-1.5">
                    <span class="text-sm text-gray-700">판매 일자</span>
                    <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5"></circle>
                    </svg>
                  </div>
                  <input
                    type="date"
                    name="salesDate"
                    placeholder="날짜 선택"
                    class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    bind:value={$formData.salesDate}
                    disabled={mode === 'create' && !$formData.product?.originId}
                  />
                  <div class="mt-1 min-h-[20px]">
                    {#if $errors.salesDate}
                      <span class="text-xs text-red-500">{$errors.salesDate}</span>
                    {/if}
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <div class="mb-2 flex items-center gap-1.5">
                    <span class="text-sm text-gray-700">판매 가능 수량</span>
                    <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5"></circle>
                    </svg>
                  </div>
                  <input
                    name="maxQuantity"
                    class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    type="number"
                    bind:value={$formData.maxQuantity}
                    min="0"
                    placeholder="0"
                    disabled={mode === 'create' && !$formData.product?.originId}
                  />
                  <div class="mt-1 min-h-[20px]">
                    {#if $errors.maxQuantity}
                      <span class="text-xs text-red-500">{$errors.maxQuantity}</span>
                    {/if}
                  </div>
                </div>
                <div class="flex flex-col">
                  <div class="mb-2 flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="text-sm text-gray-700">판매 가격</span>
                      <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5"></circle>
                      </svg>
                    </div>
                    <span class="text-xs text-gray-500">
                      원가: {$formData.product.price?.toLocaleString() || '0'}원
                    </span>
                  </div>
                  <input
                    name="salesPrice"
                    class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    type="number"
                    bind:value={$formData.salesPrice}
                    min="0"
                    placeholder="0"
                    disabled={mode === 'create' && !$formData.product?.originId}
                  />
                  <input type="hidden" name="originalPrice" bind:value={$formData.product.price} />
                  <div class="mt-1 min-h-[20px]">
                    {#if $errors.salesPrice}
                      <span class="text-xs text-red-500">{$errors.salesPrice}</span>
                    {/if}
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <span class="mb-2 text-sm text-gray-700">판매 용량</span>
                  <input
                    type="text"
                    name="capacity"
                    class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    bind:value={$formData.product.capacity}
                    min="0"
                    placeholder="예: 500g, 1L"
                    disabled={mode === 'create' && !$formData.product?.originId}
                  />
                  <div class="mt-1 min-h-[20px]"></div>
                </div>
                <div class="flex flex-col">
                  <span class="mb-2 text-sm text-gray-700">판매 단위</span>
                  <input
                    type="text"
                    name="sellUnit"
                    class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    bind:value={$formData.product.sellUnit}
                    placeholder="예: 10개, 1박스"
                    disabled={mode === 'create' && !$formData.product?.originId}
                  />
                  <div class="mt-1 min-h-[20px]"></div>
                </div>
              </div>
            </div>
          {/if}
        </section>

        <section class="rounded-2xl bg-white shadow-sm">
          <button
            type="button"
            class="flex w-full items-center justify-between p-6 text-left"
            onclick={() => (purchaseInfoCollapsed = !purchaseInfoCollapsed)}
          >
            <h2 class="text-sm font-semibold text-gray-900">발주 정보</h2>
            <div class="flex items-center gap-2">
              {#if purchaseInfoComplete}
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              {:else}
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
              {/if}
              <svg
                class="h-5 w-5 text-gray-400 transition-transform"
                class:rotate-180={!purchaseInfoCollapsed}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>
          {#if !purchaseInfoCollapsed}
            <div class="flex flex-col gap-4 px-6 pb-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <span class="mb-2 text-sm text-gray-700">발주 단위</span>
                  <input
                    name="purchaseUnit"
                    class="h-10 w-full rounded-full border border-gray-300 bg-gray-50 px-4 text-right text-sm text-gray-500"
                    type="text"
                    bind:value={$formData.product.purchaseUnit}
                    disabled
                  />
                  <div class="mt-1 min-h-[20px]"></div>
                </div>
                <div class="flex flex-col">
                  <span class="mb-2 text-sm text-gray-700">발주 단위 당 수량</span>
                  <input
                    name="purchaseQty"
                    class="h-10 w-full rounded-full border border-gray-300 bg-gray-50 px-4 text-right text-sm text-gray-500"
                    type="number"
                    bind:value={$formData.product.purchaseQty}
                    min="0"
                    placeholder="0"
                    disabled
                  />
                  <div class="mt-1 min-h-[20px]"></div>
                </div>
              </div>
            </div>
          {/if}
        </section>
      </div>

      <div class="flex w-full flex-col lg:w-2/3">
        <section
          class="rounded-2xl bg-white shadow-sm"
          class:flex={!detailsInfoCollapsed}
          class:flex-1={!detailsInfoCollapsed}
          class:flex-col={!detailsInfoCollapsed}
        >
          <button
            type="button"
            class="flex w-full items-center justify-between p-6 text-left"
            onclick={() => (detailsInfoCollapsed = !detailsInfoCollapsed)}
          >
            <h2 class="text-sm font-semibold text-gray-900">상세 정보</h2>
            <div class="flex items-center gap-2">
              {#if detailsInfoComplete}
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              {:else}
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
              {/if}
              <svg
                class="h-5 w-5 text-gray-400 transition-transform"
                class:rotate-180={!detailsInfoCollapsed}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>
          {#if !detailsInfoCollapsed}
            <div class="flex min-h-0 flex-1 flex-col gap-6 px-6 pb-6 lg:flex-row">
              <div class="flex min-h-0 flex-1 flex-col">
                <div class="mb-2 flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">상품 설명</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                <div class="h-full overflow-hidden rounded-2xl border border-gray-200">
                  <TipTapEditor
                    bind:content={$formData.description}
                    disabled={!$formData.product?.originId || $formData.product?.originId === ''}
                  />
                </div>
                <input type="hidden" name="description" bind:value={$formData.description} />
                {#if $errors.description}
                  <span class="mt-1 text-xs text-red-500">{$errors.description}</span>
                {/if}
              </div>
              <div class="flex w-full flex-col lg:w-80">
                <div class="mb-2 flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">상품 이미지</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                <FileUploader
                  bind:images={$formData.images}
                  options={{ maxFiles: 5, removeable: false, bucket: 'coops' }}
                  disabled={!$formData.product?.originId}
                />
                <input type="hidden" name="images" bind:value={$formData.images} />
                {#if $errors.images?._errors?.length}
                  <span class="mt-1 text-xs text-red-500">{$errors.images._errors[0]}</span>
                {/if}
              </div>
            </div>
          {/if}
        </section>
      </div>
    </div>

    {#if productMappingModalOpen && hqStore}
      <ProductSearchModal
        {hqStore}
        onSelect={handleSelectProduct}
        onClose={() => {
          productMappingModalOpen = false
        }}
      />
    {/if}
  </form>
</div>
