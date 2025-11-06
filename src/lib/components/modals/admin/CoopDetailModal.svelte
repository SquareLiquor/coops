<script lang="ts">
  import type { CoopData } from '$lib/types/entities/coop'
  let { coop, onClose }: { coop: CoopData | null; onClose: () => void } = $props()
</script>

{#if coop}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="relative mx-auto flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl">
      <!-- 헤더 -->
      <div class="border-surface-100 flex h-16 items-center justify-between border-b px-6">
        <h2 class="text-surface-900 text-xl font-bold">판매상품 상세정보 (TODO: 디자인 개선)</h2>
        <button
          type="button"
          class="text-xl text-gray-400 hover:text-gray-600 focus:outline-none"
          onclick={onClose}
          aria-label="닫기"
        >
          &times;
        </button>
      </div>
      <!-- 본문 -->
      <div class="flex flex-col gap-6 overflow-y-auto p-6 md:flex-row">
        <!-- 좌측: 기본정보 -->
        <section class="border-surface-100 mb-4 min-w-[220px] flex-1 rounded-lg border bg-white p-4 md:mb-0">
          <h3 class="mb-2 text-lg font-semibold">기본정보</h3>
          <hr class="hr mb-3" />
          <div class="mb-2">
            <div class="text-surface-900 mb-1 text-base font-bold">{coop.name}</div>
            <div class="text-surface-400 mb-1 text-xs">카테고리: {coop.product?.category?.name}</div>
          </div>
          <div>
            <div class="label-text mb-1 text-xs font-medium">상세정보</div>
            <div class="border-surface-100 bg-surface-50 min-h-[80px] rounded border p-3 text-sm">
              {@html coop.description}
            </div>
          </div>
        </section>
        <!-- 우측: 판매 정보 -->
        <section class="border-surface-100 min-w-[220px] flex-1 rounded-lg border bg-white p-4">
          <h3 class="mb-2 text-lg font-semibold">판매 정보</h3>
          <hr class="hr mb-3" />
          <div class="mb-2 grid grid-cols-2 gap-2">
            <div>
              <div class="label-text mb-1 text-xs font-medium">상태</div>
              <div class="input bg-surface-50 border-surface-200 cursor-default">{coop.status?.label}</div>
            </div>
            <div>
              <div class="label-text mb-1 text-xs font-medium">가격</div>
              <div class="input bg-surface-50 border-surface-200 cursor-default">
                {coop.sales_price?.toLocaleString()}원
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="label-text mb-1 text-xs font-medium">판매일</div>
              <div class="input bg-surface-50 border-surface-200 cursor-default">{coop.sales_date}</div>
            </div>
            <div>
              <div class="label-text mb-1 text-xs font-medium">진행률</div>
              <div class="input bg-surface-50 border-surface-200 cursor-default">
                {coop.current_quantity} / {coop.max_quantity}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0;
  }
  .input {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f9fafb;
    color: #222;
    font-size: 0.95rem;
    min-height: 2.25rem;
    display: flex;
    align-items: center;
  }
</style>
