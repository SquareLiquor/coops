<script lang="ts">
  import { dndzone } from 'svelte-dnd-action'

  export let images: {
    id: string
    url: string
    isFeatured: boolean
  }[] = []

  // 파일 업로드 (여기선 로컬 미리보기 예시)
  const handleUpload = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (!files) return
    for (const file of files) {
      const url = URL.createObjectURL(file)
      images = [...images, { id: crypto.randomUUID(), url, isFeatured: false }]
    }
  }

  // 대표 이미지 설정
  const setFeatured = (id: string) => {
    images = images.map((img) => ({
      ...img,
      isFeatured: img.id === id,
    }))
  }

  // 드래그앤드롭 정렬 결과 반영
  const handleDnd = (e: any) => {
    images = e.detail.items
  }
</script>

<!-- 이미지 리스트 (드래그 정렬 가능) -->
<div
  use:dndzone={{ items: images, flipDurationMs: 200 }}
  on:consider={handleDnd}
  on:finalize={handleDnd}
  class="grid grid-cols-3 gap-3"
>
  {#each images as img (img.id)}
    <div class="relative cursor-move overflow-hidden rounded border-2" class:border-blue-500={img.isFeatured}>
      <img src={img.url} alt="상품 이미지" class="h-32 w-full object-cover" />

      <button on:click={() => setFeatured(img.id)} class="absolute top-1 right-1 rounded bg-white/70 px-2 py-1 text-xs">
        {img.isFeatured ? '대표' : '대표로 지정'}
      </button>
    </div>
  {/each}
</div>

<!-- 파일 업로드 -->
<label
  for="product-images"
  class="bg-primary-600 hover:bg-primary-700 mt-2 inline-block cursor-pointer rounded px-4 py-2 text-white"
>
  이미지 업로드
  <input id="product-images" type="file" accept="image/*" multiple class="hidden" on:change={handleUpload} />
</label>

<style>
  button:hover {
    background-color: rgba(255, 255, 255, 0.9);
  }
</style>
