<script lang="ts">
  import Alert from '$lib/components/ui/Alert.svelte'
  import { closeAlert, getAlert, isAlertVisible } from '$lib/stores'

  const alert = $derived(getAlert())

  const handleConfirm = () => {
    alert?.onConfirm?.()
    closeAlert()
  }

  const handleCancel = () => {
    alert?.onCancel?.()
    closeAlert()
  }

  const handleClose = () => {
    closeAlert()
  }
</script>

{#if isAlertVisible() && alert}
  <Alert
    type={alert.type}
    mode={alert.mode}
    title={alert.title}
    message={alert.message}
    confirmText={alert.confirmText}
    cancelText={alert.cancelText}
    onConfirm={handleConfirm}
    onCancel={handleCancel}
    onClose={handleClose}
  />
{/if}
