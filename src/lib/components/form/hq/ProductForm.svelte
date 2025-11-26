<script lang="ts">
  import Combobox from '$lib/components/ui/Combobox.svelte'
  import EditorTipTap from '$lib/components/ui/EditorTipTap.svelte'
  import FileUploader from '$lib/components/ui/ImageUploader.svelte'
  import { createCategory } from '$lib/database'
  import type { CategoryEntity, UnitType } from '$lib/types'
  import { superForm } from 'sveltekit-superforms'

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

  const {
    form: formData,
    message,
    errors,
    constraints,
    enhance,
    submitting,
  } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
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
      $formData.category_id = category.id
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
<form method="POST" action={formAction} use:enhance class="flex h-full min-h-0 flex-1 flex-col">
  <!-- Hidden inputs for edit mode -->
  {#if isEditMode}
    <input type="hidden" name="id" value={$formData.id} />
  {/if}
  <input type="hidden" name="storeId" value={$formData.storeId} />
  <div class="border-surface-100 flex h-14 flex-shrink-0 items-center justify-between border-b px-6">
    <div class="flex items-center space-x-4">
      <h1 class="text-surface-900 text-xl font-bold">{titleText}</h1>
    </div>
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

  <div class="flex min-h-0 flex-1 gap-6 overflow-auto p-6">
    <!-- 좌측 패널 -->
    <div class="flex w-1/2 flex-col gap-6">
      <!-- 기본정보 -->
      <section class="border-surface-100 rounded-lg border bg-white p-3">
        <h2 class="text-base font-semibold">기본정보</h2>
        <hr class="hr my-2" />
        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col">
              <span class="mb-1 text-sm font-medium">상품명</span>
              <input
                type="text"
                name="name"
                class="input placeholder-surface-200 w-full"
                bind:value={$formData.name}
                placeholder="상품명"
                {...$constraints.name}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.name}
                  <span class="text-xs text-red-500">{$errors.name}</span>
                {/if}
              </div>
            </div>
            <div class="flex flex-col"></div>
            <div class="flex flex-col"></div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-2 flex flex-col">
              <span class="mb-1 text-sm font-medium">카테고리</span>
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
            <div class="flex flex-col"></div>
          </div>
        </div>
      </section>

      <!-- 상품정보 -->
      <section class="border-surface-100 rounded-lg border bg-white p-3">
        <h2 class="text-base font-semibold">상품정보</h2>
        <hr class="hr my-2" />
        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col">
              <span class="mb-1 text-sm font-medium">가격</span>
              <input
                name="price"
                class="input placeholder-surface-200 w-full text-right"
                type="number"
                bind:value={$formData.price}
                min="0"
                placeholder="가격"
                {...$constraints.price}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.price}
                  <span class="text-xs text-red-500">{$errors.price}</span>
                {/if}
              </div>
            </div>
            {#if !isEditMode}
              <div class="flex flex-col">
                <span class="mb-1 text-sm font-medium">초기 재고</span>
                <input
                  name="initialStock"
                  class="input placeholder-surface-200 w-full text-right"
                  type="number"
                  bind:value={$formData.initialStock}
                  min="0"
                  placeholder="초기 재고"
                  {...$constraints.initialStock}
                />
                <div class="mt-1 min-h-[20px]">
                  {#if $errors.initialStock}
                    <span class="text-xs text-red-500">{$errors.initialStock}</span>
                  {/if}
                </div>
              </div>
            {/if}
            <div class="flex flex-col"></div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col">
              <span class="mb-1 text-sm font-medium">개별 용량</span>
              <input
                name="capacity"
                class="input placeholder-surface-200 w-full text-right"
                type="text"
                bind:value={$formData.capacity}
                min="0"
                placeholder="용량 (예: 500g, 1L)"
                {...$constraints.capacity}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.capacity}
                  <span class="text-xs text-red-500">{$errors.capacity}</span>
                {/if}
              </div>
            </div>
            <div class="flex flex-col">
              <span class="mb-1 text-sm font-medium">개별 단위</span>
              <input
                type="text"
                name="unit"
                class="input placeholder-surface-200 w-full"
                bind:value={$formData.sellUnit}
                placeholder="단위 (예: 10개, 1박스 8개입)"
              />
              <div class="mt-1 min-h-[20px]"></div>
            </div>
            <div class="flex flex-col"></div>
          </div>
        </div>
      </section>

      <!-- 발주정보 -->
      <section class="border-surface-100 rounded-lg border bg-white p-3">
        <h2 class="text-base font-semibold">발주정보</h2>
        <hr class="hr my-2" />
        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-3 gap-2">
            <div class="flex flex-col">
              <span class="mb-1 text-sm font-medium">발주 단위</span>
              <select
                name="purchaseUnit"
                class="select h-9 w-full px-3 align-middle"
                bind:value={$formData.purchaseUnit}
              >
                <option value="" disabled selected>선택</option>
                {#each unitTypes as unit}
                  <option value={unit.code}>{unit.label}</option>
                {/each}
              </select>
              <div class="mt-1 min-h-[20px]"></div>
            </div>
            <div class="flex flex-col">
              <span class="mb-1 text-sm font-medium">단위 당 수량</span>
              <input
                name="purchaseQty"
                class="input placeholder-surface-200 w-full text-right"
                type="number"
                bind:value={$formData.purchaseQty}
                min="0"
                placeholder="단위 당 수량"
              />
              <div class="mt-1 min-h-[20px]"></div>
            </div>
            <div class="flex flex-col"></div>
          </div>
        </div>
      </section>
    </div>

    <!-- 우측 패널: 상세정보 -->
    <div class="flex w-1/2 flex-col">
      <section class="border-surface-100 flex flex-1 flex-col rounded-lg border bg-white p-3">
        <h2 class="text-base font-semibold">상세정보</h2>
        <hr class="hr my-2" />
        <div class="flex min-h-0 flex-1 flex-col">
          <div class="mb-3 flex min-h-0 flex-1 flex-col">
            <span class="mb-1 text-sm font-medium">상품 설명</span>
            <div class="h-full overflow-hidden">
              <EditorTipTap bind:content={$formData.description} />
            </div>
            <input type="hidden" name="description" bind:value={$formData.description} />
            {#if $errors.description}
              <span class="mt-1 text-xs text-red-500">{$errors.description}</span>
            {/if}
          </div>
          <div class="flex flex-col">
            <input type="hidden" name="images" bind:value={$formData.images} />
            <span class="mb-1 text-sm font-medium">상품 이미지</span>
            <FileUploader bind:images={$formData.images} options={{ maxFiles: 5, removeable: mode === 'create' }} />
            <!-- <div class="mt-1 min-h-[20px]">
              {#if $errors.images}
                <span class="text-xs text-red-500">{$errors.images._errors}</span>
              {/if}
            </div> -->
          </div>
        </div>
      </section>
    </div>
  </div>
</form>
