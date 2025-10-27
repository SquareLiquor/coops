<script>
  import { PUBLIC_TINYMCE_API_KEY } from '$env/static/public'
  import Editor from '@tinymce/tinymce-svelte'

  let { description = $bindable() } = $props()

  let conf = {
    height: 500,
    menubar: false,
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
  <Editor apiKey={PUBLIC_TINYMCE_API_KEY} bind:value={description} {conf} cssClass="min-h-[500px]" />
</main>
