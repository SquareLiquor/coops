<script lang="ts">
  import Carousel from '$lib/components/ui/Carousel.svelte'
  import type { CoopData, ImageData } from '$lib/types'
  import { onMount } from 'svelte'

  let { selectedCoopId = $bindable(), coops }: { selectedCoopId: string | null; coops: CoopData[] } = $props()

  let coop: CoopData = $derived.by(() => {
    return coops.find((c) => c.id === selectedCoopId)!
  })

  let images: ImageData[] = $derived.by(() => {
    return coop.product.images.slice().sort((a, b) => {
      if (a.representative && !b.representative) return -1
      if (!a.representative && b.representative) return 1
      return a.sortOrder - b.sortOrder
    })
  })

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') selectedCoopId = null
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })

  let current = 0
</script>

{#if selectedCoopId}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="presentation"
    onclick={(e) => {
      if (e.target === e.currentTarget) selectedCoopId = null
    }}
  >
    <div
      class="border-surface-200 scrollbar-hide relative max-h-[75vh] w-full max-w-md overflow-y-auto rounded-xl border bg-white p-6 shadow-xl"
    >
      <header class="mb-4 flex flex-col items-center">
        <h2 class="text-surface-900 text-center text-xl font-bold dark:text-white">{coop.name}</h2>
      </header>

      <Carousel {images} />

      <div class="prose mt-4">
        {@html coop.description}
      </div>
    </div>
  </div>
{/if}
