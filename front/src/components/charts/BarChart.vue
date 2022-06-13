<template>
  <div>
    <canvas id="myChart"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { Chart, LineController, LineElement, BarController, BarElement, PointElement, LinearScale, Title, CategoryScale, ChartConfiguration, Legend, Filler, Tooltip, ChartData } from 'chart.js';

export default defineComponent({
  name: 'BarChart',
  setup() {
    const DATA_COUNT = 7;
    
    const labels = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
    ];

    const data: ChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Dataset 1',
          data: <any> labels.map(() => {
            return Math.random() * -1;
          }),
          backgroundColor: 'red',
          borderWidth: 2,
          borderColor: 'green',
          borderRadius: Number.MAX_VALUE,
          borderSkipped: false
        },
        {
          label: 'Dataset 2',
          data: <any> labels.map(() => {
            return Math.random();
          }),
          backgroundColor: 'rgb(0, 0, 255, 0.5)',
        },
        {
          label: 'Dataset 3',
          data: <any> labels.map(() => {
            return Math.random();
          }),
          type: 'line',
          borderColor: 'rgb(0, 255, 0, 0.5)',
          backgroundColor: 'rgb(0, 255, 0, 0.5)',
        },
      ]
    };


    const config: ChartConfiguration = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        // indexAxis: 'y', // Horizontal
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Floating Bar Chart'
          }
        },
        scales: {
          y: {
            // stacked: true,
            ticks: {
              // color: 'yellow'
            }
          },
          x: {
            stacked: true
          }
        }
      }
    };

    onMounted(() => {
        let canvas = <HTMLCanvasElement> document.getElementById('myChart');
        if (canvas) {
          Chart.register(BarController, BarElement, PointElement, LinearScale, Title, CategoryScale, Legend, Filler, Tooltip, LineController, LineElement);
          const myChart = new Chart(
            canvas,
            config
          );
        }
      });
  },
})
</script>

<style scoped>

</style>
