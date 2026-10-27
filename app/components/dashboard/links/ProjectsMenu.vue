<script setup lang="ts">
// MIK customization: top-bar dropdown listing the `project/*` subtags; picking one filters the links.
import { Check, ChevronDown, FolderKanban, LoaderCircle, X } from '@lucide/vue'
import { isProjectTag, PROJECT_TAG_PREFIX, projectNameFromTag } from '#shared/utils/project-tags'

interface TagCount {
  name: string
  count: number
}

const linksStore = useDashboardLinksStore()
const projects = shallowRef<TagCount[]>([])
const loading = shallowRef(false)
const error = shallowRef(false)
const search = shallowRef('')
let requestGeneration = 0

async function fetchProjects() {
  const generation = ++requestGeneration
  loading.value = true
  error.value = false
  try {
    const data = await useAPI<TagCount[]>('/api/link/tags')
    if (generation === requestGeneration)
      projects.value = data.filter(item => isProjectTag(item.name))
  }
  catch (cause) {
    if (generation === requestGeneration) {
      console.error(cause)
      error.value = true
    }
  }
  finally {
    if (generation === requestGeneration)
      loading.value = false
  }
}

const filteredProjects = computed(() => {
  const term = search.value.trim().toLowerCase()
  return term
    ? projects.value.filter(item => projectNameFromTag(item.name).includes(term))
    : projects.value
})

const activeLabel = computed(() => {
  const tag = linksStore.tag
  if (tag === PROJECT_TAG_PREFIX)
    return 'All projects'
  if (tag && isProjectTag(tag))
    return projectNameFromTag(tag)
  return 'Projects'
})

const isProjectFilter = computed(() => !!linksStore.tag?.startsWith(PROJECT_TAG_PREFIX))

function selectProject(tag: string | undefined) {
  linksStore.tag = tag
}

onMounted(fetchProjects)
linksStore.onLinkUpdate(() => void fetchProjects())
</script>

<template>
  <DropdownMenu @update:open="(open: boolean) => { if (!open) search = '' }">
    <DropdownMenuTrigger as-child>
      <Button
        :variant="isProjectFilter ? 'secondary' : 'outline'"
        class="max-w-56"
        aria-label="Filter by project"
      >
        <FolderKanban aria-hidden="true" class="size-4" />
        <span class="truncate">{{ activeLabel }}</span>
        <ChevronDown aria-hidden="true" class="size-4 opacity-60" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-72">
      <DropdownMenuLabel>Projects</DropdownMenuLabel>
      <div v-if="projects.length > 8" class="px-1 pb-1">
        <Input
          v-model="search"
          type="search"
          placeholder="Find a project…"
          aria-label="Find a project"
          @keydown.stop
        />
      </div>
      <DropdownMenuItem @select="selectProject(PROJECT_TAG_PREFIX)">
        <Check
          aria-hidden="true"
          class="size-4"
          :class="linksStore.tag === PROJECT_TAG_PREFIX ? 'opacity-100' : `
            opacity-0
          `"
        />
        All projects
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div class="max-h-72 overflow-y-auto">
        <DropdownMenuItem
          v-for="item in filteredProjects"
          :key="item.name"
          @select="selectProject(item.name)"
        >
          <Check
            aria-hidden="true"
            class="size-4"
            :class="linksStore.tag === item.name ? 'opacity-100' : 'opacity-0'"
          />
          <span class="min-w-0 flex-1 truncate">{{ projectNameFromTag(item.name) }}</span>
          <span class="text-xs text-muted-foreground tabular-nums">{{ item.count }}</span>
        </DropdownMenuItem>
        <div
          v-if="loading && !projects.length"
          class="
            flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground
          "
        >
          <LoaderCircle
            aria-hidden="true" class="
              size-4
              motion-safe:animate-spin
            "
          />
          Loading…
        </div>
        <DropdownMenuItem v-else-if="error" @select.prevent="fetchProjects">
          Couldn’t load projects. Try again
        </DropdownMenuItem>
        <p
          v-else-if="!filteredProjects.length"
          class="px-2 py-1.5 text-sm text-muted-foreground"
        >
          {{ projects.length ? 'No matching projects' : `No projects yet. Tag a link “${PROJECT_TAG_PREFIX}name”.` }}
        </p>
      </div>
      <template v-if="isProjectFilter">
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="selectProject(undefined)">
          <X aria-hidden="true" class="size-4" />
          Clear project filter
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
