<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'

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
