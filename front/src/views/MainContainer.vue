<template>
  <div class="relative flex flex-grow bg-gray-600 overflow-hidden">
    <router-view v-slot="{ Component, route }">
      <keep-alive v-if="route.meta.keepAlive">
        <component :is="Component" :key="route.meta.usePathKey ? route.path : undefined" />
      </keep-alive>
      <component v-if="!route.meta.keepAlive" :is="Component" :key="route.meta.usePathKey ? route.path : undefined" />
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainContainer',
  setup() {
    
  },
});
</script>

<style scoped>

</style>
