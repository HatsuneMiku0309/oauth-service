<template>
  <div>
    <canvas class="w-1/2" :id="id"></canvas>
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
      labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [100],
          backgroundColor: ['red'],
        }
      ]
    };
    
    const config: ChartConfiguration = {
      type: 'pie',
      data: <any> data,
      options: {
        responsive: true,
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
            text: 'Chart.js Pie Chart',
            color: 'yellow'
          },
          tooltip: {
            bodyColor: 'orange'
          }
        }
      },
    };

    onMounted(() => {
      let canvas = <HTMLCanvasElement> document.getElementById(id);
      if (canvas) {
        Chart.register(PieController, ArcElement, PointElement, LinearScale, Title, CategoryScale, Legend, Filler, Tooltip);
        const myChart = new Chart(
          canvas,
          config
        );
      }
    });

    return {
      id
    }
  },
})
</script>

<style scoped>

</style>
