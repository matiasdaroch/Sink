<script setup lang="ts">
defineProps<{
  count: number
}>()

const emit = defineEmits<{
  confirm: []
}>()

const open = defineModel<boolean>('open', { default: false })

function confirm() {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t('links.bulk.delete_title', { count }) }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t('links.bulk.delete_description') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          {{ $t('common.cancel') }}
        </AlertDialogCancel>
        <Button variant="destructive" @click="confirm">
          {{ $t('common.delete') }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
