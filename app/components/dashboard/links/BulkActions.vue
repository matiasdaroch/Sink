<script setup lang="ts">
import type { DashboardLink } from '@/types/dashboard-links'
import { CalendarClock, Eraser, LoaderCircle, Tag, TagsIcon, X } from '@lucide/vue'
import { toast } from 'vue-sonner'

// MIK customization: actions applied to every selected link in the list view.
const props = defineProps<{
  links: DashboardLink[]
}>()

const emit = defineEmits<{
  clear: []
}>()

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
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})

// Build the same payload shape the single-link editor sends: drop server-managed
// fields and the masked password (omitting it keeps the stored one), drop nulls.
function editPayload(link: DashboardLink, patch: Record<string, unknown>) {
  const { id: _id, createdAt: _c, updatedAt: _u, password: _p, ...rest } = link as DashboardLink & { password?: string }
  const payload: Record<string, unknown> = { ...rest, ...patch }
  for (const key of Object.keys(payload)) {
    if (payload[key] === null || payload[key] === undefined)
      delete payload[key]
  }
  return payload
}

async function runBulk(label: string, action: (link: DashboardLink) => Promise<void>) {
  if (busy.value || !props.links.length)
    return
  busy.value = true
  progress.value = 0
  const targets = [...props.links]
  let failed = 0
  const queue = [...targets]
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
  await Promise.all(Array.from({ length: Math.min(4, targets.length) }, worker))
  busy.value = false
  const done = targets.length - failed
  if (failed)
    toast.error(`${label}: ${done} done, ${failed} failed`)
  else
    toast(`${label}: ${done} link${done === 1 ? '' : 's'} updated`)
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
  if (!tag || tag.length > 32)
    return
  addTagOpen.value = false
  newTag.value = ''
  void runBulk(`Added tag "${tag}"`, async (link) => {
    const tags = link.tags ?? []
    if (tags.includes(tag))
      return
    if (tags.length >= 10)
      throw new Error(`${link.slug} already has 10 tags`)
    await editLink(link, { tags: [...tags, tag] })
  })
}

function removeTag(tag: string) {
  void runBulk(`Removed tag "${tag}"`, async (link) => {
    const tags = link.tags ?? []
    if (!tags.includes(tag))
      return
    await editLink(link, { tags: tags.filter(t => t !== tag) })
  })
}

function setExpiration() {
  if (!expirationDate.value)
    return
  const expiration = Math.floor(new Date(`${expirationDate.value}T23:59:59`).getTime() / 1000)
  expirationOpen.value = false
  void runBulk('Set expiration', link => editLink(link, { expiration }))
}

function clearExpiration() {
  void runBulk('Removed expiration', async (link) => {
    if (!link.expiration)
      return
    await editLink(link, { expiration: undefined })
  })
}

function deleteLinks() {
  deleteOpen.value = false
  void runBulk('Deleted', async (link) => {
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
  >
    <span class="px-1 text-sm font-medium tabular-nums">
      <template v-if="busy">
        <LoaderCircle class="mr-1 inline size-4 motion-safe:animate-spin" aria-hidden="true" />
        {{ progress }} / {{ links.length }}
      </template>
      <template v-else>{{ links.length }} selected</template>
    </span>

    <Popover v-model:open="addTagOpen">
      <PopoverTrigger as-child>
        <Button variant="outline" size="sm" :disabled="busy">
          <Tag aria-hidden="true" /> Add tag
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-64">
        <form class="flex gap-2" @submit.prevent="addTag">
          <Input v-model="newTag" placeholder="e.g. 086 or yard-signs" maxlength="32" autofocus />
          <Button type="submit" size="sm" :disabled="!newTag.trim()">
            Add
          </Button>
        </form>
      </PopoverContent>
    </Popover>

    <DropdownMenu v-if="selectedTags.length">
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="sm" :disabled="busy">
          <TagsIcon aria-hidden="true" /> Remove tag
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
          <CalendarClock aria-hidden="true" /> Expiration
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-72">
        <form class="flex flex-col gap-3" @submit.prevent="setExpiration">
          <p class="text-sm text-muted-foreground">
            Links stop working at the end of this day and go to the fallback page.
          </p>
          <div class="flex gap-2">
            <Input v-model="expirationDate" type="date" :min="minDate" />
            <Button type="submit" size="sm" :disabled="!expirationDate">
              Set
            </Button>
          </div>
          <Button type="button" variant="ghost" size="sm" @click="expirationOpen = false; clearExpiration()">
            Remove expiration
          </Button>
        </form>
      </PopoverContent>
    </Popover>

    <Button variant="outline" size="sm" class="text-destructive" :disabled="busy" @click="deleteOpen = true">
      <Eraser aria-hidden="true" /> Delete
    </Button>

    <Button variant="ghost" size="sm" class="ml-auto" :disabled="busy" @click="emit('clear')">
      <X aria-hidden="true" /> Clear
    </Button>

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {{ links.length }} link{{ links.length === 1 ? '' : 's' }}?</AlertDialogTitle>
          <AlertDialogDescription>
            Anyone who opens or scans these links will land on the fallback page instead. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" @click="deleteLinks">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
