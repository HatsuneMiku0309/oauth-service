<template>
  <div>Dashboard</div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  setup() {
      const mapStore = inject('mapStore');
      const { changeNavigation } = <any> mapStore;
		  changeNavigation(useRoute());
  },
});
</script>
