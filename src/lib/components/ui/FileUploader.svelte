<script lang="ts">
  import { FileUpload } from '@skeletonlabs/skeleton-svelte'

  let { images = $bindable(), handleFileChange } = $props()

  // const fileUpload = useFileUpload({
  //   id: '1',
  //   defaultAcceptedFiles: [new File(['file'], 'example.png', { type: 'image/png' })],
  // })

  const acceptedFiles: File[] = $state([])

  // const handleFileChange = (details: any) => {
  //   acceptedFiles.push(...(details?.acceptedFiles || []))
  //   handleChange(acceptedFiles)
  //   console.log('Images in child', acceptedFiles)
  // }
</script>

<FileUpload onFileChange={handleFileChange} maxFiles={5}>
  <FileUpload.Dropzone>
    <span>Select file or drag here.</span>
    <FileUpload.Trigger>Browse Files</FileUpload.Trigger>
    <FileUpload.HiddenInput />
  </FileUpload.Dropzone>
  <FileUpload.ItemGroup>
    <FileUpload.Context>
      {#snippet children(fileUpload)}
        <!-- <div use:dndzone={{ items: acceptedFiles }}> -->
        {#each fileUpload().acceptedFiles as file (file.name)}
          <FileUpload.Item {file}>
            <img src={URL.createObjectURL(file)} alt={file.name} class="mt-2 max-h-48 object-contain" />
            <FileUpload.ItemName>{file.name}</FileUpload.ItemName>
            <FileUpload.ItemSizeText>{file.size} bytes</FileUpload.ItemSizeText>
            <FileUpload.ItemDeleteTrigger />
          </FileUpload.Item>
        {/each}
        <!-- </div> -->
      {/snippet}
    </FileUpload.Context>
  </FileUpload.ItemGroup>
</FileUpload>

{#if acceptedFiles.length > 0}
  <!-- {#each acceptedFiles as file (file.name)}
    <div class="mt-4">
      <strong>{file.name}</strong> - {file.size} bytes
      <img src={URL.createObjectURL(file)} alt={file.name} class="mt-2 max-h-48 object-contain" />
    </div>
  {/each}
  <br /> -->
  <!-- <button class="btn preset-filled hover:preset-filled-error-500 w-fit" onclick={() => fileUpload().clearFiles()}
    >Clear Files</button
  > -->
{/if}
