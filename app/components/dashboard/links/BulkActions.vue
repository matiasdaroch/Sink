<script setup lang="ts">
import type { DashboardLink } from '@/types/dashboard-links'
import { CalendarClock, Eraser, LoaderCircle, Tag, TagsIcon, X } from '@lucide/vue'
import { toast } from 'vue-sonner'

// Actions applied to every selected link in the list view.
const props = defineProps<{
  links: DashboardLink[]
}>()

const emit = defineEmits<{
  clear: []
}>()

const MAX_TAG_LENGTH = 32
const MAX_TAGS = 10
const CONCURRENCY = 4

const { t } = useI18n()
const linksStore = useDashboardLinksStore()
const linksSearchStore = useDashboardLinksSearchStore()

const busy = shallowRef(false)
const progress = shallowRef(0)
const addTagOpen = shallowRef(false)
const expirationOpen = shallowRef(false)
const deleteOpen = shallowRef(false)
const newTag = shallowRef('')
const expirationDate = shallowRef('')

const selectedTags = computed(() => [...new Set(props.links.flatMap(link => link.tags ?? []))].sort())
const minDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
})

// Build the same payload shape the single-link editor sends: drop server-managed
// fields and the masked password (omitting it keeps the stored one), drop nulls.
function editPayload(link: DashboardLink, patch: Record<string, unknown>) {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, password: _password, ...rest } = link as DashboardLink & { password?: string }
  const payload: Record<string, unknown> = { ...rest, ...patch }
  for (const key of Object.keys(payload)) {
    if (payload[key] === null || payload[key] === undefined)
      delete payload[key]
  }
  return payload
}

async function runBulk(action: (link: DashboardLink) => Promise<void>) {
  if (busy.value || !props.links.length)
    return
  busy.value = true
  progress.value = 0
  const targets = [...props.links]
  const queue = [...targets]
  let failed = 0
  async function worker() {
    while (queue.length) {
      const link = queue.shift()!
      try {
        await action(link)
      }
      catch (error) {
        console.error(error)
        failed++
      }
      progress.value++
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker))
  busy.value = false
  const done = targets.length - failed
  if (failed)
    toast.error(t('links.bulk.partial', { done, failed }))
  else
    toast(t('links.bulk.done', { count: done }))
  emit('clear')
}

async function editLink(link: DashboardLink, patch: Record<string, unknown>) {
  const { link: updated } = await useAPI<{ link: DashboardLink }>('/api/link/edit', {
    method: 'PUT',
    body: editPayload(link, patch),
  })
  linksSearchStore.syncLink(updated, 'edit')
  linksStore.notifyLinkUpdate(updated, 'edit')
}

function addTag() {
  const tag = newTag.value.trim().toLowerCase()
  if (!tag || tag.length > MAX_TAG_LENGTH)
    return
  addTagOpen.value = false
  newTag.value = ''
  void runBulk(async (link) => {
    const tags = link.tags ?? []
    if (tags.includes(tag))
      return
    if (tags.length >= MAX_TAGS)
      throw new Error(`${link.slug} already has ${MAX_TAGS} tags`)
    await editLink(link, { tags: [...tags, tag] })
  })
}

function removeTag(tag: string) {
  void runBulk(async (link) => {
    const tags = link.tags ?? []
    if (!tags.includes(tag))
      return
    await editLink(link, { tags: tags.filter(item => item !== tag) })
  })
}

function setExpiration() {
  if (!expirationDate.value)
    return
  const expiration = Math.floor(new Date(`${expirationDate.value}T23:59:59`).getTime() / 1000)
  expirationOpen.value = false
  void runBulk(link => editLink(link, { expiration }))
}

function clearExpiration() {
  expirationOpen.value = false
  void runBulk(async (link) => {
    if (!link.expiration)
      return
    await editLink(link, { expiration: undefined })
  })
}

function deleteLinks() {
  void runBulk(async (link) => {
    await useAPI('/api/link/delete', { method: 'POST', body: { slug: link.slug } })
    linksSearchStore.syncLink(link, 'delete')
    linksStore.notifyLinkUpdate(link, 'delete')
  })
}
</script>

<template>
  <div
    class="
      sticky top-2 z-30 flex flex-wrap items-center gap-2 rounded-xl border
      bg-card p-2 shadow-sm
    "
    role="toolbar"
    :aria-label="$t('links.bulk.label')"
  >
    <span class="px-1 text-sm font-medium tabular-nums" aria-live="polite">
      <template v-if="busy">
        <LoaderCircle
          class="
            mr-1 inline size-4
            motion-safe:animate-spin
          "
          aria-hidden="true"
        />
        {{ $t('links.bulk.progress', { done: progress, total: links.length }) }}
      </template>
      <template v-else>{{ $t('links.bulk.selected', { count: links.length }) }}</template>
    </span>

    <Popover v-model:open="addTagOpen">
      <PopoverTrigger as-child>
        <Button variant="outline" size="sm" :disabled="busy">
          <Tag aria-hidden="true" /> {{ $t('links.bulk.add_tag') }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-64">
        <form class="flex gap-2" @submit.prevent="addTag">
          <Input
            v-model="newTag"
            :aria-label="$t('links.bulk.add_tag')"
            :maxlength="MAX_TAG_LENGTH"
            autofocus
          />
          <Button type="submit" size="sm" :disabled="!newTag.trim()">
            {{ $t('links.bulk.add') }}
          </Button>
        </form>
      </PopoverContent>
    </Popover>

    <DropdownMenu v-if="selectedTags.length">
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="sm" :disabled="busy">
          <TagsIcon aria-hidden="true" /> {{ $t('links.bulk.remove_tag') }}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem v-for="tag in selectedTags" :key="tag" @select="removeTag(tag)">
          {{ tag }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Popover v-model:open="expirationOpen">
      <PopoverTrigger as-child>
        <Button variant="outline" size="sm" :disabled="busy">
          <CalendarClock aria-hidden="true" /> {{ $t('links.bulk.expiration') }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-72">
        <form class="flex flex-col gap-3" @submit.prevent="setExpiration">
          <p class="text-sm text-muted-foreground">
            {{ $t('links.bulk.expiration_description') }}
          </p>
          <div class="flex gap-2">
            <Input
              v-model="expirationDate"
              type="date"
              :min="minDate"
              :aria-label="$t('links.bulk.expiration')"
            />
            <Button type="submit" size="sm" :disabled="!expirationDate">
              {{ $t('links.bulk.set') }}
            </Button>
          </div>
          <Button type="button" variant="ghost" size="sm" @click="clearExpiration">
            {{ $t('links.bulk.remove_expiration') }}
          </Button>
        </form>
      </PopoverContent>
    </Popover>

    <Button variant="outline" size="sm" class="text-destructive" :disabled="busy" @click="deleteOpen = true">
      <Eraser aria-hidden="true" /> {{ $t('common.delete') }}
    </Button>

    <Button variant="ghost" size="sm" class="ml-auto" :disabled="busy" @click="emit('clear')">
      <X aria-hidden="true" /> {{ $t('links.bulk.clear') }}
    </Button>

    <DashboardLinksBulkDeleteDialog
      v-model:open="deleteOpen"
      :count="links.length"
      @confirm="deleteLinks"
    />
  </div>
</template>
