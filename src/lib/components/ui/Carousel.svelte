<script lang="ts">
  import { browser } from '$app/environment'
  import type { ImageData } from '$lib/types'
  import Carousel from 'svelte-carousel'

  let carousel = $state<InstanceType<typeof Carousel> | null>(null)
  let { images, options = {} }: { images: ImageData[]; options?: { size?: 'small' | 'normal' | 'large' } } = $props()

  const { size = 'normal' } = options
</script>

{#if browser}
  <div class="relative">
    <Carousel bind:this={carousel}>
      <button
        slot="prev"
        aria-label="이전 이미지"
        class="bg-primary-500 absolute top-1/2 left-2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-base font-bold text-white shadow-md"
        let:showPrevPage
        onclick={showPrevPage}
      >
        <span class="flex h-full w-full items-center justify-center">&lt;</span>
      </button>
      {#each images as image, index}
        <img
          src={image.url}
          alt={index.toString()}
          class={[
            'border-surface-200 mb-2 w-auto flex-shrink-0 rounded-lg border object-cover',
            size === 'small' && 'h-40',
            size === 'normal' && 'h-80',
            size === 'large' && 'h-120',
          ]}
        />
      {/each}
      <button
        slot="next"
        aria-label="다음 이미지"
        class="bg-primary-500 absolute top-1/2 right-2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-base font-bold text-white shadow-md"
        let:showNextPage
        onclick={showNextPage}
      >
        <span class="flex h-full w-full items-center justify-center">&gt;</span>
      </button>
      <div
        slot="dots"
        let:showPage
        let:currentPageIndex
        class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-black/30 px-3 py-2"
      >
        {#each images as _, index}
          <button
            aria-label={`이미지 ${index + 1}`}
            class={[
              'rounded-full',
              currentPageIndex === index && 'bg-primary-500 h-3 w-3',
              currentPageIndex !== index && 'bg-surface-50 h-2 w-2',
            ]}
            onclick={() => showPage(index)}
          ></button>
        {/each}
      </div>
    </Carousel>
  </div>
{/if}
