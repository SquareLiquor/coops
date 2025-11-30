<script lang="ts">
  import { buildForm } from '$lib/builders/form.builder'
  import KakaoMap from '$lib/components/ui/KakaoMap.svelte'
  import { StoreCreateSchema, StoreUpdateSchema } from '$lib/schemas'
  import { onlyPhoneNumberInput } from '$lib/utils'

  interface Props {
    data: {
      form: any
    }
    mode?: 'create' | 'edit'
    onSubmit?: () => void
    onError?: () => void
    onCancel?: () => void
  }

  let { data, mode = 'create', onSubmit, onError, onCancel }: Props = $props()

  const schema = mode === 'create' ? StoreCreateSchema : StoreUpdateSchema

  const {
    form: formData,
    message,
    errors,
    constraints,
    enhance,
    submitting,
  } = buildForm<typeof schema>({
    form: data.form,
    schema,
    resultHandler: {
      handleSuccess: async () => onSubmit?.(),
      handleFailure: async () => onError?.(),
    },
    options: {
      dataType: 'json',
      resetForm: false,
      invalidateAll: false,
    },
  })

  // Collapse 상태
  let basicInfoCollapsed = $state(false)
  let addressInfoCollapsed = $state(false)

  // 필수 항목 완료 상태
  const basicInfoComplete = $derived(!!$formData.name && !!$formData.type)
  const addressInfoComplete = $derived(true) // 주소는 선택사항

  const isEditMode = $derived(mode === 'edit')
  const formAction = $derived(isEditMode ? '?/update' : '?/create')
  const submitButtonText = $derived(isEditMode ? '수정' : '등록')
  const titleText = $derived(isEditMode ? '매장 수정' : '매장 등록')
</script>

{#if $submitting}
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
    <span class="loader-giant"></span>
  </div>
{/if}

<form method="POST" action={formAction} use:enhance class="flex h-full min-h-0 flex-1 flex-col bg-gray-100 p-6">
  <!-- Hidden inputs for edit mode -->
  {#if isEditMode}
    <input type="hidden" name="id" value={($formData as any).id} />
  {/if}

  <!-- 헤더 -->
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">{titleText}</h1>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        onclick={() => onCancel?.()}
      >
        취소
      </button>
      <button
        type="submit"
        class="bg-primary-600 hover:bg-primary-700 rounded-full px-5 py-2 text-xs font-medium text-white transition-colors"
      >
        {submitButtonText}
      </button>
    </div>
  </div>

  <div class="scrollbar-gutter-stable flex min-h-0 flex-1 flex-col gap-6 overflow-y-scroll pr-2 lg:flex-row">
    <!-- 좌측 패널 -->
    <div class="flex w-full flex-col gap-6 lg:w-1/3">
      <!-- 기본정보 -->
      <section class="rounded-2xl bg-white shadow-sm">
        <div class="flex w-full items-center justify-between p-6">
          <button
            type="button"
            class="text-sm font-semibold text-gray-900 hover:text-gray-700"
            onclick={() => (basicInfoCollapsed = !basicInfoCollapsed)}
          >
            <h2>기본 정보</h2>
          </button>
          <button
            type="button"
            class="flex items-center gap-2"
            onclick={() => (basicInfoCollapsed = !basicInfoCollapsed)}
          >
            {#if basicInfoComplete}
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            {:else}
              <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
              </svg>
            {/if}
            <svg
              class="h-5 w-5 text-gray-400 transition-transform"
              class:rotate-180={!basicInfoCollapsed}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        {#if !basicInfoCollapsed}
          <div class="flex flex-col gap-4 px-6 pb-6">
            <div class="flex flex-col">
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">매장명</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" name="active" class="peer sr-only" bind:checked={$formData.active} />
                  <div
                    class="peer peer-checked:bg-primary-500 peer-focus:ring-primary-300 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
                  ></div>
                  <span class="ml-3 text-sm font-medium text-gray-900">
                    {$formData.active ? '활성' : '비활성'}
                  </span>
                </label>
              </div>
              <input
                type="text"
                name="name"
                class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                bind:value={$formData.name}
                placeholder="매장명을 입력하세요"
                {...$constraints.name}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.name}
                  <span class="text-xs text-red-500">{$errors.name}</span>
                {/if}
              </div>
            </div>
            <div class="flex flex-col">
              <div class="mb-2 flex items-center gap-1.5">
                <span class="text-sm text-gray-700">매장 유형</span>
                <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
              </div>
              <select
                name="type"
                class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm focus:ring-2 focus:outline-none"
                bind:value={$formData.type}
                {...$constraints.type}
              >
                {#if $formData.type === 'hq'}
                  <option value="hq">본사</option>
                {:else}
                  <option value="branch">지점</option>
                {/if}
              </select>
              <div class="mt-1 min-h-[20px]">
                {#if $errors.type}
                  <span class="text-xs text-red-500">{$errors.type}</span>
                {/if}
              </div>
            </div>
            <div class="flex flex-col">
              <div class="mb-2 flex items-center gap-1.5">
                <span class="text-sm text-gray-700">전화번호</span>
                <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"></circle>
                </svg>
              </div>
              <input
                type="tel"
                name="phone"
                class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                bind:value={$formData.phone}
                oninput={onlyPhoneNumberInput}
                placeholder="010-1234-5678"
                maxlength="13"
                {...$constraints.phone}
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.phone}
                  <span class="text-xs text-red-500">{$errors.phone}</span>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </section>

      <!-- 주소정보 -->
      <section class="rounded-2xl bg-white shadow-sm">
        <div class="flex w-full items-center justify-between p-6">
          <button
            type="button"
            class="text-sm font-semibold text-gray-900 hover:text-gray-700"
            onclick={() => (addressInfoCollapsed = !addressInfoCollapsed)}
          >
            <h2>주소 정보</h2>
          </button>
          <button
            type="button"
            class="flex items-center gap-2"
            onclick={() => (addressInfoCollapsed = !addressInfoCollapsed)}
          >
            {#if addressInfoComplete}
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            {:else}
              <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"></circle>
              </svg>
            {/if}
            <svg
              class="h-5 w-5 text-gray-400 transition-transform"
              class:rotate-180={!addressInfoCollapsed}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        {#if !addressInfoCollapsed}
          <div class="flex flex-col gap-4 px-6 pb-6">
            <div class="flex flex-col">
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm text-gray-700">기본 주소</span>
                  <svg class="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"></circle>
                  </svg>
                </div>
                {#if $formData.address?.address}
                  <button type="button" class="text-gray-400 hover:text-gray-600 transition-colors" title="주소 초기화">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                {/if}
              </div>
              <input
                type="text"
                name="address.address"
                class="h-10 w-full rounded-full border border-gray-300 bg-gray-50 px-4 text-sm text-gray-700"
                value={$formData.address?.address || ''}
                readonly
                placeholder="주소 검색 후 선택"
              />
              <input type="hidden" name="address.roadAddress" value={$formData.address?.roadAddress || ''} />
              <input type="hidden" name="address.jibunAddress" value={$formData.address?.jibunAddress || ''} />
              <input type="hidden" name="address.zipcode" value={$formData.address?.zipcode || ''} />
              <input type="hidden" name="address.buildingName" value={$formData.address?.buildingName || ''} />
              <input type="hidden" name="address.latitude" value={$formData.address?.latitude || ''} />
              <input type="hidden" name="address.longitude" value={$formData.address?.longitude || ''} />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.address}
                  <span class="text-xs text-red-500">{$errors.address}</span>
                {/if}
              </div>
            </div>
            <div class="flex flex-col">
              <span class="mb-2 text-sm text-gray-700">상세 주소</span>
              <input
                type="text"
                name="address.addressDetail"
                class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none"
                bind:value={$formData.address.addressDetail}
                placeholder="동, 호수 등을 입력하세요"
              />
              <div class="mt-1 min-h-[20px]">
                {#if $errors.address?.addressDetail}
                  <span class="text-xs text-red-500">{$errors.address.addressDetail}</span>
                {/if}
              </div>
            </div>
            {#if $formData.address?.address}
              <div class="rounded-lg bg-gray-50 p-3">
                <p class="mt-1 text-xs text-gray-600">
                  <span class="font-medium">우편번호:</span>
                  {$formData.address.zipcode || '-'}
                </p>
                {#if $formData.address.latitude && $formData.address.longitude}
                  <p class="mt-1 text-xs text-gray-600">
                    <span class="font-medium">좌표:</span>
                    {$formData.address.latitude.toFixed(6)}, {$formData.address.longitude.toFixed(6)}
                  </p>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </section>
    </div>

    <div class="flex w-full flex-col lg:w-2/3">
      <section class="flex flex-1 flex-col rounded-2xl bg-white shadow-sm">
        <div class="p-6">
          <h2 class="text-sm font-semibold text-gray-900">주소 검색</h2>
        </div>
        <div class="flex min-h-0 flex-1 flex-col px-6 pb-6">
          <KakaoMap bind:selectedAddress={$formData.address} />
        </div>
      </section>
    </div>
  </div>
</form>
