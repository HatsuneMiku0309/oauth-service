<template>
  <div class="relative flex flex-col w-full py-5 px-10 overflow-x-hidden">
    <button @click="getUsedRate">abc</button>
    <div class="grid grid-cols-2">
      <div>
        <line-chart v-if="datas.length !== 0" :id="'test'" ref="test" :datas="datas" :title="'Used Rate'">
          <template #header>
            <select class="p-1 bg-gray-500 rounded-md focus:outline-none mx-2" v-model="dateType">
              <option>min</option>
              <option>hour</option>
              <option>6hour</option>
              <option>12hour</option>
              <option>day</option>
            </select>
            <select class="p-1 bg-gray-500 rounded-md focus:outline-none mx-2" v-model="count" lazy>
              <option v-for="countData in countDatas" :key="countData.value">
                {{countData.text}}
              </option>
            </select>
          </template>
        </line-chart>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { get } from '@/apis/utils';
import { defineComponent, inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import LineChart from '../components/charts/LineChart.vue';
import dayjs from 'dayjs';
// import BarChart from '../components/charts/BarChart.vue';
// import PieChart from '../components/charts/PieChart.vue';
// import DoughnutChart from '../components/charts/DoughnutChart.vue';

export default defineComponent({
  name: 'DashBoard',
  components: { LineChart },
  setup() {
    const test = ref<InstanceType<typeof LineChart>>();
    const datas = ref([]);
    const dateType = ref('min');
    const MAX_COUNT = 100;
    const count = ref(12);
    const countDatas = [];
    for(let i = 1 ; i <= MAX_COUNT ; i++) {
      countDatas.push({
        text: i,
        value: i
      });
    }

    const mapStore = inject('mapStore');
    const { changeNavigation } = <any> mapStore;
    changeNavigation(useRoute());

    onMounted(async () => {
      try {
        await getUsedRate();
      } catch (err: any) {
        alert(err.response.data.errMsg);
      }
    });

    const getUsedRate = async () => {
      try {
        let result = await get('/dashboard/used-rate', {
          date_type: 'min',
          count: 12
        });
        datas.value = result.data.data.map((data: any) => {
          return {
            x: dayjs(data.DATE_TIME).format('YYYY-MM-DD HH:mm'),
            y: data.USED_COUNT
          };
        });

        !!test.value && test.value.updateChart(datas.value);
      } catch (err: any) {
        alert(err.response.data.errMsg);
      }
    }
    // const datas = [{
    //   x: '2022-05-01 00:00:00',
    //   y: 30
    // }, {
    //   x: '2022-05-02 00:00:00',
    //   y: 10
    // }, {
    //   x: '2022-05-03 00:00:00',
    //   y: 50
    // }, {
    //   x: '2022-05-04 00:00:00',
    //   y: 100
    // }];

    return {
      getUsedRate,
      datas,
      dateType,
      count,
      countDatas,
      test
    }
  },
});
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
	height: 8px;
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
