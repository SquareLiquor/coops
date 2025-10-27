<!-- https://tiptap.dev/docs/editor/getting-started/install/svelte -->

<script>
  import { Editor } from '@tiptap/core'
  import { StarterKit } from '@tiptap/starter-kit'
  import { onDestroy, onMount } from 'svelte'
  import { EditorContent } from 'svelte-tiptap'
  // import BubbleMenu from '@tiptap/extension-bubble-menu'

  // Svelte uses plain `let` for reactive variables
  let bubbleMenu
  let editor = $state()

  onMount(() => {
    editor = new Editor({
      extensions: [
        StarterKit,
        // BubbleMenu.configure({
        //   element: bubbleMenu,
        // }),
      ],
      content: `
        <h1>Hello Svelte! 🌍️ </h1>
        <p>This editor is running in Svelte.</p>
        <p>Select some text to see the bubble menu popping up.</p>
      `,
      // keep the outer `editor` variable in sync when the editor updates
      onUpdate: ({ editor: updated }) => {
        // assign to the outer variable so Svelte reactivity picks up changes
        editor = updated
      },
    })
  })

  onDestroy(() => {
    if (editor) editor.destroy()
  })
</script>

<div style="position: relative" class="app">
  {#if editor}
    <div class="fixed-menu">
      <button
        class="btn"
        onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        class:active={editor.isActive('heading', { level: 1 })}
      >
        H1
      </button>
      <button
        class="btn"
        onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        class:active={editor.isActive('heading', { level: 2 })}
      >
        H2
      </button>
      <button
        class="btn"
        onclick={() => editor.chain().focus().setParagraph().run()}
        class:active={editor.isActive('paragraph')}
      >
        P
      </button>
    </div>
  {/if}

  <!-- Render the editor content via the Svelte integration which provides editor via context -->
  <EditorContent {editor} />
</div>

<style>
  button.active {
    background: black;
    color: white;
  }
</style>
