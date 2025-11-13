<script>
  import { PUBLIC_TINYMCE_API_KEY } from '$env/static/public'
  import Editor from '@tinymce/tinymce-svelte'

  let { description = $bindable(), disabled = false } = $props()

  let conf = {
    menubar: false,
    height: 500,
    resize: true,
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
    toolbar:
      'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat',
  }
</script>

<main>
  <Editor
    apiKey={PUBLIC_TINYMCE_API_KEY}
    bind:value={description}
    inline={true}
    {disabled}
    {conf}
    cssClass="border border-surface-100 p-4 rounded-md focus-within:border-primary-500 overflow-hidden prose"
  />
</main>
