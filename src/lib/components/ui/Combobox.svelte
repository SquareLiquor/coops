<script lang="ts">
  import { Combobox, Portal, useListCollection, type ComboboxRootProps } from '@skeletonlabs/skeleton-svelte'

  let { selected = $bindable(), data = $bindable(), disabled = false, options } = $props()

  let items = $state(data)
  let { allowNewItem, placeholder, handleAddNewItem } = options
  let newItem = $state('')
  let addableNewItem = $derived(
    !!newItem && !items.some((item: any) => item.name.toLowerCase() === newItem.toLowerCase())
  )

  const collection = $derived(
    useListCollection({
      items: items,
      itemToString: (item) => item.name,
      itemToValue: (item) => item.id,
    })
  )

  // selected 변경 감지
  $effect(() => {
    // selected 값이 변경될 때마다 실행
    if (selected !== undefined) {
      items = data
    }
  })

  const onOpenChange = () => {
    items = data
  }

  const onInputValueChange: ComboboxRootProps['onInputValueChange'] = (event) => {
    const filtered = data.filter((item: any) => item.name.toLowerCase().includes(event.inputValue.toLowerCase()))
    if (filtered.length > 0) {
      items = filtered
    } else {
      items = data
    }
  }

  const handleSelect = (details: any) => {
    selected = details.itemValue
  }

  const _handleAddNewItem = async (event: Event) => {
    event.preventDefault()

    if (!addableNewItem) return

    await handleAddNewItem(newItem)
    newItem = ''
  }
</script>

<div class="grid grid-cols-2 gap-4">
  {#if items.length > 0}
    <Combobox
      class="combobox-custom"
      {placeholder}
      {disabled}
      {collection}
      {onOpenChange}
      {onInputValueChange}
      onSelect={handleSelect}
      value={[selected]}
      inputBehavior="autohighlight"
    >
      <Combobox.Control>
        <Combobox.Input class="border-none outline-none focus:outline-none" />
        <Combobox.Trigger />
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner class="z-[9999]!">
          <Combobox.Content>
            {#each items as item (item.id)}
              <Combobox.Item {item}>
                <Combobox.ItemText>{item.name}</Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            {/each}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox>
  {/if}

  {#if allowNewItem}
    <div class="relative">
      <input
        class="focus:border-primary-500 focus:ring-primary-200 h-10 w-full rounded-full border border-gray-300 bg-white px-4 pr-12 text-sm placeholder-gray-400 focus:ring-2 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
        type="text"
        placeholder="카테고리 추가"
        bind:value={newItem}
        {disabled}
        onkeydown={(e) => e.key === 'Enter' && _handleAddNewItem(e)}
      />
      <button
        class="bg-primary-600 hover:bg-primary-700 absolute top-1/2 right-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
        onclick={_handleAddNewItem}
        disabled={!addableNewItem || disabled}
        type="button"
        aria-label="Add new category"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-check text-white"
          aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg
        >
      </button>
    </div>
  {/if}
</div>

<style lang="postcss">
  :global(.combobox-custom [data-part='control']) {
    height: 2.5rem !important;
    width: 100% !important;
    border-radius: 9999px !important;
    border: 1px solid rgb(209 213 219) !important;
    background-color: white !important;
    padding-left: 1rem !important;
    padding-right: 2.5rem !important;
    font-size: 0.875rem !important;
    line-height: 1.25rem !important;
    display: flex !important;
    align-items: center !important;
    transition: all 0.2s ease !important;
    box-shadow: none !important;
  }

  :global(.combobox-custom [data-part='control'] > *) {
    border: none !important;
    background: transparent !important;
  }

  :global(.combobox-custom [data-part='control']:focus-within) {
    border-color: rgb(var(--color-primary-500)) !important;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-200), 0.5) !important;
    outline: none !important;
  }

  :global(.combobox-custom [data-part='input']) {
    width: 100% !important;
    background-color: transparent !important;
    font-size: 0.875rem !important;
    line-height: 1.25rem !important;
    outline: none !important;
    border: none !important;
    padding: 0 !important;
  }

  :global(.combobox-custom [data-part='input']::placeholder) {
    color: rgb(156 163 175) !important;
  }

  :global(.combobox-custom [data-part='trigger']) {
    display: flex !important;
    height: 100% !important;
    align-items: center !important;
    justify-content: center !important;
    padding-left: 0.5rem !important;
    flex-shrink: 0 !important;
    color: rgb(107 114 128) !important;
    transition: color 0.2s ease !important;
  }

  :global(.combobox-custom [data-part='trigger']:hover) {
    color: rgb(31 41 55) !important;
  }

  :global(.combobox-custom[data-disabled] [data-part='control']) {
    background-color: rgb(249 250 251) !important;
    color: rgb(107 114 128) !important;
  }

  :global(.combobox-custom [data-part='content']) {
    margin-top: 0.25rem !important;
    max-height: 15rem !important;
    overflow: auto !important;
    border-radius: 1rem !important;
    border: 1px solid rgb(229 231 235) !important;
    background-color: white !important;
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
  }

  :global(.combobox-custom [data-part='item']) {
    cursor: pointer !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
    line-height: 1.25rem !important;
    transition: background-color 0.15s ease !important;
  }

  :global(.combobox-custom [data-part='item']:hover) {
    background-color: rgb(243 244 246) !important;
  }

  :global(.combobox-custom [data-part='item'][data-highlighted]) {
    background-color: rgb(var(--color-primary-50)) !important;
    color: rgb(var(--color-primary-900)) !important;
  }
</style>
