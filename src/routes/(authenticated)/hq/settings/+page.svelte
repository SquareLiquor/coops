<script lang="ts">
  let generalSettings = {
    companyName: '협업농산 본사',
    businessNumber: '123-45-67890',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    email: 'info@coops.co.kr',
    website: 'https://coops.co.kr',
  }

  let businessSettings = {
    defaultDeliveryFee: 3000,
    freeDeliveryThreshold: 50000,
    maxOrderQuantity: 100,
    orderTimeLimit: '18:00',
    autoApprovalAmount: 1000000,
    minimumOrderAmount: 10000,
  }

  let notificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderNotifications: true,
    stockNotifications: true,
    paymentNotifications: true,
  }

  let securitySettings = {
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipWhitelist: '',
  }

  let activeTab = 'general'

  function saveSettings(settingsType: string) {
    console.log(`Saving ${settingsType} settings...`)
    // 설정 저장 로직
  }

  function resetSettings(settingsType: string) {
    if (confirm('설정을 기본값으로 초기화하시겠습니까?')) {
      console.log(`Resetting ${settingsType} settings...`)
      // 설정 초기화 로직
    }
  }

  function exportSettings() {
    console.log('Exporting settings...')
    // 설정 내보내기 로직
  }

  function importSettings() {
    console.log('Importing settings...')
    // 설정 가져오기 로직
  }
</script>

<svelte:head>
  <title>설정 - 본사</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm">
  <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <div class="flex items-center space-x-4">
      <h1 class="text-2xl font-bold text-gray-900">본사 설정</h1>
    </div>
    <div class="flex items-center gap-3">
      <button
        on:click={exportSettings}
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        내보내기
      </button>
      <button
        on:click={importSettings}
        class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
      >
        가져오기
      </button>
    </div>
  </div>

  <div class="flex">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-50 border-r border-gray-200">
      <nav class="p-4 space-y-2">
        <button
          on:click={() => (activeTab = 'general')}
          class={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'general' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          기본 설정
        </button>

        <button
          on:click={() => (activeTab = 'business')}
          class={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'business' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          운영 설정
        </button>

        <button
          on:click={() => (activeTab = 'notifications')}
          class={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'notifications' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          </svg>
          알림 설정
        </button>

        <button
          on:click={() => (activeTab = 'security')}
          class={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'security' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          보안 설정
        </button>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-6">
      {#if activeTab === 'general'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">기본 설정</h2>
            <div class="flex gap-2">
              <button
                on:click={() => resetSettings('general')}
                class="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                초기화
              </button>
              <button
                on:click={() => saveSettings('general')}
                class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                저장
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label for="companyName" class="block text-sm font-medium text-gray-700 mb-2">회사명</label>
              <input
                id="companyName"
                type="text"
                bind:value={generalSettings.companyName}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label for="businessNumber" class="block text-sm font-medium text-gray-700 mb-2">사업자등록번호</label>
              <input
                id="businessNumber"
                type="text"
                bind:value={generalSettings.businessNumber}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div class="col-span-2">
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2">주소</label>
              <input
                id="address"
                type="text"
                bind:value={generalSettings.address}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
              <input
                id="phone"
                type="tel"
                bind:value={generalSettings.phone}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input
                id="email"
                type="email"
                bind:value={generalSettings.email}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div class="col-span-2">
              <label for="website" class="block text-sm font-medium text-gray-700 mb-2">웹사이트</label>
              <input
                id="website"
                type="url"
                bind:value={generalSettings.website}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      {:else if activeTab === 'business'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">운영 설정</h2>
            <div class="flex gap-2">
              <button
                on:click={() => resetSettings('business')}
                class="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                초기화
              </button>
              <button
                on:click={() => saveSettings('business')}
                class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                <div>
                  <label for="defaultDeliveryFee" class="block text-sm font-medium text-gray-700 mb-2"
                    >기본 배송비 (원)</label
                  >
                  <input
                    id="defaultDeliveryFee"
                    type="number"
                    bind:value={businessSettings.defaultDeliveryFee}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label for="freeDeliveryThreshold" class="block text-sm font-medium text-gray-700 mb-2"
                    >무료배송 기준금액 (원)</label
                  >
                  <input
                    id="freeDeliveryThreshold"
                    type="number"
                    bind:value={businessSettings.freeDeliveryThreshold}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label for="maxOrderQuantity" class="block text-sm font-medium text-gray-700 mb-2"
                    >최대 주문 수량</label
                  >
                  <input
                    id="maxOrderQuantity"
                    type="number"
                    bind:value={businessSettings.maxOrderQuantity}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label for="orderTimeLimit" class="block text-sm font-medium text-gray-700 mb-2">주문 마감 시간</label
                  >
                  <input
                    id="orderTimeLimit"
                    type="time"
                    bind:value={businessSettings.orderTimeLimit}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label for="autoApprovalAmount" class="block text-sm font-medium text-gray-700 mb-2"
                    >자동승인 금액 (원)</label
                  >
                  <input
                    id="autoApprovalAmount"
                    type="number"
                    bind:value={businessSettings.autoApprovalAmount}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label for="minimumOrderAmount" class="block text-sm font-medium text-gray-700 mb-2"
                    >최소 주문 금액 (원)</label
                  >
                  <input
                    id="minimumOrderAmount"
                    type="number"
                    bind:value={businessSettings.minimumOrderAmount}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                />
              </button>
            </div>

            <div>
              <label for="minimumOrderAmount2" class="block text-sm font-medium text-gray-700 mb-2"
                >최소 주문 금액 (원)</label
              >
              <input
                id="minimumOrderAmount2"
                type="number"
                bind:value={businessSettings.minimumOrderAmount}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      {:else if activeTab === 'notifications'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">알림 설정</h2>
            <div class="flex gap-2">
              <button
                on:click={() => resetSettings('notifications')}
                class="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                초기화
              </button>
              <button
                on:click={() => saveSettings('notifications')}
                class="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                저장
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900">이메일 알림</h3>
                <p class="text-sm text-gray-500">이메일로 알림을 받습니다</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" bind:checked={notificationSettings.emailNotifications} class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900">SMS 알림</h3>
                <p class="text-sm text-gray-500">문자로 알림을 받습니다</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" bind:checked={notificationSettings.smsNotifications} class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900">푸시 알림</h3>
                <p class="text-sm text-gray-500">브라우저 푸시 알림을 받습니다</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" bind:checked={notificationSettings.pushNotifications} class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                ></div>
              </label>
            </div>

            <div class="border-t pt-4">
              <h3 class="font-medium text-gray-900 mb-3">알림 종류</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">주문 알림</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={notificationSettings.orderNotifications}
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                    ></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">재고 알림</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={notificationSettings.stockNotifications}
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                    ></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">결제 알림</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={notificationSettings.paymentNotifications}
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                    ></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else if activeTab === 'security'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">보안 설정</h2>
            <div class="flex gap-2">
              <button
                on:click={() => resetSettings('security')}
                class="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <div>
                  <label for="passwordMinLength" class="block text-sm font-medium text-gray-700 mb-2"
                    >비밀번호 최소 길이</label
                  >
                  <input
                    id="passwordMinLength"
                    type="number"
                    bind:value={securitySettings.passwordMinLength}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    min="6"
                    max="20"
                  />
                </div>
                <div>
                  <label for="sessionTimeout" class="block text-sm font-medium text-gray-700 mb-2"
                    >세션 타임아웃 (분)</label
                  >
                  <input
                    id="sessionTimeout"
                    type="number"
                    bind:value={securitySettings.sessionTimeout}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    min="5"
                    max="120"
                  />
                </div>
                <div>
                  <label for="maxLoginAttempts" class="block text-sm font-medium text-gray-700 mb-2"
                    >최대 로그인 시도 횟수</label
                  >
                  <input
                    id="maxLoginAttempts"
                    type="number"
                    bind:value={securitySettings.maxLoginAttempts}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    min="3"
                    max="10"
                  />
                </div>
                max="120" />
              </button>
            </div>

            <div>
              <label for="maxLoginAttempts2" class="block text-sm font-medium text-gray-700 mb-2"
                >최대 로그인 시도 횟수</label
              >
              <input
                id="maxLoginAttempts2"
                type="number"
                bind:value={securitySettings.maxLoginAttempts}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                min="3"
                max="10"
              />
            </div>

            <div class="col-span-2">
              <label for="ipWhitelist" class="block text-sm font-medium text-gray-700 mb-2">IP 화이트리스트</label>
              <textarea
                id="ipWhitelist"
                bind:value={securitySettings.ipWhitelist}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                rows="3"
                placeholder="허용할 IP 주소를 줄바꿈으로 구분하여 입력하세요"
              ></textarea>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
