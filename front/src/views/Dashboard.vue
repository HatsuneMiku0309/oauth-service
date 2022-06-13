<template>
  <div class="relative flex flex-col w-full mt-5 mb-5 mx-10 overflow-hidden">
    <bar-chart />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import LineChart from '../components/charts/LineChart.vue';
import BarChart from '../components/charts/BarChart.vue';

export default defineComponent({
  name: 'DashBoard',
  components: { BarChart },
  setup() {
      const mapStore = inject('mapStore');
      const { changeNavigation } = <any> mapStore;
		  changeNavigation(useRoute());
  },
});
</script>
