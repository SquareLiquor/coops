<script lang="ts">
  import Combobox from '$lib/components/ui/Combobox.svelte'
  import Editor from '$lib/components/ui/Editor.svelte'
  import FileUploader from '$lib/components/ui/ImageUploader.svelte'
  import { createCategory } from '$lib/supabase'
  import type { CategoryData, UnitType } from '$lib/types'
  import { superForm } from 'sveltekit-superforms'

  interface Props {
    data: {
      form: any
      categories: CategoryData[]
      unitTypes: UnitType[]
    }
    mode?: 'create' | 'edit'
    onSubmit?: () => void
    onCancel?: () => void
  }

  let { data, mode = 'create', onSubmit, onCancel }: Props = $props()
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
    onResult: async ({ result }) => {
      if (result.type === 'success') {
        onSubmit?.()
      } else if (result.type === 'error') {
        console.error(`상품 ${mode === 'create' ? '등록' : '수정'} 중 오류가 발생했습니다.`)
      }
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
<form method="POST" action={formAction} use:enhance class="flex h-full flex-1 flex-col">
  <!-- Hidden inputs for edit mode -->
  {#if isEditMode}
    <input type="hidden" name="id" value={$formData.id} />
  {/if}
  <input type="hidden" name="storeId" value={$formData.storeId} />
  <div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
    <div class="flex items-center space-x-4">
      <h1 class="text-surface-900 text-2xl font-bold">{titleText}</h1>
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

  <div class="flex flex-1 gap-8 p-8">
    <!-- 좌측 패널: 기본정보 -->
    <div class="flex w-1/2 flex-col">
      <section class="border-surface-100 flex flex-1 flex-col rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">기본정보</h2>
        <hr class="hr my-4" />
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-4 gap-2">
            <label class="label">
              <span class="label-text text-sm">상품명</span>
              <input
                type="text"
                name="name"
                class="input placeholder-surface-200 w-full"
                bind:value={$formData.name}
                placeholder="상품명"
                {...$constraints.name}
              />
            </label>
            <label class="label col-span-2">
              <span class="label-text text-sm">카테고리</span>
              <Combobox
                bind:selected={$formData.categoryId}
                data={categories}
                options={{ allowNewItem: true, placeholder: '선택', handleAddNewItem: handleNewCategory }}
              />
              <input type="hidden" name="categoryId" bind:value={$formData.categoryId} />
            </label>
          </div>
          <label class="label flex min-h-0 flex-1 flex-col">
            <span class="label-text text-sm">상세정보</span>
            <div class="h-full min-h-0 flex-1">
              <Editor bind:description={$formData.description} />
            </div>
            <input type="hidden" name="description" bind:value={$formData.description} />
          </label>
        </div>
      </section>
    </div>

    <!-- 우측 패널: 판매 정보, 기타 -->
    <div class="flex w-1/2 flex-col">
      <section class="border-surface-100 mb-8 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">판매 정보</h2>
        <hr class="hr my-4" />
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-4 gap-2">
            <label class="label">
              <span class="label-text text-sm">가격</span>
              <input
                name="price"
                class="input placeholder-surface-200 w-full"
                type="number"
                bind:value={$formData.price}
                min="0"
                placeholder="가격"
                {...$constraints.price}
              />
            </label>
            <label class="label">
              <span class="label-text text-sm">개 당 가격</span>
              <input
                name="pricePerPiece"
                class="input placeholder-surface-200 w-full"
                type="number"
                value={$formData.price / $formData.quantityPerUnit}
                min="0"
                placeholder=""
                disabled
              />
            </label>
            {#if !isEditMode}
              <label class="label">
                <span class="label-text text-sm">재고</span>
                <input
                  name="initialStock"
                  class="input placeholder-surface-200 w-full"
                  type="number"
                  bind:value={$formData.initialStock}
                  min="0"
                  placeholder="초기 재고"
                  {...$constraints.initialStock}
                />
              </label>
            {/if}
          </div>
          <div class="grid grid-cols-4 gap-2">
            <label class="label">
              <span class="label-text text-sm">단위</span>
              <select
                name="unit"
                class="select h-9 w-full px-3 align-middle"
                bind:value={$formData.unit}
                onchange={() => ($formData.quantityPerUnit = 1)}
              >
                <option value="" disabled selected>선택</option>
                {#each unitTypes as unit}
                  <option value={unit.code}>{unit.label}</option>
                {/each}
              </select>
            </label>
            <label class="label">
              <span class="label-text text-sm">단위 별 수량</span>
              <input
                name="quantityPerUnit"
                class="input placeholder-surface-200 w-full"
                type="number"
                bind:value={$formData.quantityPerUnit}
                disabled={$formData.unit === 'EA'}
                min="0"
                placeholder="단위 당 수량"
                {...$constraints.quantityPerUnit}
              />
            </label>
          </div>
        </div>
      </section>
      <section class="border-surface-100 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">상품 이미지</h2>
        <hr class="hr my-4" />
        <label for="product-images" class="text-surface-700 block font-medium">
          <FileUploader bind:images={$formData.images} options={{ maxFiles: 5, removeable: mode === 'create' }} />
          <input type="hidden" name="images" bind:value={$formData.images} />
        </label>
      </section>
    </div>
  </div>
</form>
