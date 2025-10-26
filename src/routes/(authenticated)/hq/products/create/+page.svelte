<script lang="ts">
  import SortableImageList from '$lib/components/SortableImageList.svelte'
  import TipTap from '$lib/components/TipTap.svelte'

  function handleImageListChange(newImages: typeof images, newMainIdx: number) {
    images = newImages
  }

  let name = ''
  let category = ''
  let newCategory = ''
  let categoryDropdownOpen = false
  let categoryOptions: string[] = ['곡물', '과일', '채소', '육류', '수산물']
  let price: number | '' = ''
  let initialStock: number | '' = ''
  let supplier = ''
  let supplierContact = ''
  let description = ''
  let imageUrl = ''

  // 이미지 업로드 관련 상태
  let images: { id: string; url: string; isFeatured: boolean }[] = []

  function selectCategory(option: string) {
    category = option
    categoryDropdownOpen = false
    newCategory = ''
  }

  function addNewCategoryInline() {
    if (newCategory && !categoryOptions.includes(newCategory)) {
      categoryOptions = [...categoryOptions, newCategory]
      category = newCategory
      newCategory = ''
      categoryDropdownOpen = false
    }
  }
</script>

<svelte:head>
  <title>상품 등록 - 본사</title>
</svelte:head>

<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <h1 class="text-surface-900 text-2xl font-bold">상품 등록</h1>
</div>

<form
  class="w-full p-8"
  on:submit|preventDefault={() => {
    /* 실제 등록 로직 필요 */
  }}
>
  <div class="flex w-full flex-col gap-8 lg:flex-row">
    <!-- 좌측: 이미지 + 일반 정보 -->
    <div class="flex min-w-0 flex-1 flex-col gap-8">
      <div>
        <label for="product-name" class="text-surface-700 mb-1 block font-medium">상품명</label>
        <input
          id="product-name"
          class="border-surface-200 focus:border-primary-500 w-full border-b px-3 py-2 focus:outline-none"
          bind:value={name}
          required
        />
      </div>
      <div>
        <label for="product-category" class="text-surface-700 mb-1 block font-medium">카테고리</label>
        <div class="relative" id="product-category">
          <button
            type="button"
            class="border-surface-200 focus:border-primary-500 w-full rounded border-b bg-white px-3 py-2 text-left focus:outline-none"
            on:click={() => (categoryDropdownOpen = !categoryDropdownOpen)}
            aria-haspopup="listbox"
            aria-expanded={categoryDropdownOpen}
          >
            {category || '카테고리 선택'}
            <span class="float-right">▼</span>
          </button>
          {#if categoryDropdownOpen}
            <div class="border-surface-200 absolute right-0 left-0 z-10 mt-1 rounded border bg-white shadow-lg">
              <ul class="max-h-48 overflow-auto py-1" tabindex="-1">
                {#each categoryOptions as option}
                  <li>
                    <button
                      type="button"
                      class="hover:bg-primary-50 w-full px-4 py-2 text-left"
                      on:click={() => selectCategory(option)}
                    >
                      {option}
                    </button>
                  </li>
                {/each}
                <li class="border-surface-100 flex items-center gap-2 border-t px-4 py-2">
                  <input
                    class="border-surface-200 focus:border-primary-500 flex-1 border-b px-2 py-1 focus:outline-none"
                    placeholder="새 카테고리 입력"
                    bind:value={newCategory}
                    on:keydown={(e) => e.key === 'Enter' && (addNewCategoryInline(), e.preventDefault())}
                  />
                  <button
                    type="button"
                    class="bg-primary-500 hover:bg-primary-700 rounded px-3 py-1 text-sm text-white"
                    on:click={addNewCategoryInline}
                    disabled={!newCategory.trim() || categoryOptions.includes(newCategory)}
                  >
                    추가
                  </button>
                </li>
              </ul>
            </div>
          {/if}
        </div>
      </div>
      <div class="flex gap-4">
        <div class="flex-1">
          <label for="product-price" class="text-surface-700 mb-1 block font-medium">가격(원)</label>
          <input
            id="product-price"
            type="number"
            min="0"
            class="border-surface-200 focus:border-primary-500 w-full border-b px-3 py-2 focus:outline-none"
            bind:value={price}
            required
          />
        </div>
        <div class="flex-1">
          <label for="product-stock" class="text-surface-700 mb-1 block font-medium">초기 재고</label>
          <input
            id="product-stock"
            type="number"
            min="0"
            class="border-surface-200 focus:border-primary-500 w-full border-b px-3 py-2 focus:outline-none"
            bind:value={initialStock}
            required
          />
        </div>
      </div>
      <div>
        <label for="product-images" class="text-surface-700 mb-1 block font-medium">상품 이미지</label>
        <SortableImageList
          {images}
          on:change={(e) => handleImageListChange(e.detail.images, e.detail.mainImageIndex)}
        />
      </div>
    </div>
    <!-- 우측: 설명 -->
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="mb-8 flex flex-1 flex-col">
        <label class="text-surface-700 mb-1 block font-medium">
          설명
          <!-- <textarea
            class="border-surface-200 focus:border-primary-500 h-40 w-full resize-y border-b px-3 py-2 focus:outline-none"
            bind:value={description}
          ></textarea> -->
          <TipTap />
        </label>
      </div>
    </div>
  </div>
  <!-- form 끝 -->
</form>
