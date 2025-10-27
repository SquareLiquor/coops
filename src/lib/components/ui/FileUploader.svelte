<script lang="ts">
  import { FileUpload, useFileUpload } from '@skeletonlabs/skeleton-svelte'

  const acceptedFiles: File[] = $state([])

  const fileUpload = useFileUpload({
    id: '1',
    defaultAcceptedFiles: [new File(['file'], 'example.png', { type: 'image/png' })],
  })

  const handleFileChange = (details: any) => {
    acceptedFiles.push(...(details?.acceptedFiles || []))
    console.log('File changed:', details?.acceptedFiles, fileUpload().acceptedFiles)
  }
</script>

<FileUpload
  onFileChange={handleFileChange}
  onFileAccept={(e) => console.log('Files accepted:', e)}
  onFileReject={(e) => console.log('Files rejected:', e)}
>
  <FileUpload.Dropzone>
    <span>Select file or drag here.</span>
    <FileUpload.Trigger>Browse Files</FileUpload.Trigger>
    <FileUpload.HiddenInput />
  </FileUpload.Dropzone>
  <FileUpload.ItemGroup>
    <FileUpload.Context>
      {#snippet children(fileUpload)}
        {#each fileUpload().acceptedFiles as file (file.name)}
          <FileUpload.Item {file}>
            <FileUpload.ItemName>{file.name}</FileUpload.ItemName>
            <FileUpload.ItemSizeText>{file.size} bytes</FileUpload.ItemSizeText>
            <FileUpload.ItemDeleteTrigger />
          </FileUpload.Item>
        {/each}
      {/snippet}
    </FileUpload.Context>
  </FileUpload.ItemGroup>
</FileUpload>

{#if acceptedFiles.length > 0}
  <button class="btn preset-filled hover:preset-filled-error-500 w-fit" onclick={() => fileUpload().clearFiles()}
    >Clear Files</button
  >
{/if}
