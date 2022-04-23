<template>
  <div class="flex flex-col w-48 h-full flex-grow-0 flex-shrink-0 bg-gray-600 overflow-y-hidden p-2">
    <div class="flex flex-col flex-grow overflow-y-auto">
      <router-link class="flex p-3 hover:underline" to="/dashboard">
        <i class="flex oauth-icon dashboard before:w-6 before:h-6"><span class="ml-2">Dashboard</span></i>
      </router-link>
      <router-link class="flex p-3 hover:underline" to="/application">
        <i class="flex oauth-icon applications before:w-6 before:h-6"><span class="ml-2">Application</span></i>
      </router-link>
    </div>
    <div class="relative flex flex-col mt-4 border-t border-gray-500" name="version">
      <div class="text-right text-sm">Version: 1.0.0</div>
      <div class="text-right text-sm">Copyright © {{ fullYear }} Cosmo</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'LeftSide',
  setup() {
    const nowDate = new Date();
    const fullYear = ref(nowDate.getFullYear());

    return {
      fullYear
    };
  },
});
</script>

<style scoped>
.router-link-active {
  @apply underline;
  @apply font-bold;
}

.oauth-icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.oauth-icon.dashboard::before {
  background-image: url("@/assets/images/svg/fi-rr-dashboard.svg");
}

.oauth-icon.applications::before {
  background-image: url("@/assets/images/svg/fi-rr-grid.svg");
}

::-webkit-scrollbar {
  width: 8px;
  border-radius: 8px;
}

/* Track */
::-webkit-scrollbar-track {
	@apply opacity-20;
	@apply bg-gray-600;
}

/* Handle */
::-webkit-scrollbar-thumb {
	@apply opacity-40;
	@apply bg-gray-700;
	@apply rounded-full;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
	@apply opacity-70;
	@apply bg-gray-500;
}
</style>
