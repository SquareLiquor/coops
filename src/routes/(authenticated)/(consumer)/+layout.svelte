<script lang="ts">
  import ConsumerHeader from '$lib/components/ConsumerHeader.svelte'
  import { setStore } from '$lib/stores/index.js'
  import { onMount } from 'svelte'

  let { data, children } = $props()
  let { store } = data

  onMount(() => {
    !!store && setStore(store)
  })
</script>

<!-- 모바일 컨테이너 -->
<div class="mobile-container">
  <ConsumerHeader />

  <main>
    {@render children?.()}
  </main>
</div>
