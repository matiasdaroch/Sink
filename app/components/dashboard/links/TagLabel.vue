<script setup lang="ts">
// MIK customization: show `project/<name>` subtags as a folder icon plus the project name.
import { FolderKanban } from '@lucide/vue'
import { isProjectTag, projectNameFromTag } from '#shared/utils/project-tags'

const props = defineProps<{ tag: string }>()
const isProject = computed(() => isProjectTag(props.tag))
</script>

<template>
  <FolderKanban v-if="isProject" aria-hidden="true" class="size-3 shrink-0" />
  <span class="truncate" :title="tag">{{ isProject ? projectNameFromTag(tag) : tag }}</span>
</template>
