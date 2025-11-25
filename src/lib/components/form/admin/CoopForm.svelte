<script lang="ts">
  import ProductSearchModal from '$lib/components/modals/hq/ProductSearchModal.svelte'
  import Combobox from '$lib/components/ui/Combobox.svelte'
  import Editor from '$lib/components/ui/Editor.svelte'
  import FileUploader from '$lib/components/ui/ImageUploader.svelte'
  import { convertProductToCoop } from '$lib/converters/coop.converter'
  import { createCategory } from '$lib/database'
  import type { CategoryEntity, ImageEntity, ProductEntity, SalesStatus, UnitType } from '$lib/types'
  import { superForm } from 'sveltekit-superforms'

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

  const {
    form: formData,
    message,
    errors,
    constraints,
    enhance,
    submitting,
  } = superForm(data.form, {
    dataType: 'json',
    onResult: async ({ result }) => {
      if (result.type === 'success') onSubmit?.()
      else if (result.type === 'failure') onError?.()
    },
    invalidateAll: false,
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
  const titleText = $derived(isEditMode ? '공동구매 수정' : '공동구매 등록')
</script>

{#if $submitting}
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
    <span class="loader-giant"></span>
  </div>
{/if}
<form method="POST" action={formAction} use:enhance class="flex h-full flex-1 flex-col">
  <!-- Hidden inputs for edit mode -->
  {#if isEditMode}
    <input type="hidden" name="id" value={$formData.id} />
    <input type="hidden" name="product_id" value={$formData.product_id} />
  {/if}
  <input type="hidden" name="storeId" value={$formData.storeId} />

  <div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
    <div class="flex items-center space-x-4">
      <h1 class="text-surface-900 text-2xl font-bold">{titleText}</h1>
    </div>

    {#if mode === 'create'}
      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          onclick={() => (productMappingModalOpen = true)}
        >
          상품 정보 가져오기
        </button>
      </div>
    {/if}

    <div class="flex items-center space-x-2">
      <button
        type="button"
        class="btn bg-surface-50 hover:bg-surface-50 focus:ring-surface-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-black focus:ring-2 focus:ring-offset-2 focus:outline-none"
        onclick={() => onCancel?.()}
      >
        취소
      </button>
      <button
        type="submit"
        class="btn bg-primary-500 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        {submitButtonText}
      </button>
    </div>
  </div>

  <div class="flex flex-1 gap-8 p-8">
    <div class="flex w-1/2 flex-col">
      <section class="border-surface-100 flex flex-1 flex-col rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">기본정보</h2>
        <hr class="hr my-4" />
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-4 gap-2">
            <label class="label col-span-2 flex flex-col">
              <span class="label-text text-sm">상품명</span>
              <input
                type="text"
                name="name"
                class="input placeholder-surface-200 w-full"
                bind:value={$formData.name}
                placeholder="상품명"
                disabled={mode === 'create' && !$formData.product?.originId}
                {...$constraints.name}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.name}
                  <span class="text-xs text-red-500">{$errors.name}</span>
                {/if}
              </div>
            </label>
            <label class="label col-span-2 flex flex-col">
              <span class="label-text text-sm">카테고리</span>
              <Combobox
                bind:selected={$formData.categoryId}
                data={categories}
                options={{ allowNewItem: true, placeholder: '선택', handleAddNewItem: handleNewCategory }}
                disabled={mode === 'create' && !$formData.product?.originId}
              />
              <input type="hidden" name="categoryId" bind:value={$formData.categoryId} />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.categoryId}
                  <span class="text-xs text-red-500">{$errors.categoryId}</span>
                {/if}
              </div>
            </label>
          </div>
          <label class="label flex min-h-0 flex-1 flex-col">
            <span class="label-text text-sm">상세정보</span>
            <div class="h-full min-h-0 flex-1">
              <Editor
                bind:description={$formData.description}
                disabled={mode === 'create' && !$formData.product?.originId}
              />
            </div>
            <input type="hidden" name="description" bind:value={$formData.description} />
            <div class="mt-1 min-h-[20px]">
              {#if $errors.description}
                <span class="text-xs text-red-500">{$errors.description}</span>
              {/if}
            </div>
          </label>
        </div>
      </section>
    </div>

    <div class="flex w-1/2 flex-col">
      <section class="border-surface-100 mb-8 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">판매 정보</h2>
        <hr class="hr my-4" />
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-4 items-end gap-2">
            <label class="label flex flex-col">
              <span class="label-text text-sm">판매상태</span>
              <select
                name="status"
                class="select h-9 w-full px-3 align-middle"
                bind:value={$formData.status}
                disabled={mode === 'create' && !$formData.product?.originId}
                {...$constraints.status}
              >
                {#each salesStatuses as status}
                  <option value={status.code}>{status.label}</option>
                {/each}
              </select>
              <div class="mt-1 min-h-[20px]"></div>
            </label>
            <label class="label flex flex-col">
              <span class="label-text text-sm">판매일자</span>
              <input
                type="date"
                name="salesDate"
                placeholder="판매일자"
                class="input placeholder-surface-200 w-full"
                bind:value={$formData.salesDate}
                disabled={mode === 'create' && !$formData.product?.originId}
                {...$constraints.salesDate}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.salesDate}
                  <span class="text-xs text-red-500">{$errors.salesDate}</span>
                {/if}
              </div>
            </label>
          </div>
          <div class="grid grid-cols-4 items-end gap-2">
            <label class="label flex flex-col">
              <span class="label-text text-sm">판매 가격</span>
              <input
                name="salesPrice"
                class="input placeholder-surface-200 w-full text-right"
                type="number"
                bind:value={$formData.salesPrice}
                min="0"
                placeholder="가격"
                disabled={mode === 'create' && !$formData.product?.originId}
                {...$constraints.salesPrice}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.salesPrice}
                  <span class="text-xs text-red-500">{$errors.salesPrice}</span>
                {/if}
              </div>
            </label>
            <label class="label flex flex-col">
              <span class="label-text text-sm">원가</span>
              <input
                name="originalPrice"
                class="input placeholder-surface-200 w-full text-right"
                type="text"
                bind:value={$formData.product.price}
                min="0"
                placeholder="가격"
                disabled
              />
              <div class="mt-1 min-h-[20px]"></div>
            </label>
            <label class="label flex flex-col">
              <span class="label-text text-sm">판매 가능 수량</span>
              <input
                name="maxQuantity"
                class="input placeholder-surface-200 w-full text-right"
                type="number"
                bind:value={$formData.maxQuantity}
                min="0"
                placeholder="판매 가능 수량"
                disabled={mode === 'create' && !$formData.product?.originId}
                {...$constraints.maxQuantity}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.maxQuantity}
                  <span class="text-xs text-red-500">{$errors.maxQuantity}</span>
                {/if}
              </div>
            </label>
          </div>
          <div class="grid grid-cols-4 items-end gap-2">
            <label class="label flex flex-col">
              <span class="label-text text-sm">단위</span>
              <select
                name="productUnit"
                class="select h-9 w-full px-3 align-middle"
                bind:value={$formData.product.unit}
              >
                <option value="" disabled selected>선택</option>
                {#each unitTypes as unit}
                  <option value={unit.code}>{unit.label}</option>
                {/each}
              </select>
            </label>
            <label class="label flex flex-col">
              <span class="label-text text-sm">단위 별 수량</span>
              <input
                name="quantityPerUnit"
                class="input placeholder-surface-200 w-full"
                type="number"
                bind:value={$formData.product.quantityPerUnit}
                min="0"
                placeholder="단위 당 수량"
              />
            </label>
          </div>
        </div>
      </section>
      <section class="border-surface-100 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">상품 이미지</h2>
        <hr class="hr my-4" />
        <label for="coop-images" class="text-surface-700 block font-medium">
          <FileUploader
            bind:images={$formData.images}
            options={{ maxFiles: 5, removeable: false, bucket: 'coops' }}
            disabled={mode === 'create' && !$formData.product?.originId}
          />
          <input type="hidden" name="images" bind:value={$formData.images} />
        </label>
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
