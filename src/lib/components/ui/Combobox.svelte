<script lang="ts">
  import { Combobox, Portal, useListCollection, type ComboboxRootProps } from '@skeletonlabs/skeleton-svelte'

  let { data = $bindable(), handleSelect, options } = $props()

  let items = $state(data)
  let { allowNewItem, handleAddNewItem, placeholder } = options

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

  const handleNewItem = (event: Event) => {
    const target = event.target as HTMLInputElement
    console.log('new item input: ', target.value)
  }
</script>

{#if items.length > 0}
  <Combobox
    class="w-full max-w-md"
    {placeholder}
    {collection}
    {onOpenChange}
    {onInputValueChange}
    onSelect={handleSelect}
    inputBehavior="autohighlight"
  >
    <Combobox.Control>
      <Combobox.Input />
      <Combobox.Trigger />
    </Combobox.Control>
    <Portal>
      <Combobox.Positioner class="z-[1]!">
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
  <div class="flex items-center gap-2">
    <input
      type="text"
      class="input placeholder-surface-200 w-full max-w-md"
      placeholder="카테고리 추가"
      oninput={handleNewItem}
    />
  </div>
{/if}
