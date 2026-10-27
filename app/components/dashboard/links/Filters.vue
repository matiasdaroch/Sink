<script setup lang="ts">
import { LayoutGrid, List, LoaderCircle, Search, X } from '@lucide/vue'

interface TagCount {
  name: string
  count: number
}

const linksStore = useDashboardLinksStore()
const allTagsValue = '__sink_all_tags__'
const tags = shallowRef<TagCount[]>([])
const loading = shallowRef(false)
const error = shallowRef(false)
let requestGeneration = 0

async function fetchTags() {
  const generation = ++requestGeneration
  loading.value = true
  error.value = false
  try {
    const data = await useAPI<TagCount[]>('/api/link/tags')
    if (generation === requestGeneration) {
      tags.value = data
      if (linksStore.tag && !data.some(item => item.name === linksStore.tag))
        linksStore.tag = undefined
    }
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

function selectTag(value: unknown) {
  linksStore.tag = typeof value === 'string' && value !== allTagsValue ? value : undefined
}

onMounted(fetchTags)
linksStore.onLinkUpdate(() => void fetchTags())
</script>

<template>
  <section
    class="
      flex flex-col gap-3
      md:flex-row md:flex-wrap md:items-center md:justify-between
    "
    :aria-label="$t('links.filters.aria_label')"
  >
    <div class="flex min-w-0 items-center gap-2">
      <TabsList :aria-label="$t('links.filters.status_label')">
        <TabsTrigger value="active">
          {{ $t('links.filters.active') }}
        </TabsTrigger>
        <TabsTrigger value="expired">
          {{ $t('links.filters.expired') }}
        </TabsTrigger>
      </TabsList>
    </div>

    <div
      class="
        flex min-w-0 flex-wrap items-center gap-2
        md:ml-auto
      "
    >
      <DashboardLinksSort />
      <div class="flex shrink-0 rounded-lg border p-0.5" role="group" aria-label="Layout">
        <Button
          type="button"
          size="icon"
          :variant="linksStore.view === 'list' ? 'secondary' : 'ghost'"
          class="size-8"
          aria-label="List view"
          :aria-pressed="linksStore.view === 'list'"
          @click="linksStore.view = 'list'"
        >
          <List aria-hidden="true" class="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          :variant="linksStore.view === 'cards' ? 'secondary' : 'ghost'"
          class="size-8"
          aria-label="Card view"
          :aria-pressed="linksStore.view === 'cards'"
          @click="linksStore.view = 'cards'"
        >
          <LayoutGrid aria-hidden="true" class="size-4" />
        </Button>
      </div>
      <Button
        v-if="error"
        type="button"
        variant="ghost"
        size="sm"
        class="
          w-full
          md:w-auto
        "
        @click="fetchTags"
      >
        {{ $t('common.try_again') }}
      </Button>
    </div>
    <p
      v-if="error"
      class="
        text-xs text-destructive
        sm:sr-only
      "
      role="alert"
    >
      {{ $t('links.filters.tags_failed') }}
    </p>
    <!-- MIK customization: inline filter; bulk actions apply to the filtered rows -->
    <div class="relative w-full">
      <Search
        class="
          pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2
          text-muted-foreground
        "
        aria-hidden="true"
      />
      <Input
        v-model="linksStore.query"
        type="search"
        placeholder="Filter by slug, description, destination or tag…"
        aria-label="Filter links"
        class="px-9"
      />
      <Button
        v-if="linksStore.query"
        type="button"
        variant="ghost"
        size="icon"
        class="absolute top-1/2 right-1 size-7 -translate-y-1/2"
        aria-label="Clear filter"
        @click="linksStore.query = ''"
      >
        <X aria-hidden="true" class="size-4" />
      </Button>
    </div>
    <!-- MIK customization: tag chips work like folders -->
    <div
      v-if="tags.length || loading"
      class="flex w-full min-w-0 items-center gap-2 overflow-x-auto pb-1"
      role="group"
      :aria-label="$t('links.filters.tag_label')"
    >
      <Button
        type="button"
        size="sm"
        :variant="linksStore.tag ? 'outline' : 'default'"
        class="shrink-0 rounded-full"
        :aria-pressed="!linksStore.tag"
        @click="selectTag(allTagsValue)"
      >
        {{ $t('links.filters.all_tags') }}
      </Button>
      <Button
        v-for="item in tags"
        :key="item.name"
        type="button"
        size="sm"
        :variant="linksStore.tag === item.name ? 'default' : 'outline'"
        class="shrink-0 rounded-full"
        :aria-pressed="linksStore.tag === item.name"
        @click="selectTag(item.name)"
      >
        {{ item.name }}
        <span class="text-xs tabular-nums opacity-70">{{ item.count }}</span>
      </Button>
      <LoaderCircle
        v-if="loading"
        class="
          size-4 shrink-0
          motion-safe:animate-spin
        "
        aria-hidden="true"
      />
    </div>
  </section>
</template>
