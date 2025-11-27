<script lang="ts">
  import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from '@lucide/svelte'

  type AlertType = 'info' | 'error' | 'warning' | 'success'
  type AlertMode = 'alert' | 'confirm'

  let {
    type = 'info',
    mode = 'alert',
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel,
    onClose,
  }: {
    type?: AlertType
    mode?: AlertMode
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    onCancel?: () => void
    onClose?: () => void
  } = $props()

  const iconComponents = {
    info: Info,
    error: CircleAlert,
    warning: TriangleAlert,
    success: CircleCheck,
  }

  const typeConfig = {
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    error: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
  }

  const IconComponent = $derived(iconComponents[type])

  const config = $derived(typeConfig[type])

  const handleConfirm = () => {
    onConfirm?.()
    onClose?.()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }
</script>

<!-- 오버레이 -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
  <!-- Alert 모달 -->
  <div class="w-full max-w-md rounded-2xl bg-white shadow-xl">
    <!-- 헤더 영역 -->
    <div class="relative flex items-center gap-4 border-b border-gray-100 p-6">
      <!-- 아이콘 -->
      <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full {config.iconBg}">
        <IconComponent class="h-6 w-6 {config.iconColor}" />
      </div>

      <!-- 제목 -->
      <h3 class="flex-1 text-lg font-semibold text-gray-900">{title}</h3>

      <!-- 닫기 버튼 -->
      {#if onClose}
        <button
          type="button"
          onclick={onClose}
          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="닫기"
        >
          <X class="h-5 w-5" />
        </button>
      {/if}
    </div>

    <!-- 메시지 영역 -->
    <div class="p-6">
      <p class="text-sm leading-relaxed text-gray-600">{message}</p>
    </div>

    <!-- 버튼 영역 -->
    <div class="flex gap-3 border-t border-gray-100 p-6">
      {#if mode === 'confirm'}
        <button
          type="button"
          onclick={handleCancel}
          class="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          {cancelText}
        </button>
      {/if}
      <button
        type="button"
        onclick={handleConfirm}
        class="flex-1 rounded-full px-4 py-2.5 text-sm font-medium text-white transition-colors {config.buttonBg}"
      >
        {confirmText}
      </button>
    </div>
  </div>
</div>
