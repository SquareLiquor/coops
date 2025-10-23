<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let current = 1
  export let total = 1
  export let maxPages = 5
  const dispatch = createEventDispatcher()

  function go(page: number) {
    if (page < 1) page = 1
    if (page > total) page = total
    dispatch('navigate', page)
  }

  $: pages = (() => {
    const arr: number[] = []
    const half = Math.floor(maxPages / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + maxPages - 1)
    start = Math.max(1, end - maxPages + 1)
    for (let i = start; i <= end; i++) arr.push(i)
    return { arr, start, end }
  })()
</script>

<nav class="flex items-center justify-center gap-2 py-4">
  <button class="bg-surface-100 rounded px-2 py-1" on:click={() => go(1)} aria-label="첫 페이지">제일 앞</button>
  <button class="bg-surface-100 rounded px-2 py-1" on:click={() => go(current - 1)} aria-label="이전">앞</button>

  {#if pages.start > 1}
    <button class="rounded px-2 py-1" on:click={() => go(1)}>1</button>
    <span class="px-1">…</span>
  {/if}

  {#each pages.arr as p}
    <button
      class={`rounded px-3 py-1 ${p === current ? 'bg-primary-500 text-white' : 'bg-surface-100'}`}
      on:click={() => go(p)}
      aria-current={p === current ? 'page' : undefined}
    >
      {p}
    </button>
  {/each}

  {#if pages.end < total}
    <span class="px-1">…</span>
    <button class="rounded px-2 py-1" on:click={() => go(total)}>{total}</button>
  {/if}

  <button class="bg-surface-100 rounded px-2 py-1" on:click={() => go(current + 1)} aria-label="다음">뒤</button>
  <button class="bg-surface-100 rounded px-2 py-1" on:click={() => go(total)} aria-label="마지막">제일 뒤</button>
</nav>

<style>
  nav button {
    border: 1px solid rgba(0, 0, 0, 0.04);
  }
</style>
