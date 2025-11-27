<script lang="ts">
  import { deleteFile, uploadFile } from '$lib/database'
  import type { ImageInput } from '$lib/schemas'
  import { FileUpload } from '@skeletonlabs/skeleton-svelte'
  import dayjs from 'dayjs'

  let {
    images = $bindable(),
    disabled = false,
    options,
  }: {
    images: ImageInput[]
    disabled?: boolean
    options: { maxFiles: number; removeable?: boolean; bucket?: string }
  } = $props()

  let { maxFiles = 1, removeable = true, bucket = 'products' } = options ?? {}
  let representativeImage = $derived(images.find((image) => image.representative))

  const addImage = (image: ImageInput) => {
    images = [...images, image]
    calculateImages()
  }
  const removeImage = (image: ImageInput) => {
    images = images.filter((img) => img.url !== image.url)
    calculateImages()
  }
  const updateImage = (image: ImageInput) => {
    images = images.map((img) => (img.url === image.url ? { ...img, ...image } : img))

    if (image.representative) {
      images = images.map((img) => ({
        ...img,
        representative: img.url === image.url,
      }))
    }

    calculateImages()
  }
  const calculateImages = () => {
    if (!representativeImage && images.length > 0) {
      let firstUsed = true
      images = images.map((img) => {
        if (img.use && firstUsed) {
          firstUsed = false
          return { ...img, representative: true }
        }
        return { ...img, representative: false }
      })
    }

    let order = 0
    images = images.map((img) => {
      if (img.use) {
        return { ...img, sortOrder: order++ }
      } else {
        return { ...img, sortOrder: -1 }
      }
    })
  }

  /**
   * TODO: 파일 중복 체크
   */
  const handleFileChange = async (details: any) => {
    const newImages = await uploadAndGetUrl(details.acceptedFiles)

    newImages.forEach((image) => addImage(image))
  }

  /**
   * Bucket에 파일 업로드 후 URL 반환
   */
  const uploadAndGetUrl = async (files: File[]) => {
    const newImages: ImageInput[] = []
    let allowedCount = maxFiles - images.length

    for (const [index, file] of files.entries()) {
      if (allowedCount <= 0) break

      try {
        const { path, publicUrl } = await uploadFile(
          bucket,
          file,
          `/${dayjs().format('YYYY-MM-DD')}/${crypto.randomUUID()}`
        )

        newImages.push({
          url: publicUrl,
          path,
          representative: images.length === 0 && index === 0, // 첫 번째 이미지는 대표로 설정
          sortOrder: images.length + index,
          new: true,
          use: true,
        })
      } catch (error) {
        console.error('File upload error:', error)
        continue
      }
    }

    return newImages
  }

  /**
   * Bucket에서 파일 삭제
   */
  const handleFileDelete = async (index: number) => {
    const image = images[index]
    const match = image.url.match(new RegExp(`/${bucket}/(.+)$`))
    const path = match ? match[1] : null

    !!path && (await deleteFile(bucket, [path]))

    removeImage(image)
  }

  const handleRepresentativeChange = (index: number) => {
    const image = images[index]
    updateImage({ ...image, use: true, representative: true })
  }

  const handleFileUsageToggle = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement
    const image = images[index]
    updateImage({ ...image, use: target.checked, representative: target.checked ? image.representative : false })
  }

  const handleSortChange = () => {}
</script>

<FileUpload
  accept="image/*"
  disabled={images.length >= maxFiles || disabled}
  onFileChange={handleFileChange}
  {maxFiles}
>
  <FileUpload.Dropzone>
    <FileUpload.Trigger class="bg-primary-600 hover:bg-primary-700 rounded-full text-white"
      >파일 선택</FileUpload.Trigger
    >
    <FileUpload.HiddenInput />
  </FileUpload.Dropzone>
</FileUpload>

{#if images.length > 0}
  <div class="mt-4 grid grid-cols-5 gap-4 lg:grid-cols-2">
    {#each images as image, index}
      <div class="group relative">
        <div class="aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
          <img src={image.url} alt={image?.id} class="h-full w-full object-cover" />
        </div>

        <div
          class="absolute top-0 right-0 left-0 h-10 rounded-t-lg bg-gradient-to-b from-black/100 to-transparent"
        ></div>

        {@render representativeRadio(image, index)}
        {#if removeable}
          {@render removeButton(image, index)}
        {:else}
          {@render usageToggle(image, index)}
        {/if}
      </div>
    {/each}
  </div>
{/if}

{#snippet representativeRadio(image: ImageInput, index: number)}
  <representativeRadio>
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
      <div
        class="absolute top-1 left-7 z-10 hidden rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white group-hover/rep:block"
      >
        대표 이미지 설정
      </div>
    </label>
  </representativeRadio>
{/snippet}

{#snippet removeButton(image: ImageInput, index: number)}
  <removeButton>
    <div class="group/del absolute top-2 right-2">
      <button
        type="button"
        onclick={() => handleFileDelete(index)}
        class="flex h-5 w-5 items-center justify-center rounded-full border border-white/50 bg-white/20 text-xs text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
      >
        ×
      </button>
      <div
        class="absolute top-0 right-6 z-10 hidden rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white group-hover/del:block"
      >
        삭제
      </div>
    </div>
  </removeButton>
{/snippet}

{#snippet usageToggle(image: ImageInput, index: number)}
  <usageToggle>
    <label class="group/use absolute top-2 right-2 flex cursor-pointer items-center gap-1 select-none">
      <input
        type="checkbox"
        checked={image.use}
        onchange={(e: Event) => handleFileUsageToggle(index, e)}
        class="accent-primary-500 h-4 w-4 rounded border-gray-300"
      />
      <div
        class="absolute top-6 right-0 z-10 hidden rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white group-hover/use:block"
      >
        {image.use ? '미사용' : '사용'}
      </div>
    </label>
  </usageToggle>
{/snippet}
