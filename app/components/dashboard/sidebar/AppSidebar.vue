<script setup lang="ts">
interface NavItem {
  title: string
  url: string
  icon: Component
  isActive: boolean
}

const { title } = useAppConfig()
const { isActive } = useDashboardRoute()

const platformItems = computed<NavItem[]>(() => [
  {
    title: 'nav.links',
    url: '/dashboard/links',
    icon: DASHBOARD_ROUTES.links.icon,
    isActive: isActive('links'),
  },
  {
    title: 'nav.analysis',
    url: '/dashboard/analysis',
    icon: DASHBOARD_ROUTES.analysis.icon,
    isActive: isActive('analysis'),
  },
  {
    title: 'nav.realtime',
    url: '/dashboard/realtime',
    icon: DASHBOARD_ROUTES.realtime.icon,
    isActive: isActive('realtime'),
  },
  {
    title: 'nav.check',
    url: '/dashboard/check',
    icon: DASHBOARD_ROUTES.check.icon,
    isActive: isActive('check'),
  },
])

const settingsItems = computed<NavItem[]>(() => [
  {
    title: 'nav.migrate',
    url: '/dashboard/migrate',
    icon: DASHBOARD_ROUTES.migrate.icon,
    isActive: isActive('migrate'),
  },
])
</script>

<template>
  <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink
              to="/" :title="title"
            >
              <!-- MIK customization: the favicon stands in for the lockup only
                   when the sidebar is collapsed to icons, so MIK never shows twice. -->
              <div
                class="
                  hidden aspect-square size-8 items-center justify-center
                  group-data-[collapsible=icon]:flex
                "
              >
                <img
                  src="/icon-192.png"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8"
                >
              </div>
              <div class="grid flex-1 text-left leading-tight">
                <MikLockup class="truncate" />
                <span class="truncate text-xs text-muted-foreground">{{ $t('nav.links') }}</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <DashboardSidebarNavMain :platform-items="platformItems" :settings-items="settingsItems" />
      <DashboardSidebarNavSecondary class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <DashboardSidebarNavUser />
    </SidebarFooter>
  </Sidebar>
</template>
