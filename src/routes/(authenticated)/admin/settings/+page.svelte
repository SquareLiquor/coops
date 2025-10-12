<script lang="ts">
  let activeTab = 'general';
  let settings = {
    siteName: '농협 공동구매 플랫폼',
    adminEmail: 'admin@coops.com',
    contactPhone: '02-1234-5678',
    businessAddress: '서울시 강남구 테헤란로 123',
    businessRegistration: '123-45-67890',
    enableNotifications: true,
    enableEmailAlerts: true,
    enableSMSAlerts: false,
    autoApproveOrders: false,
    minOrderAmount: 10000,
    maxOrderAmount: 1000000,
    deliveryFee: 3000,
    freeDeliveryThreshold: 50000
  };

  let saveStatus = '';

  function saveSettings() {
    // 설정 저장 로직
    saveStatus = 'saving';
    setTimeout(() => {
      saveStatus = 'saved';
      setTimeout(() => {
        saveStatus = '';
      }, 2000);
    }, 1000);
  }

  function resetSettings() {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      settings = {
        siteName: '농협 공동구매 플랫폼',
        adminEmail: 'admin@coops.com',
        contactPhone: '02-1234-5678',
        businessAddress: '서울시 강남구 테헤란로 123',
        businessRegistration: '123-45-67890',
        enableNotifications: true,
        enableEmailAlerts: true,
        enableSMSAlerts: false,
        autoApproveOrders: false,
        minOrderAmount: 10000,
        maxOrderAmount: 1000000,
        deliveryFee: 3000,
        freeDeliveryThreshold: 50000
      };
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }
</script>

<svelte:head>
  <title>설정 - 관리자</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">설정</h1>
    </div>
  </div>

  <div class="p-6">
    <!-- 탭 네비게이션 -->
    <div class="border-b border-gray-200 -mx-6 mb-6">
      <nav class="-mb-px flex space-x-8 px-6">
        <button
          on:click={() => (activeTab = 'general')}
          class={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'general'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          일반 설정
        </button>
        <button
          on:click={() => (activeTab = 'notifications')}
          class={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'notifications'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          알림 설정
        </button>
        <button
          on:click={() => (activeTab = 'orders')}
          class={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'orders'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          주문 설정
        </button>
        <button
          on:click={() => (activeTab = 'delivery')}
          class={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'delivery'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          배송 설정
        </button>
      </nav>
    </div>

    <!-- 일반 설정 탭 -->
    {#if activeTab === 'general'}
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900">기본 정보</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="siteName" class="block text-sm font-medium text-gray-700 mb-2"
              >사이트 이름</label
            >
            <input
              id="siteName"
              type="text"
              bind:value={settings.siteName}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
            />
          </div>

          <div>
            <label for="adminEmail" class="block text-sm font-medium text-gray-700 mb-2"
              >관리자 이메일</label
            >
            <input
              id="adminEmail"
              type="email"
              bind:value={settings.adminEmail}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
            />
          </div>

          <div>
            <label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-2"
              >고객센터 전화번호</label
            >
            <input
              id="contactPhone"
              type="tel"
              bind:value={settings.contactPhone}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
            />
          </div>

          <div>
            <label for="businessRegistration" class="block text-sm font-medium text-gray-700 mb-2"
              >사업자등록번호</label
            >
            <input
              id="businessRegistration"
              type="text"
              bind:value={settings.businessRegistration}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
            />
          </div>

          <div class="md:col-span-2">
            <label for="businessAddress" class="block text-sm font-medium text-gray-700 mb-2"
              >사업장 주소</label
            >
            <input
              id="businessAddress"
              type="text"
              bind:value={settings.businessAddress}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
            />
          </div>
        </div>
      </div>
    {/if}

    <!-- 알림 설정 탭 -->
    {#if activeTab === 'notifications'}
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900">알림 설정</h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">일반 알림</h4>
              <p class="text-sm text-gray-500">새로운 주문, 문의사항 등의 알림을 받습니다.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.enableNotifications}
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">이메일 알림</h4>
              <p class="text-sm text-gray-500">중요한 알림을 이메일로 받습니다.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.enableEmailAlerts}
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">SMS 알림</h4>
              <p class="text-sm text-gray-500">긴급한 알림을 문자메시지로 받습니다.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" bind:checked={settings.enableSMSAlerts} class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
              ></div>
            </label>
          </div>
        </div>
      </div>
    {/if}

    <!-- 주문 설정 탭 -->
    {#if activeTab === 'orders'}
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900">주문 관리</h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">자동 주문 승인</h4>
              <p class="text-sm text-gray-500">새로운 주문을 자동으로 승인합니다.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.autoApproveOrders}
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
              ></div>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="minOrderAmount" class="block text-sm font-medium text-gray-700 mb-2"
                >최소 주문 금액</label
              >
              <input
                id="minOrderAmount"
                type="number"
                bind:value={settings.minOrderAmount}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
              />
              <p class="mt-1 text-xs text-gray-500">
                현재: {formatCurrency(settings.minOrderAmount)}
              </p>
            </div>

            <div>
              <label for="maxOrderAmount" class="block text-sm font-medium text-gray-700 mb-2"
                >최대 주문 금액</label
              >
              <input
                id="maxOrderAmount"
                type="number"
                bind:value={settings.maxOrderAmount}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
              />
              <p class="mt-1 text-xs text-gray-500">
                현재: {formatCurrency(settings.maxOrderAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- 배송 설정 탭 -->
    {#if activeTab === 'delivery'}
      <div class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900">배송 정책</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="deliveryFee" class="block text-sm font-medium text-gray-700 mb-2"
              >기본 배송비</label
            >
            <input
              id="deliveryFee"
              type="number"
              bind:value={settings.deliveryFee}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
            />
            <p class="mt-1 text-xs text-gray-500">
              현재: {formatCurrency(settings.deliveryFee)}
            </p>
          </div>

          <div>
            <label for="freeDeliveryThreshold" class="block text-sm font-medium text-gray-700 mb-2"
              >무료배송 기준금액</label
            >
            <input
              id="freeDeliveryThreshold"
              type="number"
              bind:value={settings.freeDeliveryThreshold}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 has-[value]:border-primary-500 has-[value]:text-primary-700"
            />
            <p class="mt-1 text-xs text-gray-500">
              현재: {formatCurrency(settings.freeDeliveryThreshold)} 이상 무료배송
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- 액션 버튼 -->
  <div class="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
    <button
      on:click={resetSettings}
      class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
    >
      기본값으로 초기화
    </button>

    <div class="flex items-center gap-3">
      {#if saveStatus === 'saving'}
        <div class="flex items-center gap-2 text-indigo-600">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span class="text-sm">저장중...</span>
        </div>
      {:else if saveStatus === 'saved'}
        <div class="flex items-center gap-2 text-green-600">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-sm">저장완료</span>
        </div>
      {/if}

      <button
        on:click={saveSettings}
        disabled={saveStatus === 'saving'}
        class={`px-6 py-2 rounded-lg font-medium transition-colors ${
          saveStatus === 'saving'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        }`}
      >
        설정 저장
      </button>
    </div>
  </div>
</div>
