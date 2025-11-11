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

<div class="flex max-w-md items-start gap-2">
  {#if items.length > 0}
    <Combobox
      class="flex-1"
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
        <Combobox.Input />
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
    <div class="input-group flex-1 grid-cols-[1fr_auto] flex-row items-stretch gap-1">
      <input
        class="ig-input placeholder-surface-200 w-full"
        type="text"
        placeholder="카테고리 추가"
        bind:value={newItem}
        {disabled}
        onkeydown={(e) => e.key === 'Enter' && _handleAddNewItem(e)}
      />
      <button
        class="ig-btn preset-filled"
        onclick={_handleAddNewItem}
        disabled={!addableNewItem || disabled}
        type="button"
        aria-label="Add new category"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-check"
          aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg
        >
      </button>
    </div>
  {/if}
</div>
