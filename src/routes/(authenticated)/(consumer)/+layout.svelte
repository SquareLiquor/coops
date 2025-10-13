<script lang="ts">
  import ConsumerHeader from '$lib/components/ConsumerHeader.svelte'

  // Mock data (실제로는 서버에서 받아올 데이터)
  const mockStore = {
    name: '강남점',
    logo: '🏪',
  }

  const mockUser = {
    name: '김고객',
    avatar: '👤',
  }

  let { children } = $props()
</script>

<!-- 모바일 컨테이너 -->
<div class="mobile-container">
  <ConsumerHeader store={mockStore} user={mockUser} />

  <main>
    {@render children?.()}
  </main>
</div>
