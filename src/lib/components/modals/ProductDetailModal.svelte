<script lang="ts">
  let { productId, onClose }: { productId: string; onClose: () => void } = $props()

  // 임시 상품 데이터 (실제로는 API에서 fetch)
  const product = {
    id: productId,
    name: '샘플 상품',
    category: '식품',
    description: '이것은 샘플 상품의 상세 설명입니다.',
    price: 15000,
    initial_stock: 100,
    unit: 'KG',
    quantity_per_unit: 2,
    images: [
      { id: '1', url: 'https://via.placeholder.com/200x200', representative: true },
      { id: '2', url: 'https://via.placeholder.com/200x200', representative: false },
    ],
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  role="button"
  tabindex="0"
  onclick={onClose}
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }}
>
  <div
    class="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-xl"
    role="dialog"
    aria-modal="true"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- 헤더 -->
    <div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
      <div class="flex items-center space-x-4">
        <h1 class="text-surface-900 text-2xl font-bold">상품 상세정보 (TODO: Modal 디자인 변경)</h1>
      </div>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="btn bg-surface-50 hover:bg-surface-100 focus:ring-surface-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-black focus:ring-2 focus:ring-offset-2 focus:outline-none"
          onclick={() => {
            /* 편집 모드 */
          }}
        >
          편집
        </button>
        <button
          type="button"
          class="btn bg-surface-50 hover:bg-surface-100 focus:ring-surface-500 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-black focus:ring-2 focus:ring-offset-2 focus:outline-none"
          onclick={onClose}
        >
          닫기
        </button>
      </div>
    </div>

    <!-- 본문 내용 -->
    <div class="flex flex-1 gap-8 p-8">
      <!-- 좌측 패널: 기본정보 -->
      <div class="flex w-1/2 flex-col">
        <section class="border-surface-100 flex flex-1 flex-col rounded-lg border bg-white p-6">
          <h2 class="text-lg font-semibold">기본정보</h2>
          <hr class="hr my-4" />
          <div class="flex flex-col gap-4">
            <div class="label">
              <span class="label-text text-sm font-medium">상품명</span>
              <div class="input bg-surface-50 border-surface-200 cursor-default">{product.name}</div>
            </div>
            <div class="input bg-surface-50 border-surface-200 cursor-default">{product.name}</div>
            <div class="label">
              <span class="label-text text-sm font-medium">카테고리</span>
              <div class="input bg-surface-50 border-surface-200 cursor-default">{product.category}</div>
            </div>
            <div class="input bg-surface-50 border-surface-200 cursor-default">{product.category}</div>
            <div class="label flex flex-col">
              <span class="label-text text-sm font-medium">상세정보</span>
              <div class="border-surface-200 bg-surface-50 min-h-[200px] rounded-lg border p-4 text-sm">
                {product.description}
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 우측 패널: 판매 정보, 이미지 -->
      <div class="flex w-1/2 flex-col gap-8">
        <section class="border-surface-100 rounded-lg border bg-white p-6">
          <h2 class="text-lg font-semibold">판매 정보</h2>
          <hr class="hr my-4" />

          <div class="flex flex-col gap-4">
            <div class="label">
              <span class="label-text text-sm font-medium">가격</span>
              <div class="input bg-surface-50 border-surface-200 cursor-default">
                {product.price?.toLocaleString()}원
              </div>
            </div>
            <div class="label">
              <span class="label-text text-sm font-medium">재고</span>
              <div class="input bg-surface-50 border-surface-200 cursor-default">{product.initial_stock}개</div>
            </div>
            <div class="input bg-surface-50 border-surface-200 cursor-default">{product.initial_stock}개</div>
            <div class="label">
              <span class="label-text text-sm font-medium">단위</span>
              <div class="input bg-surface-50 border-surface-200 cursor-default">{product.unit}</div>
            </div>
            <div class="label">
              <span class="label-text text-sm font-medium">단위별 수량</span>
              <div class="input bg-surface-50 border-surface-200 cursor-default">{product.quantity_per_unit}</div>
            </div>
            <div class="label">
              <span class="label-text text-sm font-medium">개당 가격</span>
              <div class="input bg-surface-50 border-surface-200 cursor-default">
                {Math.round(product.price / product.quantity_per_unit).toLocaleString()}원
              </div>
            </div>
          </div>
        </section>

        <section class="border-surface-100 rounded-lg border bg-white p-6">
          <h2 class="text-lg font-semibold">상품 이미지</h2>
          <hr class="hr my-4" />
          <div class="grid grid-cols-3 gap-4">
            {#each product.images as image}
              <div class="relative">
                <div class="aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
                  <img src={image.url} alt="상품 이미지" class="h-full w-full object-cover" />
                </div>
                {#if image.representative}
                  <div class="absolute top-2 left-2">
                    <span class="bg-primary-500 rounded px-2 py-1 text-xs text-white">대표</span>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      </div>
    </div>
  </div>
</div>
