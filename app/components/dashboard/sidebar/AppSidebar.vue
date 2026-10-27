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
              <div
                class="
                  flex aspect-square size-8 items-center justify-center
                  rounded-full
                "
              >
                <img
                  src="/icon-192.png"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8 rounded-md border"
                >
              </div>
              <!-- MIK customization: text logo, MIK in Mulish Bold, ARCHITECTURE in Catamaran -->
              <div
                class="
                  grid flex-1 text-left leading-tight text-black
                  dark:text-white
                "
              >
                <span class="truncate whitespace-nowrap">
                  <span
                    class="font-['Mulish'] text-[13px] font-bold tracking-wide"
                  >MIK</span>
                  <span
                    class="
                      font-['Catamaran'] text-[13.5px] font-normal tracking-wide
                    "
                  >ARCHITECTURE</span>
                </span>
                <span class="truncate text-xs text-muted-foreground">{{ title }}</span>
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
