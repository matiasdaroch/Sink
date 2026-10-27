// MIK customization: project subtags are regular tags under the `project/` parent,
// e.g. `project/2405-smith`. A tag filter ending in `/` matches every subtag of that parent.
export const PROJECT_TAG_PREFIX = 'project/'

export function isParentTagFilter(tag: string): boolean {
  return tag.endsWith('/')
}

export function isProjectTag(tag: string): boolean {
  return tag.startsWith(PROJECT_TAG_PREFIX) && tag.length > PROJECT_TAG_PREFIX.length
}

export function projectNameFromTag(tag: string): string {
  return tag.slice(PROJECT_TAG_PREFIX.length)
}

export function matchesTagFilter(tags: string[] | undefined, filter: string | undefined): boolean {
  if (!filter)
    return true
  return isParentTagFilter(filter)
    ? !!tags?.some(tag => tag.startsWith(filter))
    : !!tags?.includes(filter)
}
