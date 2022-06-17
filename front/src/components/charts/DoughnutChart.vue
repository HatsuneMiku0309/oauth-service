<template>
  <div class="h-full">
    <canvas :id="id" width="800" height="800"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { Chart, PieController, ArcElement, PointElement, LinearScale, Title, CategoryScale, ChartConfiguration, Legend, Filler, Tooltip, ChartData } from 'chart.js';

export default defineComponent({
  name: 'PieChart',
  props: ['id'],
  setup(props) {
    const { id } = props
    const DATA_COUNT = 5;
    const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

    const data = {
      labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [10, 20, 30, 40, 50],
          backgroundColor: ['rgb(255, 99, 132, 0.5)', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey'],
        }
      ]
    };
    
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: <any> data,
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
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
    };
  },
})
</script>

<style scoped>

</style>
