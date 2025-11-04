<script lang="ts">
  import type { ProductImagesInput } from '$lib/schemas/product/product'
  import { deleteFile, uploadFile } from '$lib/supabase/storages/upload'
  import { FileUpload } from '@skeletonlabs/skeleton-svelte'
  import dayjs from 'dayjs'

  let {
    images = $bindable(),
    disabled = false,
    options,
  }: {
    images: ProductImagesInput[]
    disabled?: boolean
    options: { maxFiles: number; removeable?: boolean }
  } = $props()

  let { maxFiles = 1, removeable = true } = $derived(options ?? {})
  let availableImages = $derived(images.filter((images) => !images.toDelete))

  /**
   * TODO: 파일 중복 체크
   */
  const handleFileChange = async (details: any) => {
    const newImages = await uploadAndGetUrl(details.acceptedFiles)

    images = [...images, ...newImages]
  }

  const uploadAndGetUrl = async (files: File[]) => {
    const newImages: ProductImagesInput[] = []
    let allowedCount = maxFiles - availableImages.length

    for (const [index, file] of files.entries()) {
      if (allowedCount <= 0) break

      try {
        const { publicUrl } = await uploadFile(
          'products',
          file,
          `/${dayjs().format('YYYY-MM-DD')}/${crypto.randomUUID()}`
        )

        newImages.push({
          url: publicUrl,
          representative: availableImages.length === 0 && index === 0, // 첫 번째 이미지는 대표로 설정
          sort_order: availableImages.length + index,
        })
      } catch (error) {
        console.error('File upload error:', error)
        continue
      }
    }

    return newImages
  }

  const handleFileDelete = async (index: number) => {
    const targetImage = images[index]

    const match = targetImage.url.match(/\/products\/(.+)$/)
    const path = match ? match[1] : null

    !!path && (await deleteFile('products', path))

    if (targetImage.id) {
      images = images.map((image, i) => (i === index ? { ...image, toDelete: true, representative: false } : image))
    } else {
      images = images.filter((_, i) => i !== index)
    }

    if (availableImages.length > 0 && !availableImages.some((img) => img.representative)) {
      availableImages[0].representative = true
    }
  }

  const handleSortChange = () => {}
  const handleRepresentativeChange = (index: number) => {
    images = images.map((img, i) => ({
      ...img,
      representative: i === index,
    }))
  }
</script>

<FileUpload
  accept="image/*"
  disabled={availableImages.length >= maxFiles || disabled}
  onFileChange={handleFileChange}
  {maxFiles}
>
  <FileUpload.Dropzone>
    <span>Select file or drag here.</span>
    <FileUpload.Trigger>Browse Files</FileUpload.Trigger>
    <FileUpload.HiddenInput />
  </FileUpload.Dropzone>
</FileUpload>

{#if availableImages.length > 0}
  <div class="mt-4 grid grid-cols-5 gap-4">
    {#each images as image, index}
      {#if !image.toDelete}
        <div class="group relative">
          <div class="aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
            <img src={image.url} alt={image?.id} class="h-full w-full object-cover" />
          </div>

          <!-- 반투명 상단 레이어 -->
          <div
            class="absolute top-0 right-0 left-0 h-10 rounded-t-lg bg-gradient-to-b from-black/100 to-transparent"
          ></div>

          <label class="group/rep absolute top-2 left-2 cursor-pointer">
            <input
              type="radio"
              name="representative-image"
              checked={image.representative}
              onchange={() => handleRepresentativeChange(index)}
              class="sr-only"
            />
            <div
              class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white/20 backdrop-blur-sm"
            >
              {#if image.representative}
                <div class="h-2 w-2 rounded-full bg-white"></div>
              {/if}
            </div>
            <!-- 툴팁 -->
            <div
              class="absolute top-1 left-7 z-10 hidden rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white group-hover/rep:block"
            >
              대표 이미지 설정
            </div>
          </label>

          {#if removeable}
            <div class="group/del absolute top-2 right-2">
              <button
                type="button"
                onclick={() => handleFileDelete(index)}
                class="flex h-5 w-5 items-center justify-center rounded-full border border-white/50 bg-white/20 text-xs text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
              >
                ×
              </button>
              <!-- 툴팁 -->

              <div
                class="absolute top-0 right-6 z-10 hidden rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white group-hover/del:block"
              >
                삭제
              </div>
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
{/if}
