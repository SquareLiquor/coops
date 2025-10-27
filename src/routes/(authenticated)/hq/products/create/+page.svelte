<script lang="ts">
  import Editor from '$lib/components/ui/Editor.svelte'
  import FileUploader from '$lib/components/ui/FileUploader.svelte'
  import { superForm } from 'sveltekit-superforms'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { categories } = $derived(data)

  const { form, message, errors, constraints, enhance, delayed } = superForm(data.form, {
    resetForm: false,
  })

  console.log('errors', $errors, $message)
</script>

<svelte:head>
  <title>상품 등록 - 본사</title>
</svelte:head>

<form method="POST" use:enhance>
  <input type="hidden" name="store_id" value={$form.store_id} />
  <div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
    <div class="flex items-center space-x-4">
      <h1 class="text-surface-900 text-2xl font-bold">상품 등록</h1>
    </div>
    <div class="flex items-center space-x-2">
      <button
        type="submit"
        class="btn bg-surface-50 hover:bg-surface-50 focus:ring-surface-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-black focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        취소
      </button>
      <button
        class="btn bg-primary-500 hover:bg-primary-700 focus:ring-primary-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        등록
      </button>
    </div>
  </div>

  <div class="flex w-full min-w-0 flex-1 gap-8 p-8">
    <!-- 좌측 패널: 기본정보 -->
    <div class="flex w-1/2 flex-col">
      <section class="border-surface-100 mb-8 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">기본정보</h2>
        <hr class="hr my-4" />
        <div class="flex flex-col gap-6">
          <div class="flex items-end justify-between gap-4">
            <label class="label w-2/5">
              <span class="label-text text-sm">상품명</span>
              <input
                type="text"
                name="name"
                class="input placeholder-surface-200 w-full max-w-md"
                bind:value={$form.name}
                placeholder="상품명을 입력해주세요."
                {...$constraints.name}
              />
            </label>
            <label class="label w-2/5">
              <span class="label-text text-sm">카테고리</span>
              <select
                name="category_id"
                class="select h-9 w-full max-w-md px-3"
                bind:value={$form.category_id}
                {...$constraints.category_id}
              >
                <option value="" disabled selected>선택</option>
                {#each categories as category}
                  <option value={category.id}>{category.name}</option>
                {/each}
              </select>
            </label>
          </div>
          <label class="text-surface-700 mb-1 block font-medium">
            <span class="label-text text-sm">상세정보</span>
            <Editor bind:description={$form.description} />
            <input type="hidden" name="description" bind:value={$form.description} />
          </label>
        </div>
      </section>
    </div>

    <!-- 우측 패널: 판매 정보, 기타 -->
    <div class="flex w-1/2 flex-col gap-8">
      <section class="border-surface-100 mb-8 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">판매 정보</h2>
        <hr class="hr my-4" />
        <div class="flex flex-col gap-6">
          <div class="flex items-end justify-between gap-4">
            <label class="label w-2/5">
              <span class="label-text text-sm">가격</span>
              <input
                name="price"
                class="input placeholder-surface-200 w-full max-w-md"
                type="number"
                bind:value={$form.price}
                min="0"
                placeholder="가격을 입력해주세요."
                {...$constraints.price}
              />
            </label>
            <label class="label w-2/5">
              <span class="label-text text-sm">단위</span>
              <select name="unit" class="select h-9 w-full max-w-md px-3">
                <option value="" disabled selected>선택</option>
                {#each ['box', 'ea'] as unit}
                  <option value={unit}>{unit}</option>
                {/each}
              </select>
            </label>
            <label class="label w-2/5">
              <span class="label-text text-sm">초기 재고</span>
              <input
                name="initial_stock"
                class="input placeholder-surface-200 w-full max-w-md"
                type="number"
                bind:value={$form.initial_stock}
                min="0"
                placeholder="초기 재고를 입력해주세요."
                {...$constraints.initial_stock}
              />
            </label>
          </div>
        </div>
      </section>
      <section class="border-surface-100 rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">기타</h2>
        <hr class="hr my-4" />
        <div class="flex flex-col gap-6">
          <label for="product-images" class="text-surface-700 mb-1 block font-medium">
            <span class="label-text text-sm">상품 이미지</span>
            <FileUploader bind:images={$form.images} />
          </label>
        </div>
      </section>
    </div>
  </div>

  <!-- form 끝 -->
</form>
