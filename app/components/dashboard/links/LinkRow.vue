<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { DashboardLink } from '@/types/dashboard-links'
import { Copy, CopyCheck, Ellipsis, Eraser, Link as LinkIcon, MousePointerClick, QrCode, SquarePen } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'
import { parseURL } from 'ufo'
import { toast } from 'vue-sonner'

// MIK customization: compact one-line row used by the list view of the links dashboard.
const props = defineProps<{
  link: DashboardLink
}>()

const { t, locale } = useI18n()
const menuOpen = shallowRef(false)
const qrDialogOpen = shallowRef(false)
const editDialogOpen = shallowRef(false)
const deleteDialogOpen = shallowRef(false)
const actionsTriggerRef = useTemplateRef<ComponentPublicInstance>('actionsTrigger')

async function openDialog(dialog: 'qr' | 'edit' | 'delete') {
  menuOpen.value = false
  await nextTick()
  if (dialog === 'qr')
    qrDialogOpen.value = true
  else if (dialog === 'edit')
    editDialogOpen.value = true
  else
    deleteDialogOpen.value = true
}

function handleMenuCloseAutoFocus(event: Event) {
  if (qrDialogOpen.value || editDialogOpen.value || deleteDialogOpen.value)
    event.preventDefault()
}

function handleDialogCloseAutoFocus(event: Event) {
  event.preventDefault()
  nextTick(() => {
    const element = actionsTriggerRef.value?.$el
    if (element instanceof HTMLElement && element.isConnected)
      element.focus({ preventScroll: true })
  })
}

const selection = inject(LINK_SELECTION_KEY, null)
const isSelected = computed(() => selection?.selectedSlugs.value.has(props.link.slug) ?? false)

const countersMap = inject(LINKS_COUNTERS_MAP_KEY)
const counters = computed(() => countersMap?.value?.[props.link.id])

const origin = useRequestURL().origin
const shortLink = computed(() => `${origin}/${props.link.slug}`)
const destinationHost = computed(() => parseURL(props.link.url).host ?? props.link.url)
const linkIcon = computed(() => `https://unavatar.webp.se/${destinationHost.value}?fallback=https://mik.archi/icon.png`)
const isExpired = computed(() => Boolean(props.link.expiration && props.link.expiration <= Math.floor(Date.now() / 1000)))
const noteText = computed(() => props.link.comment?.trim() || props.link.title?.trim() || '')

const { copy, copied } = useClipboard({ source: shortLink.value, copiedDuring: 400 })

function copyLink() {
  copy(shortLink.value)
  toast(t('links.copy_success'))
}
</script>

<template>
  <div
    class="
      grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2
      hover:bg-muted/50
      data-[selected=true]:bg-muted/60
      md:grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)_6rem_4rem_auto]
    "
    :data-selected="isSelected"
  >
    <Checkbox
      :model-value="isSelected"
      :aria-label="`Select ${link.slug}`"
      @update:model-value="value => selection?.toggleSelected(link.slug, value === true)"
    />
    <div class="min-w-0">
      <div class="flex min-w-0 items-center gap-2">
        <NuxtLink
          class="
            min-w-0 truncate text-sm font-semibold
            hover:underline hover:underline-offset-4
          "
          :to="getDashboardLinkDetailLocation(link.slug)"
        >
          {{ link.slug }}
        </NuxtLink>
        <Badge v-if="isExpired" variant="destructive" class="shrink-0">
          {{ $t('links.expired') }}
        </Badge>
        <Badge
          v-for="tag in (link.tags ?? []).slice(0, 2)"
          :key="tag"
          variant="outline"
          class="
            hidden max-w-24 shrink-0 truncate
            lg:inline-flex
          "
        >
          {{ tag }}
        </Badge>
      </div>
      <p v-if="noteText" class="truncate text-xs text-muted-foreground">
        {{ noteText }}
      </p>
    </div>

    <a
      :href="link.url"
      target="_blank"
      rel="noopener noreferrer"
      :title="link.url"
      class="
        hidden min-w-0 items-center gap-2 text-sm text-muted-foreground
        hover:text-foreground
        md:flex
      "
    >
      <img
        :src="linkIcon" alt="" loading="lazy" class="size-4 shrink-0 rounded-sm"
      >
      <span class="truncate">{{ destinationHost }}</span>
    </a>

    <span
      class="
        hidden text-sm text-muted-foreground tabular-nums
        md:block
      "
      :title="`${$t('links.created_at')}: ${longDate(link.createdAt, locale)}`"
    >
      {{ shortDate(link.createdAt, locale) }}
    </span>

    <span
      class="
        hidden items-center gap-1 text-sm text-muted-foreground tabular-nums
        md:flex
      "
      :aria-label="counters ? $t('links.stats.visits', { count: counters.visits }) : undefined"
    >
      <MousePointerClick aria-hidden="true" class="size-3.5" />
      <template v-if="counters">{{ counters.visits }}</template>
      <Skeleton v-else class="h-4 w-6" />
    </span>

    <div class="flex shrink-0 items-center">
      <Button
        variant="ghost"
        size="icon"
        :aria-label="copied ? $t('links.copy_success') : shortLink"
        @click="copyLink"
      >
        <CopyCheck v-if="copied" aria-hidden="true" class="size-4" />
        <Copy v-else aria-hidden="true" class="size-4" />
      </Button>
      <Button
        as-child
        variant="ghost"
        size="icon"
        class="md:hidden"
      >
        <a :href="link.url" target="_blank" rel="noopener noreferrer" :aria-label="link.url">
          <LinkIcon aria-hidden="true" />
        </a>
      </Button>
      <DropdownMenu v-model:open="menuOpen">
        <DropdownMenuTrigger as-child>
          <Button
            ref="actionsTrigger"
            variant="ghost"
            size="icon"
            :aria-label="`${$t('links.download_qr_code')} / ${$t('common.edit')} / ${$t('common.delete')}`"
          >
            <Ellipsis aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          :hide-when-detached="false"
          @close-auto-focus="handleMenuCloseAutoFocus"
        >
          <DropdownMenuItem @select.prevent="openDialog('qr')">
            <QrCode aria-hidden="true" />
            {{ $t('links.download_qr_code') }}
          </DropdownMenuItem>
          <DropdownMenuItem @select.prevent="openDialog('edit')">
            <SquarePen aria-hidden="true" />
            {{ $t('common.edit') }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" @select.prevent="openDialog('delete')">
            <Eraser aria-hidden="true" />
            {{ $t('common.delete') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <DashboardLinksQRCodeDialog
      v-model:open="qrDialogOpen"
      :data="shortLink"
      @close-auto-focus="handleDialogCloseAutoFocus"
    />
    <DashboardLinksEditorModal
      v-model:open="editDialogOpen"
      :link="link"
      @close-auto-focus="handleDialogCloseAutoFocus"
    />
    <DashboardLinksDelete
      v-model:open="deleteDialogOpen"
      :link="link"
      @close-auto-focus="handleDialogCloseAutoFocus"
    />
  </div>
</template>
