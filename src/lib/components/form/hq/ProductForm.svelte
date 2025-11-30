<script lang="ts">
  import { buildForm } from '$lib/builders/form.builder'
  import Combobox from '$lib/components/ui/Combobox.svelte'
  import FileUploader from '$lib/components/ui/ImageUploader.svelte'
  import TipTapEditor from '$lib/components/ui/TipTapEditor.svelte'
  import { createCategory } from '$lib/database'
  import { ProductCreateSchema, ProductUpdateSchema } from '$lib/schemas'
  import type { CategoryEntity, UnitType } from '$lib/types'
  import { onlyNumberInput } from '$lib/utils'

  interface Props {
    data: {
      form: any
      categories: CategoryEntity[]
      unitTypes: UnitType[]
    }
    mode?: 'create' | 'edit'
    onSubmit?: () => void
    onError?: () => void
    onCancel?: () => void
  }

  let { data, mode = 'create', onSubmit, onError, onCancel }: Props = $props()
  let { categories, unitTypes } = $derived(data)

  // Collapse 상태
  let basicInfoCollapsed = $state(false)
  let productInfoCollapsed = $state(false)
  let purchaseInfoCollapsed = $state(false)
  let detailsInfoCollapsed = $state(false)
  const schema = mode === 'create' ? ProductCreateSchema : ProductUpdateSchema

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

  // 필수 항목 완료 상태
  const basicInfoComplete = $derived(!!$formData.name && !!$formData.categoryId)
  const productInfoComplete = $derived($formData.price > 0)
  const purchaseInfoComplete = $derived(true) // 발주정보는 선택사항
  const detailsInfoComplete = $derived(true) // 상세정보는 선택사항

  const handleNewCategory = async (categoryName: string) => {
    const { category } = await createCategory({ name: categoryName, store_id: $formData.storeId })

    if (!!category) {
      categories = [...categories, category].sort((a, b) => a.name.localeCompare(b.name))
      $formData.categoryId = category.id
    }
  }

  const isEditMode = $derived(mode === 'edit')
  const formAction = $derived(isEditMode ? '?/update' : '?/create')
  const submitButtonText = $derived(isEditMode ? '수정' : '등록')
  const titleText = $derived(isEditMode ? '상품 수정' : '상품 등록')
</script>

{#if $submitting}
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
    <span class="loader-giant"></span>
  </div>
{/if}
<form method="POST" action={formAction} use:enhance class="flex h-full min-h-0 flex-1 flex-col bg-gray-100 p-6">
  <!-- Hidden inputs for edit mode -->
  {#if isEditMode}
    <input type="hidden" name="id" value={($formData as any).id} />
  {/if}
  <input type="hidden" name="storeId" value={$formData.storeId} />

  <!-- 헤더 -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">{titleText}</h1>

    <div class="flex items-center gap-3">
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
    </div>
  </div>

  <div class="scrollbar-gutter-stable flex min-h-0 flex-1 flex-col gap-6 overflow-y-scroll pr-2 lg:flex-row">
    <!-- 좌측 패널 -->
    <div class="flex w-full flex-col gap-6 lg:w-1/3">
      <!-- 기본정보 -->
      <section class="rounded-2xl bg-white shadow-sm">
        <div class="flex w-full items-center justify-between p-6">
          <button
            type="button"
            class="text-sm font-semibold text-gray-900 hover:text-gray-700"
            onclick={() => (basicInfoCollapsed = !basicInfoCollapsed)}
          >
            <h2>기본 정보</h2>
          </button>
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
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">상품명</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" name="active" class="peer sr-only" bind:checked={$formData.active} />
                  <div
                    class="peer peer-checked:bg-primary-500 peer-focus:ring-primary-300 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
                  ></div>
                  <span class="ml-3 text-sm font-medium text-gray-900">
                    {$formData.active ? '활성' : '비활성'}
                  </span>
                </label>
              </div>
              <input
                type="text"
                name="name"
                class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                bind:value={$formData.name}
                placeholder="상품명을 입력하세요"
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
                options={{ allowNewItem: true, placeholder: '선택', handleAddNewItem: handleNewCategory }}
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

      <!-- 상품정보 -->
      <section class="rounded-2xl bg-white shadow-sm">
        <div class="flex w-full items-center justify-between p-6">
          <button
            type="button"
            class="text-sm font-semibold text-gray-900 hover:text-gray-700"
            onclick={() => (productInfoCollapsed = !productInfoCollapsed)}
          >
            <h2>상품 정보</h2>
          </button>
          <button
            type="button"
            class="flex items-center gap-2"
            onclick={() => (productInfoCollapsed = !productInfoCollapsed)}
          >
            {#if productInfoComplete}
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
              class:rotate-180={!productInfoCollapsed}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        {#if !productInfoCollapsed}
          <div class="flex flex-col gap-4 px-6 pb-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col">
                <div class="mb-2 flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">가격</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                <input
                  name="price"
                  class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                  type="number"
                  bind:value={$formData.price}
                  oninput={onlyNumberInput}
                  inputmode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  placeholder="0"
                />
                <div class="mt-1 min-h-[20px]">
                  {#if $errors.price}
                    <span class="text-xs text-red-500">{$errors.price}</span>
                  {/if}
                </div>
              </div>
              {#if !isEditMode && 'initialStock' in $formData}
                <div class="flex flex-col">
                  <span class="mb-2 text-sm text-gray-700">초기 재고</span>
                  <input
                    name="initialStock"
                    class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                    type="number"
                    bind:value={$formData.initialStock}
                    oninput={onlyNumberInput}
                    inputmode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    placeholder="0"
                  />
                  <div class="mt-1 min-h-[20px]">
                    {#if $errors.initialStock}
                      <span class="text-xs text-red-500">{$errors.initialStock}</span>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col">
                <span class="mb-2 text-sm text-gray-700">개별 용량</span>
                <input
                  name="capacity"
                  class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                  type="text"
                  bind:value={$formData.capacity}
                  placeholder="예: 500g, 1L"
                />
                <div class="mt-1 min-h-[20px]">
                  {#if $errors.capacity}
                    <span class="text-xs text-red-500">{$errors.capacity}</span>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col">
                <span class="mb-2 text-sm text-gray-700">개별 단위</span>
                <input
                  type="text"
                  name="unit"
                  class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                  bind:value={$formData.sellUnit}
                  placeholder="예: 10개, 1박스"
                />
                <div class="mt-1 min-h-[20px]"></div>
              </div>
            </div>
          </div>
        {/if}
      </section>

      <!-- 발주정보 -->
      <section class="rounded-2xl bg-white shadow-sm">
        <div class="flex w-full items-center justify-between p-6">
          <button
            type="button"
            class="text-sm font-semibold text-gray-900 hover:text-gray-700"
            onclick={() => (purchaseInfoCollapsed = !purchaseInfoCollapsed)}
          >
            <h2>발주 정보</h2>
          </button>
          <button
            type="button"
            class="flex items-center gap-2"
            onclick={() => (purchaseInfoCollapsed = !purchaseInfoCollapsed)}
          >
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
          </button>
        </div>
        {#if !purchaseInfoCollapsed}
          <div class="flex flex-col gap-4 px-6 pb-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col">
                <span class="mb-2 text-sm text-gray-700">발주 단위</span>
                <select
                  name="purchaseUnit"
                  class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm focus:ring-2 focus:outline-none"
                  bind:value={$formData.purchaseUnit}
                >
                  <option value="" disabled selected>선택</option>
                  {#each unitTypes as unit}
                    <option value={unit.code}>{unit.label}</option>
                  {/each}
                </select>
                <div class="mt-1 min-h-[20px]">
                  {#if $errors.purchaseUnit}
                    <span class="text-xs text-red-500">{$errors.purchaseUnit}</span>
                  {/if}
                </div>
              </div>
              <div class="flex flex-col">
                <span class="mb-2 text-sm text-gray-700">단위 당 수량</span>
                <input
                  name="purchaseQty"
                  class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-right text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                  type="number"
                  bind:value={$formData.purchaseQty}
                  oninput={onlyNumberInput}
                  inputmode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  placeholder="0"
                />
                <div class="mt-1 min-h-[20px]">
                  {#if $errors.purchaseQty}
                    <span class="text-xs text-red-500">{$errors.purchaseQty}</span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </section>
    </div>

    <!-- 우측 패널 -->
    <div class="flex w-full flex-col lg:w-2/3">
      <!-- 상세정보 -->
      <section class="rounded-2xl bg-white shadow-sm" class:flex={true} class:flex-1={true} class:flex-col={true}>
        <div class="flex w-full items-center justify-between p-6">
          <button
            type="button"
            class="text-sm font-semibold text-gray-900 hover:text-gray-700"
            onclick={() => (detailsInfoCollapsed = !detailsInfoCollapsed)}
          >
            <h2>상세 정보</h2>
          </button>
          <button
            type="button"
            class="flex items-center gap-2"
            onclick={() => (detailsInfoCollapsed = !detailsInfoCollapsed)}
          >
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
          </button>
        </div>
        {#if !detailsInfoCollapsed}
          <div class="flex min-h-0 flex-1 flex-col gap-6 px-6 pb-6 lg:flex-row">
            <div class="flex min-h-0 flex-1 flex-col">
              <span class="mb-2 text-sm text-gray-700">상품 설명</span>
              <div class="h-full overflow-hidden rounded-2xl border border-gray-200">
                <TipTapEditor bind:content={$formData.description} />
              </div>
              <input type="hidden" name="description" bind:value={$formData.description} />
              {#if $errors.description}
                <span class="mt-1 text-xs text-red-500">{$errors.description}</span>
              {/if}
            </div>
            <div class="flex w-full flex-col lg:w-80">
              <span class="mb-2 text-sm text-gray-700">상품 이미지</span>
              <FileUploader
                bind:images={$formData.images}
                options={{ maxFiles: 5, removeable: mode === 'create', bucket: 'products' }}
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
</form>
