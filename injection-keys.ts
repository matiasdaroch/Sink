import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { CounterData } from '@/types'

export const LINK_ID_KEY: InjectionKey<ComputedRef<string | undefined>> = Symbol('linkId')
export const REALTIME_PAUSED_KEY: InjectionKey<Ref<boolean>> = Symbol('realtimePaused')
export const LINKS_COUNTERS_MAP_KEY: InjectionKey<Ref<Record<string, CounterData>>> = Symbol('linksCountersMap')
export const LINKS_COUNTER_ERROR_IDS_KEY: InjectionKey<Ref<Set<string>>> = Symbol('linksCounterErrorIds')
export const RETRY_LINK_COUNTERS_KEY: InjectionKey<(id: string) => void> = Symbol('retryLinkCounters')

// MIK customization: shared selection state for bulk actions in the links list view
export interface LinkSelection {
  selectedSlugs: Ref<Set<string>>
  toggleSelected: (slug: string, value: boolean) => void
}
export const LINK_SELECTION_KEY: InjectionKey<LinkSelection> = Symbol('linkSelection')
