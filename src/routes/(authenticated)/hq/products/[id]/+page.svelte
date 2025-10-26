<script lang="ts">
  import { goto } from '$app/navigation'
  // 실제로는 서버에서 상품 정보를 받아와야 함
  // 예시 데이터 (products에서 하나)
  const product = {
    id: 'PROD-001',
    name: '유기농 쌀 10kg',
    category: '곡물',
    price: 45000,
    initialStock: 500,
    currentStock: 342,
    supplier: '농협중앙회',
    supplierContact: '02-1234-5678',
    description: '100% 유기농 인증 쌀',
    imageUrl: '/images/rice.jpg',
    status: 'active',
    registeredAt: '2024-01-15',
    lastUpdated: '2024-10-10',
    totalSold: 158,
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active':
        return '판매중'
      case 'low_stock':
        return '재고부족'
      case 'out_of_stock':
        return '품절'
      case 'inactive':
        return '판매중지'
      default:
        return status
    }
  }
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }
  function goBack() {
    goto('/(authenticated)/hq/products')
  }
  function handleEdit() {
    alert('수정 기능은 추후 구현 예정')
  }
  function handleDelete() {
    if (confirm('정말 삭제하시겠습니까?')) {
      alert('삭제되었습니다.')
      goto('/(authenticated)/hq/products')
    }
  }
</script>

<svelte:head>
  <title>상품 상세 - 본사</title>
</svelte:head>

<div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
  <h1 class="text-surface-900 text-2xl font-bold">상품 상세</h1>
  <button
    class="bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-lg px-4 py-2 font-medium"
    on:click={goBack}>목록</button
  >
</div>

<div class="mx-auto max-w-2xl p-8">
  <div class="flex items-start gap-8">
    <div class="bg-surface-100 flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg">
      {#if product.imageUrl}
        <img src={product.imageUrl} alt={product.name} class="h-full w-full object-cover" />
      {:else}
        <span class="text-4xl">📦</span>
      {/if}
    </div>
    <div class="flex-1">
      <div class="text-surface-900 mb-2 text-xl font-bold">{product.name}</div>
      <div class="text-surface-500 mb-1">카테고리: {product.category}</div>
      <div class="text-surface-500 mb-1">공급업체: {product.supplier} ({product.supplierContact})</div>
      <div class="text-surface-500 mb-1">등록일: {formatDate(product.registeredAt)}</div>
      <div class="text-surface-500 mb-1">최근 수정: {formatDate(product.lastUpdated)}</div>
      <div class="text-surface-500 mb-1">상태: <span class="font-semibold">{getStatusText(product.status)}</span></div>
    </div>
  </div>
  <div class="mt-8 grid grid-cols-2 gap-6">
    <div>
      <div class="text-surface-400 mb-1 text-xs">가격</div>
      <div class="text-surface-900 text-lg font-semibold">{formatCurrency(product.price)}</div>
    </div>
    <div>
      <div class="text-surface-400 mb-1 text-xs">초기 재고</div>
      <div class="text-surface-900 text-lg font-semibold">{product.initialStock}개</div>
    </div>
    <div>
      <div class="text-surface-400 mb-1 text-xs">현재 재고</div>
      <div class="text-surface-900 text-lg font-semibold">{product.currentStock}개</div>
    </div>
    <div>
      <div class="text-surface-400 mb-1 text-xs">총 판매량</div>
      <div class="text-surface-900 text-lg font-semibold">{product.totalSold}개</div>
    </div>
  </div>
  <div class="mt-8">
    <div class="text-surface-400 mb-1 text-xs">설명</div>
    <div class="text-surface-900 text-base">{product.description}</div>
  </div>
  <div class="mt-10 flex justify-end gap-2">
    <button
      class="bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-lg px-4 py-2 font-medium"
      on:click={goBack}>목록</button
    >
    <button
      class="bg-primary-500 hover:bg-primary-700 rounded-lg px-4 py-2 font-medium text-white"
      on:click={handleEdit}>수정</button
    >
    <button class="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-700" on:click={handleDelete}
      >삭제</button
    >
  </div>
</div>
