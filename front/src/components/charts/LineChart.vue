<template>
  <div>
    <div class="float-right">
      <slot name="header"></slot>
    </div>
    <div>
      <canvas :id="id"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
// import Chart from 'chart.js/auto';
import { Chart, LineController, LineElement, TimeScale, PointElement, LinearScale, Title, CategoryScale, ChartConfiguration, Legend, Filler, Tooltip, ChartData } from 'chart.js';

export default defineComponent({
  name: 'LineChart',
  props: ['id', 'datas', 'title'],
  setup(props) {
    const { id, datas, title } = props;
    const data = <ChartData> {
      // labels: labels,
      datasets: [{
        label: 'Used Rate',
        backgroundColor: 'rgb(255, 00, 132)',
        borderColor: 'rgb(255, 00, 132)',
        // data: [0, 10, 5, 50, 20, 30],
        data: datas,
        tension: 0.4,
        pointStyle: 'circle',
        pointRadius: 5,
        pointHoverRadius: 10
      }]
    };

    const config: ChartConfiguration = {
      type: 'line',
      data: data,
      options: {
        interaction: {
          intersect: false,
          mode: 'index',
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            display: true,
            labels: {
                color: 'rgb(255, 99, 132)'
            }
          },
          title: {
            display: true,
            text: title,
            color: 'red'
          }
        },
        scales: {
          x: {
            grid: {
              color: 'gray'
            },
            ticks: {
              color: '#FFF',
              // callback: function (val, index) {
              //   return (this.getLabelForValue(<number> val)).substring(10, 16)
              // }
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            },
            grid: {
              color: 'gray'
            },
            ticks: {
              color: '#FFF'
            },
            suggestedMin: 0,
            min: 0
            // suggestedMax: 80
          }
        }
      }
    };

    let myChart: Chart;
    const updateChart = (datas: any[]) => {
      if (myChart) {
        myChart.data.datasets.forEach((dataset) => {
          dataset.data = datas
        });
        myChart.reset();
        myChart.update();
      }
    };

    onMounted(() => {
      let canvas = <HTMLCanvasElement> document.getElementById(id);
      if (canvas) {
        Chart.register(LineController, LineElement, TimeScale, PointElement, LinearScale, Title, CategoryScale, Legend, Filler, Tooltip);
        myChart = new Chart(
          canvas,
          config
        );

        // setTimeout(() => {
        //   (<any> myChart.data.labels).push('aaa');
        //   myChart.data.datasets.forEach((dataset) => {
        //     dataset.data.push(80);
        //   });
        //   myChart.reset();
        //   myChart.update();
        // }, 500);
      }
    });

    return {
      id,
      updateChart
    }
  },
});
</script>

<style scoped>

</style>
