<template>
  <div class="default-layout">
    <AppScrollProgress />
    <AppNavbar />
    <AppMobileMenu />

    <main id="main-content" class="default-layout__main">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="(route.meta.transition as string) || 'page'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppNavbar        from '@/components/layout/AppNavbar.vue'
import AppFooter        from '@/components/layout/AppFooter.vue'
import AppMobileMenu    from '@/components/layout/AppMobileMenu.vue'
import AppScrollProgress from '@/components/layout/AppScrollProgress.vue'
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.default-layout__main {
  flex: 1;
  padding-top: 64px; /* navbar height */
}
</style>
