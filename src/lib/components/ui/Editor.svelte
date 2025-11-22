<script lang="ts">
  import { PUBLIC_TINYMCE_API_KEY } from '$env/static/public'
  import Editor from '@tinymce/tinymce-svelte'

  let { description = $bindable(), disabled = false } = $props()

  let conf = {
    menubar: false,
    height: 500,
    resize: true,
    inline: true,
    // fixed_toolbar_container: '#toolbar-container',
    toolbar:
      'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat',
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'anchor',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'preview',
      'wordcount',
    ],
    content_style: `
      body {
        font-family: system-ui, sans-serif;
        line-height: 1.6;
      }
      .mce-content-body {
        min-height: 150px;
        outline: none;
      }
      p {
        margin: 0 0 0.75rem;
      }
      ul, ol {
        padding-left: 1.25rem;
      }
    `,
    setup: (editor: any) => {
      const fixToolbarFocus = () => {
        const buttons = document.querySelectorAll('.tox-tbtn')
        buttons.forEach((btn) => {
          btn.setAttribute('tabindex', '-1')
        })
      }

      editor.on('init', fixToolbarFocus)
      editor.on('focus', fixToolbarFocus)
      editor.on('blur', fixToolbarFocus)
    },
  }
</script>

<div id="toolbar-container" class="sticky top-0 z-20 bg-white shadow-sm"></div>
<div id="editor-wrapper" class="border-surface-100 min-h-[150px] rounded-md border bg-white px-3 py-2 shadow-sm">
  <Editor inline apiKey={PUBLIC_TINYMCE_API_KEY} bind:value={description} {conf} cssClass="prose" />
</div>
