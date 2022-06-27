<template>
  <div class="flex flex-col">
    <div class="flex justify-end">
      <slot name="header"></slot>
    </div>
    <div class="flex justify-center">
      <canvas class="w-1/2" :id="id"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { Chart, PieController, ArcElement, PointElement, LinearScale, Title, CategoryScale, ChartConfiguration, Legend, Filler, Tooltip, ChartData } from 'chart.js';

export default defineComponent({
  name: 'PieChart',
  props: ['id', 'datasets', 'title'],
  setup(props) {
    const { id, datasets, title } = props;
    const DATA_COUNT = 5;
    const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

    const data = {
      labels: ['Red', 'Orange'],
      datasets: datasets
    };
    
    const config: ChartConfiguration = {
      type: 'pie',
      data: <any> data,
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              color: 'rgb(255, 99, 132)'
            }
          },
          title: {
            display: true,
            text: title,
            color: 'white'
          },
          tooltip: {
            bodyColor: 'orange'
          }
        }
      },
    };

    let myChart: Chart;
    const resize = (width: number, height: number) => {
      if (myChart) {
        myChart.resize(width, height);
      }
    };

    const updateChart = (labels: any[], datasets: any[]) => {
      if (myChart) {
        myChart.data.labels = labels;
        myChart.data.datasets = datasets;
        myChart.update();
      }
    };

    onMounted(() => {
      let canvas = <HTMLCanvasElement> document.getElementById(id);
      if (canvas) {
        Chart.register(PieController, ArcElement, PointElement, LinearScale, Title, CategoryScale, Legend, Filler, Tooltip);
        myChart = new Chart(
          canvas,
          config
        );
      }
    });

    return {
      id,
      updateChart,
      resize
    }
  },
})
</script>

<style scoped>

</style>
