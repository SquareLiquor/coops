<script lang="ts">
  import { goto } from '$app/navigation'
  import ProductSearchModal from '$lib/components/modals/ProductSearchModal.svelte'
  import Combobox from '$lib/components/ui/Combobox.svelte'
  import Editor from '$lib/components/ui/Editor.svelte'
  import FileUploader from '$lib/components/ui/ImageUploader.svelte'
  import { convertProductToCoop } from '$lib/converters'
  import { CoopCreateSchema } from '$lib/schemas'
  import { createCategory } from '$lib/supabase'
  import type { ProductData, ProductImageData } from '$lib/types'
  import { type ActionResult } from '@sveltejs/kit'
  import { superForm } from 'sveltekit-superforms'
  import { valibot } from 'sveltekit-superforms/adapters'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { store, hqStore, categories, unitTypes, salesStatuses } = $derived(data)

  // 상품 매핑 모달
  let productMappingModalOpen = $state(false)

  const { form, message, errors, constraints, enhance, submitting } = superForm(data.form, {
    validators: valibot(CoopCreateSchema),
    dataType: 'json',
    onResult: async ({ result, ...results }: { result: ActionResult }) => {
      if (result.type === 'success') {
        await goto('/admin/coops')
      } else if (result.type === 'error') {
        console.error('상품 등록 중 오류가 발생했습니다.')
      }
    },
    invalidateAll: false,
  })

  const handleAddNewCategory = async (categoryName: string) => {
    if (!store) return

    const { category } = await createCategory({ name: categoryName, store_id: store.id })

    if (!!category) {
      categories = [...categories, category].sort((a, b) => a.name.localeCompare(b.name))
      $form.category_id = category.id
    }
  }

  const handleSelectProduct = ({ product, images }: { product: ProductData; images: ProductImageData[] }) => {
    $form = {
      ...$form,
      name: product.name,
      description: product.description,
      sales_price: product.price,
      product: convertProductToCoop({ product, images }),
    }
  }
</script>

<svelte:head>
  <title>상품 등록 - 본사</title>
</svelte:head>

{#if $submitting}
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
    <span class="loader-giant"></span>
  </div>
{/if}
<form method="POST" use:enhance class="flex h-full flex-1 flex-col">
  <input type="hidden" name="store_id" value={$form.store_id} />
  <div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
    <div class="flex items-center space-x-4">
      <h1 class="text-surface-900 text-2xl font-bold">상품 등록</h1>
    </div>

    <div class="flex items-center space-x-2">
      <button
        type="button"
        class="btn btn-sm bg-primary-100 text-primary-700 border-primary-200 ml-2 rounded border px-2 py-1"
        onclick={() => (productMappingModalOpen = true)}
      >
        본사 상품 불러오기
      </button>
    </div>

    <div class="flex items-center space-x-2">
      <button
        type="button"
        class="btn bg-surface-50 hover:bg-surface-50 focus:ring-surface-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-black focus:ring-2 focus:ring-offset-2 focus:outline-none"
        onclick={() => goto('/admin/coops')}
      >
        취소
      </button>
      <button
        type="submit"
        class="btn bg-primary-500 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        등록
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
            <label class="label col-span-2 flex flex-col">
              <span class="label-text text-sm">상품명</span>
              <input
                type="text"
                name="name"
                class="input placeholder-surface-200 w-full"
                bind:value={$form.name}
                placeholder="상품명"
                disabled={!$form.product.origin_id}
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
                bind:category_id={$form.category_id}
                data={categories}
                options={{ allowNewItem: true, placeholder: '선택', handleAddNewItem: handleAddNewCategory }}
                disabled={!$form.product.origin_id}
              />
              <input type="hidden" name="category_id" bind:value={$form.category_id} />
              <div class="mt-1 min-h-[20px]">
                {#if $errors?.category_id}
                  <span class="text-xs text-red-500">{$errors?.category_id}</span>
                {/if}
              </div>
            </label>
          </div>
          <label class="label flex min-h-0 flex-1 flex-col">
            <span class="label-text text-sm">상세정보</span>
            <div class="h-full min-h-0 flex-1">
              <Editor bind:description={$form.description} disabled={!$form.product.origin_id} />
            </div>
            <input
              type="hidden"
              name="description"
              bind:value={$form.description}
              disabled={!$form.product.origin_id}
            />
            <div class="mt-1 min-h-[20px]">
              {#if $errors.description}
                <span class="text-xs text-red-500">{$errors.description}</span>
              {/if}
            </div>
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
              <span class="label-text text-sm">판매상태</span>
              <select
                name="unit"
                class="select h-9 w-full px-3 align-middle"
                bind:value={$form.status}
                disabled={!$form.product.origin_id}
                {...$constraints.status}
              >
                {#each salesStatuses as status}
                  <option value={status.code}>{status.label}</option>
                {/each}
              </select>
              <input type="hidden" name="category_id" bind:value={$form.status} />
            </label>
            <label class="label flex flex-col">
              <span class="label-text text-sm">판매일자</span>
              <input
                type="date"
                name="sale_date"
                placeholder="판매일자"
                class="input placeholder-surface-200 w-full"
                bind:value={$form.sales_date}
                disabled={!$form.product.origin_id}
                {...$constraints.sales_date}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.sales_date}
                  <span class="text-xs text-red-500">{$errors.sales_date}</span>
                {/if}
              </div>
            </label>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <label class="label">
              <span class="label-text text-sm">판매 가격</span>
              <input
                name="price"
                class="input placeholder-surface-200 w-full text-right"
                type="number"
                bind:value={$form.sales_price}
                min="0"
                placeholder="가격"
                disabled={!$form.product.origin_id}
                {...$constraints.sales_price}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.sales_price}
                  <span class="text-xs text-red-500">{$errors.sales_price}</span>
                {/if}
              </div>
            </label>
            <label class="label">
              <span class="label-text text-sm">원가</span>
              <input
                name="price"
                class="input placeholder-surface-200 w-full text-right"
                type="text"
                bind:value={$form.product.price}
                min="0"
                placeholder="가격"
                disabled
              />
            </label>
            <label class="label">
              <span class="label-text text-sm">판매 가능 수량</span>
              <input
                name="initial_stock"
                class="input placeholder-surface-200 w-full text-right"
                type="number"
                bind:value={$form.max_quantity}
                min="0"
                placeholder="판매 가능 수량"
                disabled={!$form.product.origin_id}
                {...$constraints.max_quantity}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.max_quantity}
                  <span class="text-xs text-red-500">{$errors.max_quantity}</span>
                {/if}
              </div>
            </label>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <label class="label">
              <span class="label-text text-sm">단위</span>
              <select
                name="unit"
                class="select h-9 w-full px-3 align-middle"
                bind:value={$form.product.unit}
                disabled={!$form.product.origin_id}
                onchange={() => ($form.product.quantity_per_unit = 1)}
                {...$constraints.product?.unit}
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
                name="initial_stock"
                class="input placeholder-surface-200 w-full"
                type="number"
                bind:value={$form.product.quantity_per_unit}
                disabled={!$form.product.origin_id || $form.product.unit === 'EA'}
                min="0"
                placeholder="단위 당 수량"
                {...$constraints.product?.quantity_per_unit}
              />
            </label>
          </div>
        </div>
      </section>
      <section class="border-surface-100 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">상품 이미지</h2>
        <hr class="hr my-4" />
        <label for="product-images" class="text-surface-700 block font-medium">
          <FileUploader
            bind:images={$form.product.images}
            options={{ maxFiles: 5, removeable: false }}
            disabled={!$form.product.origin_id}
          />
          <input type="hidden" name="images" bind:value={$form.product.images} disabled={!$form.product.origin_id} />
        </label>
      </section>
    </div>
  </div>

  {#if productMappingModalOpen}
    <ProductSearchModal
      {hqStore}
      onSelect={handleSelectProduct}
      onClose={() => {
        productMappingModalOpen = false
      }}
    />
  {/if}
</form>
