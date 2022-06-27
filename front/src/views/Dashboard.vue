<template>
  <div id="content" class="relative flex flex-col w-full py-5 px-10 overflow-hidden">
    <!-- <button @click="getUsedRate">abc</button> -->
    <div class="grid grid-cols-2 min-w-max">
      <div>
        <line-chart :id="'usedRate'" ref="usedRate" :datasets="[]" :title="'Used Rate'">
          <template #header>
            <select @change="getUsedRate" class="p-1 bg-gray-500 rounded-md w-24 focus:outline-none mx-2 focus:shadow-md" v-model="dateType">
              <option>min</option>
              <option>hour</option>
              <option>6hour</option>
              <option>12hour</option>
              <option>day</option>
            </select>
            <input class="
              bg-gray-500 rounded-md mx-2 p-1 w-24
              focus:outline-none focus:border-gray-700 focus:shadow-md"
            @change="getUsedRate" type="numer" list="dateCount" v-model="dateCount" />
            <datalist id="dateCount">
              <option v-for="countData in countDatas" :key="countData.value">
                {{countData.text}}
              </option>
            </datalist>
          </template>
        </line-chart>
      </div>
      <div>
        <pie-chart :id="'appUsedRate'" ref="appUsedRate" :datasets="[]" :title="'Application Used Rate'">
          <template #header>
            <select @change="getApplicationUsedRate" class="p-1 bg-gray-500 rounded-md w-24 focus:outline-none mx-2 focus:shadow-md" v-model="pieDataType">
              <option>min</option>
              <option>hour</option>
              <option>6hour</option>
              <option>12hour</option>
              <option>day</option>
            </select>
          </template>
        </pie-chart>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { get } from '@/apis/utils';
import { defineComponent, inject, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import LineChart from '../components/charts/LineChart.vue';
import dayjs from 'dayjs';
// import BarChart from '../components/charts/BarChart.vue';
import PieChart from '../components/charts/PieChart.vue';
// import DoughnutChart from '../components/charts/DoughnutChart.vue';

export default defineComponent({
  name: 'DashBoard',
  components: { LineChart, PieChart },
  setup() {
    const usedRate = ref<InstanceType<typeof LineChart>>();
    const appUsedRate = ref<InstanceType<typeof PieChart>>();
    let datasets: any[] = [];
    let pieDataSets: any[] = [];
    const dateType = ref('day');
    const pieDataType = ref('day');
    const MAX_COUNT = 100;
    const dateCount = ref(10);
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
        await getApplicationUsedRate();
        await nextTick();
        const USED_RATE_CHART = document.getElementById('usedRate');
        const APP_USED_RATE_CHART = document.getElementById('appUsedRate');
        const CONTENT = document.getElementById('content');
        window.addEventListener('resize', () => {
          if (!!APP_USED_RATE_CHART && !!USED_RATE_CHART && CONTENT) {
            let contentWidth = CONTENT.offsetWidth - 80;
            let half = contentWidth / 2;
            USED_RATE_CHART.style.height = half + 'px';
            USED_RATE_CHART.style.width = half + 'px';
            APP_USED_RATE_CHART.style.height = half / 2 + 'px';
            APP_USED_RATE_CHART.style.width = half / 2 + 'px';
            
            usedRate.value?.resize(USED_RATE_CHART.offsetWidth, USED_RATE_CHART.offsetHeight);
            appUsedRate.value?.resize(APP_USED_RATE_CHART.offsetWidth, APP_USED_RATE_CHART.offsetHeight);
          }
        }, {
          passive: true
        });
      } catch (err: any) {
        alert(err.response.data.errMsg);
      }
    });

    const getUsedRate = async () => {
      try {
        if (!!Number(dateCount.value)) {
          datasets = [];
          dateType.value === 'day' && (dateCount.value = 10);
          let result = await get('/dashboard/used-rate', {
            date_type: dateType.value,
            count: dateCount.value
          });
          let datas = result.data.data.map((data: any) => {
            return {
              x: dayjs(data.DATE_TIME).format('YYYY-MM-DD HH:mm'),
              y: data.USED_COUNT
            }
          });
          datasets.push({
            label: 'Used Rate',
            backgroundColor: 'lightgreen',
            borderColor: 'lightgreen',
            data: datas,
            tension: 0.4,
            pointStyle: 'circle',
            ointRadius: 5,
            pointHoverRadius: 10
          });

          !!usedRate.value && usedRate.value.updateChart(datasets);
        }
      } catch (err: any) {
        datasets = [{
          label: 'Used Rate',
          backgroundColor: 'lightgreen',
          borderColor: 'lightgreen',
          data: [],
          tension: 0.4,
          pointStyle: 'circle',
          ointRadius: 5,
          pointHoverRadius: 10
        }]
        alert(err.response.data.errMsg);
      }
    };

    const getApplicationUsedRate = async () => {
      try {
        pieDataSets = [];
        let result = await get('/dashboard/application-used-rate', {
          date_type: pieDataType.value
        });
        let maxVal = 0xFFFFFF; // 16777215
        let dataColors: string[] = [];
        let datas: number[] = result.data.data[0].APPLICATION.map((data: any) => {
          let randomNumber = Math.random() * maxVal;
          randomNumber = Math.floor(randomNumber);
          dataColors.push(`#${randomNumber.toString(16).padStart(6, '0')}`);
          return data.USED_COUNT;
        });
        let labels: string[] = result.data.data[0].APPLICATION.map((data: any) => {
          return data.NAME;
        });
        labels.length === 0 && (labels = ['N/A']);
        datas.length === 0 && (datas = [1]);
        dataColors.length === 0 && (dataColors = ['black']);
        pieDataSets.push({
          data: datas,
          backgroundColor: dataColors,
        });

        !!appUsedRate.value && appUsedRate.value.updateChart(labels, pieDataSets);
      } catch (err: any) {
        alert(err.response.data.errMsg);
      }
    };

    return {
      getUsedRate,
      getApplicationUsedRate,
      dateType,
      pieDataType,
      dateCount,
      countDatas,
      usedRate,
      appUsedRate
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
