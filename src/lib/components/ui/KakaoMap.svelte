<script lang="ts">
  import type { AddressInput } from '$lib/schemas'
  import { loadKakaoMap } from '$lib/utils/loadKakao'
  import { onMount } from 'svelte'

  interface Props {
    selectedAddress?: Omit<AddressInput, 'addressDetail'> | undefined
    viewMode?: boolean
  }

  let { selectedAddress = $bindable(), viewMode = false }: Props = $props()
  let selectedAddressType = $state<'ROAD' | 'JIBUN'>(selectedAddress?.addressType === 'JIBUN' ? 'JIBUN' : 'ROAD')

  let mapContainer = $state<HTMLDivElement | null>(null)
  let map: any, marker: any, geocoder: any, places: any

  let isSearching = $state(false)
  let showResults = $state(false)
  let searchKeyword = $state('')
  let searchResults = $state<any[]>([])

  // 지도 초기화
  onMount(async () => {
    const kakao = await loadKakaoMap()
    geocoder = new kakao.maps.services.Geocoder()
    places = new kakao.maps.services.Places()

    const latitude = selectedAddress?.latitude ?? 37.5665
    const longitude = selectedAddress?.longitude ?? 126.978
    const center = new kakao.maps.LatLng(latitude, longitude)

    map = new kakao.maps.Map(mapContainer, { center, level: 3 })
    marker = new kakao.maps.Marker({ map, position: center })

    if (selectedAddress?.addressType) {
      selectedAddressType = selectedAddress.addressType
    }

    if (!viewMode) {
      kakao.maps.event.addListener(map, 'click', (e: any) => {
        const position = e.latLng
        marker.setPosition(position)
        handleMarkerChanged(position.getLat(), position.getLng())
      })
    }
  })

  // radio 선택 변경 감지
  $effect(() => {
    if (selectedAddress && !viewMode) {
      const newAddress = selectedAddressType === 'ROAD' ? selectedAddress.roadAddress : selectedAddress.jibunAddress

      if (newAddress && selectedAddress.address !== newAddress) {
        console.log('selectedAddressType changed:', selectedAddressType)
        selectedAddress = {
          ...selectedAddress,
          address: newAddress,
          addressType: selectedAddressType,
        }
      }
    }
  })

  // 주소 검색 자동 완성
  const handleInputChange = () => {
    if (!places || searchKeyword.trim().length < 2) {
      searchResults = []
      showResults = false
      return
    }

    places.keywordSearch(searchKeyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        searchResults = data.slice(0, 5)
        showResults = true
      } else {
        searchResults = []
        showResults = false
      }
    })
  }

  // 주소 검색 버튼
  const handleSearch = () => {
    if (!geocoder || !searchKeyword.trim()) return

    isSearching = true
    geocoder.addressSearch(searchKeyword, (result: any, status: any) => {
      isSearching = false
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const data = result[0]
        const coord = new window.kakao.maps.LatLng(parseFloat(data.x), parseFloat(data.x))

        map.setCenter(coord)
        marker.setPosition(coord)

        const roadAddress = data.road_address?.address_name || ''
        const jibunAddress = data.address?.address_name || data.address_name

        // 도로명 주소가 있으면 도로명 우선, 없으면 지번
        selectedAddressType = roadAddress ? 'ROAD' : 'JIBUN'

        selectedAddress = {
          address: roadAddress || jibunAddress,
          addressType: selectedAddressType,
          roadAddress,
          jibunAddress,
          latitude: parseFloat(data.y),
          longitude: parseFloat(data.x),
          zipcode: data.road_address?.zone_no || '',
          buildingName: data.road_address?.building_name || '',
        }
      }
    })
  }

  // 지도에서 마커 선택
  const handleMarkerChanged = (latitude: number, longitude: number) => {
    if (!geocoder) return

    geocoder.coord2Address(longitude, latitude, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const data = result[0]

        const roadAddress = data.road_address?.address_name || ''
        const jibunAddress = data.address?.address_name || data.address_name

        // 도로명 주소가 있으면 도로명 우선, 없으면 지번
        selectedAddressType = roadAddress ? 'ROAD' : 'JIBUN'

        selectedAddress = {
          address: roadAddress || jibunAddress,
          addressType: selectedAddressType,
          roadAddress,
          jibunAddress,
          latitude,
          longitude,
          zipcode: data.road_address?.zone_no || '',
          buildingName: data.road_address?.building_name || '',
        }
      }
    })
  }

  // 검색 결과 선택
  const selectSearchResult = (result: any) => {
    const latitude = parseFloat(result.y)
    const longitude = parseFloat(result.x)
    const coord = new window.kakao.maps.LatLng(latitude, longitude)

    map.setCenter(coord)
    marker.setPosition(coord)
    handleMarkerChanged(latitude, longitude)

    searchKeyword = result.place_name || result.address_name
    showResults = false
  }
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
  <div class="relative">
    <div bind:this={mapContainer} class="h-[400px] w-full"></div>

    {#if !viewMode}
      <div class="absolute left-4 right-4 top-4 z-10">
        <div class="relative">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                type="text"
                bind:value={searchKeyword}
                oninput={handleInputChange}
                onkeypress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                onfocus={handleInputChange}
                onblur={() => setTimeout(() => (showResults = false), 200)}
                placeholder="도로명, 지번, 건물명으로 검색"
                class="focus:border-primary-500 w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />

              <!-- 검색 결과 드롭다운 -->
              {#if showResults && searchResults.length > 0}
                <div class="absolute top-full mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                  {#each searchResults as result, index}
                    <button
                      type="button"
                      onclick={() => selectSearchResult(result)}
                      class="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 last:border-b-0"
                    >
                      <div class="mb-1 text-sm font-medium text-gray-900">
                        {result.place_name || result.address_name}
                      </div>
                      <div class="text-xs text-gray-500">
                        {result.road_address_name || result.address_name}
                      </div>
                      {#if result.category_name}
                        <div class="mt-1 text-xs text-gray-400">{result.category_name}</div>
                      {/if}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <button
              type="button"
              onclick={handleSearch}
              disabled={isSearching}
              class="bg-primary-600 hover:bg-primary-700 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              검색
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if !viewMode && !selectedAddress}
      <div class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <div class="rounded-full bg-black/75 px-4 py-2 text-xs text-white shadow-lg">
          주소를 검색하거나 지도를 클릭하여 위치를 선택하세요
        </div>
      </div>
    {/if}
  </div>

  {#if selectedAddress}
    <div class="border-t border-gray-200 p-4">
      <div class="space-y-2">
        {#if selectedAddress.roadAddress}
          {@render address('ROAD', selectedAddress)}
        {/if}

        {#if selectedAddress.jibunAddress}
          {@render address('JIBUN', selectedAddress)}
        {/if}
      </div>
    </div>
  {/if}
</div>

{#snippet address(addressType: 'ROAD' | 'JIBUN', address: any)}
  <label
    class={[
      'flex items-start gap-3 rounded-xl border-2 p-3 transition-all',
      !viewMode ? 'cursor-pointer' : '',
      selectedAddressType === addressType ? 'border-primary-500 bg-primary-50' : 'border-gray-200',
      selectedAddressType === addressType && !viewMode && 'hover:border-gray-300',
    ]}
  >
    <input
      type="radio"
      bind:group={selectedAddressType}
      value={addressType}
      disabled={viewMode}
      class="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500"
    />
    <div class="flex-1">
      {#if addressType === 'ROAD'}
        <div class="mb-1 flex items-center gap-2">
          <span class="rounded bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">도로명</span>
          {#if address.zipcode}
            <span class="text-xs text-gray-500">{address.zipcode}</span>
          {/if}
        </div>
        <p class="text-sm font-medium text-gray-900">{address.roadAddress}</p>
        {#if address.buildingName}
          <p class="mt-1 text-xs text-gray-600">{address.buildingName}</p>
        {/if}
      {:else if addressType === 'JIBUN'}
        <div class="mb-1">
          <span class="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">지번</span>
        </div>
        <p class="text-sm font-medium text-gray-900">{address.jibunAddress}</p>
      {/if}
    </div>
  </label>
{/snippet}
