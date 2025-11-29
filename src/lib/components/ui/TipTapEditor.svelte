<script lang="ts">
  import {
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    List,
    ListOrdered,
    Palette,
    Pilcrow,
    Strikethrough,
    TextAlignCenter,
    TextAlignEnd,
    TextAlignStart,
  } from '@lucide/svelte'
  import Color from '@tiptap/extension-color'
  import Highlight from '@tiptap/extension-highlight'
  import TextAlign from '@tiptap/extension-text-align'
  import { TextStyleKit } from '@tiptap/extension-text-style'
  import StarterKit from '@tiptap/starter-kit'
  import { onMount } from 'svelte'
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap'
  import type { Readable } from 'svelte/store'

  type Level = 1 | 2 | 3 | 4 | 5 | 6

  let { content = $bindable('<p></p>'), disabled = false } = $props()
  let editor = $state() as Readable<Editor>

  onMount(() => {
    editor = createEditor({
      content,
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
          class: 'prose max-w-none focus:outline-none min-h-0 h-full p-4',
          scrolling: 'auto',
        },
      },
      onUpdate: ({ editor }) => {
        content = normalize(editor.getHTML())
      },
    })
  })

  $effect(() => {
    const current = normalize($editor.getHTML())
    const incoming = normalize(content)

    if (current !== incoming) $editor.commands.setContent(incoming || '')

    const currentEditable = $editor.isEditable
    const incomingEditable = !disabled
    if (currentEditable !== incomingEditable) $editor.setEditable(!disabled)
  })

  const normalize = (html: string) => {
    const trimmed = html.trim().toLowerCase()
    if (trimmed === '' || trimmed === '<p></p>' || trimmed === '<p><br></p>') {
      return ''
    }
    return trimmed
  }

  const exec = (
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
  ) => {
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
  const setHeading = (level: Level) => {
    $editor?.chain().focus().toggleHeading({ level }).run()
  }
  const setColor = (e: Event) => {
    const color = (e.target as HTMLInputElement).value
    $editor?.chain().focus().setColor(color).run()
  }
  const unsetColor = () => {
    $editor?.chain().focus().unsetColor().run()
  }
</script>

{#if editor}
  <div class="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
    <!-- Paragraph & Headings -->
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('paragraph')}
      type="button"
      onclick={() => exec('setParagraph')}
      title="본문"
    >
      <Pilcrow class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('heading', { level: 1 })}
      type="button"
      onclick={() => setHeading(1)}
      title="제목 1"
    >
      <Heading1 class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('heading', { level: 2 })}
      type="button"
      onclick={() => setHeading(2)}
      title="제목 2"
    >
      <Heading2 class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('heading', { level: 3 })}
      type="button"
      onclick={() => setHeading(3)}
      title="제목 3"
    >
      <Heading3 class="h-4 w-4" />
    </button>

    <div class="divider"></div>

    <!-- Text Formatting -->
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('bold')}
      type="button"
      onclick={() => exec('toggleBold')}
      title="굵게"
    >
      <Bold class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('italic')}
      type="button"
      onclick={() => exec('toggleItalic')}
      title="기울임"
    >
      <Italic class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('strike')}
      type="button"
      onclick={() => exec('toggleStrike')}
      title="취소선"
    >
      <Strikethrough class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('highlight')}
      type="button"
      onclick={() => exec('toggleHighlight')}
      title="형광펜"
    >
      <Highlighter class="h-4 w-4" />
    </button>

    <div class="divider"></div>

    <!-- Text Alignment -->
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive({ textAlign: 'left' })}
      type="button"
      onclick={() => exec('setTextAlign', 'left')}
      title="왼쪽 정렬"
    >
      <TextAlignStart class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive({ textAlign: 'center' })}
      type="button"
      onclick={() => exec('setTextAlign', 'center')}
      title="가운데 정렬"
    >
      <TextAlignCenter class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive({ textAlign: 'right' })}
      type="button"
      onclick={() => exec('setTextAlign', 'right')}
      title="오른쪽 정렬"
    >
      <TextAlignEnd class="h-4 w-4" />
    </button>

    <div class="divider"></div>

    <!-- Color -->
    <div class="relative">
      <input
        type="color"
        id="text-color"
        class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onchange={setColor}
        title="텍스트 색상"
      />
      <button class="toolbar-btn" type="button">
        <Palette class="h-4 w-4" />
      </button>
    </div>
    <button class="toolbar-btn" type="button" onclick={unsetColor} title="색상 제거">
      <Palette class="h-4 w-4 text-gray-400 line-through" />
    </button>

    <div class="divider"></div>

    <!-- Lists -->
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('bulletList')}
      type="button"
      onclick={() => exec('toggleBulletList')}
      title="글머리 기호"
    >
      <List class="h-4 w-4" />
    </button>
    <button
      class="toolbar-btn"
      class:active={$editor?.isActive('orderedList')}
      type="button"
      onclick={() => exec('toggleOrderedList')}
      title="번호 매기기"
    >
      <ListOrdered class="h-4 w-4" />
    </button>
  </div>

  <div class="h-72 h-full min-h-0 flex-1 overflow-auto border border-gray-200 bg-white">
    <EditorContent editor={$editor} class="custom-scroll h-72 overflow-auto" />
  </div>
{/if}

<style>
  /* 에디터 내부 스크롤바 커스텀 */
  :global(.custom-scroll)::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }
  :global(.custom-scroll)::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 6px;
    min-height: 40px;
  }
  :global(.custom-scroll)::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
  :global(.custom-scroll) {
    scrollbar-width: thin;
    scrollbar-color: #e5e7eb transparent;
  }
  :global(.toolbar-btn) {
    border-radius: 0.375rem;
    padding: 0.5rem;
    color: #4b5563;
    transition:
      color 0.15s,
      background 0.15s;
  }
  :global(.toolbar-btn:hover) {
    background: #f3f4f6;
    color: #111827;
  }
  :global(.toolbar-btn.active) {
    background: #dbeafe;
    color: #2563eb;
  }
  .divider {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
    height: 1.5rem;
    width: 1px;
    background: #d1d5db;
  }
</style>
