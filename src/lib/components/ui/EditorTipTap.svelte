<script lang="ts">
  import Color from '@tiptap/extension-color'
  import Highlight from '@tiptap/extension-highlight'
  import TextAlign from '@tiptap/extension-text-align'
  import { TextStyleKit } from '@tiptap/extension-text-style'
  import StarterKit from '@tiptap/starter-kit'
  import { onMount } from 'svelte'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import type { Readable } from 'svelte/store'

  type Level = 1 | 2 | 3 | 4 | 5 | 6

  let { description = $bindable(), disabled = false } = $props()
  let editor = $state() as Readable<Editor>

  onMount(() => {
    editor = createEditor({
      content: description,
      editable: !disabled,
      extensions: [
        StarterKit,
        Highlight,
        TextStyleKit,
        Color.configure({ types: ['textStyle'] }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
      editorProps: {
        attributes: {
          class: 'prose max-w-none focus:outline-none min-h-[300px] p-4',
        },
      },
    })
  })

  function exec(
    cmd:
      | 'setParagraph'
      | 'toggleBold'
      | 'toggleItalic'
      | 'toggleStrike'
      | 'toggleHighlight'
      | 'setTextAlign'
      | 'toggleBulletList'
      | 'toggleOrderedList',
    value?: any
  ) {
    if (!$editor) return

    const chain = $editor.chain().focus()
    switch (cmd) {
      case 'setParagraph':
        return chain.setParagraph().run()
      case 'toggleBold':
        return chain.toggleBold().run()
      case 'toggleItalic':
        return chain.toggleItalic().run()
      case 'toggleStrike':
        return chain.toggleStrike().run()
      case 'toggleHighlight':
        return chain.toggleHighlight().run()
      case 'setTextAlign':
        return chain.setTextAlign(value).run()
      case 'toggleBulletList':
        return chain.toggleBulletList().run()
      case 'toggleOrderedList':
        return chain.toggleOrderedList().run()
      default:
        return
    }
  }
  function setHeading(level: Level) {
    $editor?.chain().focus().toggleHeading({ level }).run()
  }
  function setColor(e: Event) {
    const color = (e.target as HTMLInputElement).value
    $editor?.chain().focus().setColor(color).run()
  }
  function unsetColor() {
    $editor?.chain().focus().unsetColor().run()
  }
</script>

<!-- 툴바 -->

<div class="flex flex-wrap items-center gap-1 border-b bg-gray-50 p-2">
  <!-- Paragraph -->

  <button class="btn" type="button" onclick={() => exec('setParagraph')}> P </button>

  <!-- Heading -->

  <button class="btn" type="button" onclick={() => setHeading(1)}>H1</button>
  <button class="btn" type="button" onclick={() => setHeading(2)}>H2</button>
  <button class="btn" type="button" onclick={() => setHeading(3)}>H3</button>

  <div class="divider"></div>
  <!-- Bold / Italic / Strike -->

  <button class="btn" type="button" onclick={() => exec('toggleBold')}>B</button>
  <button class="btn italic" type="button" onclick={() => exec('toggleItalic')}>I</button>
  <button class="btn line-through" type="button" onclick={() => exec('toggleStrike')}>S</button>

  <div class="divider"></div>
  <!-- Highlight -->

  <button class="btn" type="button" onclick={() => exec('toggleHighlight')}> HL </button>

  <div class="divider"></div>
  <!-- Align -->

  <button class="btn" type="button" onclick={() => exec('setTextAlign', 'left')}>L</button>
  <button class="btn" type="button" onclick={() => exec('setTextAlign', 'center')}>C</button>
  <button class="btn" type="button" onclick={() => exec('setTextAlign', 'right')}>R</button>

  <div class="divider"></div>
  <!-- Color -->

  <input type="color" class="h-8 w-8 cursor-pointer rounded-md border bg-white" onchange={setColor} />

  <button class="btn" type="button" onclick={unsetColor}>Clr-</button>

  <div class="divider"></div>
  <!-- Bullet / Number List -->

  <button class="btn" type="button" onclick={() => exec('toggleBulletList')}>• List</button>
  <button class="btn" type="button" onclick={() => exec('toggleOrderedList')}>1. List</button>
</div>
<!-- 에디터 -->
<div class="border"><EditorContent editor={$editor} /></div>

<style>
  /* .btn {
    @apply border border-gray-300 bg-white px-2 py-1 text-sm transition hover:bg-gray-100 active:bg-gray-200;
  } */
  /* .divider {
    @apply mx-1 h-5 w-px bg-gray-300;
  } */
</style>
