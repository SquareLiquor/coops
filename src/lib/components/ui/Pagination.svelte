<script lang="ts">
  import type { Pagination } from '$lib/types'
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/svelte'

  let {
    pagination,
    onPageChange,
  }: {
    pagination: Pagination
    onPageChange: (page: number) => void
  } = $props()

  const currentPage = $derived(pagination.page)
  const totalPages = $derived(pagination.totalPages)

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  // 표시할 페이지 번호 계산
  const pageNumbers = $derived(() => {
    const delta = 2 // 현재 페이지 양옆으로 보여줄 페이지 수
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  })
</script>

{#if totalPages > 1}
  <div class="mt-4">
    <div class="flex items-center justify-center gap-1">
      <button
        type="button"
        onclick={() => goToPage(1)}
        disabled={currentPage === 1}
        class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="첫 페이지"
      >
        <ChevronsLeft class="h-4 w-4" />
      </button>

      <button
        type="button"
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="이전 페이지"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>

      {#each pageNumbers() as pageNum}
        {#if pageNum === '...'}
          <span class="flex h-8 w-8 items-center justify-center text-sm text-gray-400">...</span>
        {:else}
          <button
            type="button"
            onclick={() => goToPage(pageNum as number)}
            class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors
            {currentPage === pageNum ? 'bg-white text-black' : 'text-gray-700 hover:bg-gray-100'}"
          >
            {pageNum}
          </button>
        {/if}
      {/each}

      <button
        type="button"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="다음 페이지"
      >
        <ChevronRight class="h-4 w-4" />
      </button>

      <button
        type="button"
        onclick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label="마지막 페이지"
      >
        <ChevronsRight class="h-4 w-4" />
      </button>
    </div>
  </div>
{/if}
