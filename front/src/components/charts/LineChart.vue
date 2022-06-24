<template>
  <div>
    <div class="float-right">
      <slot name="header"></slot>
    </div>
    <div>
      <canvas class="w-full" :id="id"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
// import Chart from 'chart.js/auto';
import { Chart, LineController, LineElement, TimeScale, PointElement, LinearScale, Title, CategoryScale, ChartConfiguration, Legend, Filler, Tooltip, ChartData } from 'chart.js';

export default defineComponent({
  name: 'LineChart',
  props: ['id', 'datasets', 'title'],
  setup(props) {
    const { id, datasets, title } = props;
    const data = <ChartData> {
      // labels: labels,
      datasets: datasets
      // [{
      //   label: 'Used Rate',
      //   backgroundColor: 'rgb(255, 00, 132)',
      //   borderColor: 'rgb(255, 00, 132)',
      //   // data: [0, 10, 5, 50, 20, 30],
      //   tension: 0.4,
      //   pointStyle: 'circle',
      //   pointRadius: 5,
      //   pointHoverRadius: 10
      // }]
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
                color: 'white'
            }
          },
          title: {
            display: true,
            text: title,
            color: 'white'
          }
        },
        scales: {
          x: {
            grid: {
              color: (context) => {
                if (context.index === 0) {
                  return 'white';
                }

                return 'gray';
              }
            },
            ticks: {
              color: '#FFF',
              callback: function (val, index) {
                let datetime = (this.getLabelForValue(<number> val));
                return datetime.substring(10, 16);
              }
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            },
            grid: {
              color: (context) => {
                if (context.index === 0) {
                  return 'white';
                }

                return 'gray';
              }
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
    const updateChart = (datasets: any[]) => {
      if (myChart) {
        myChart.data.datasets = datasets;
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
        //   console.log('test');
        //   myChart.data.datasets.forEach((dataset) => {
        //     dataset.data.push({ x: '2022-06-21 15:58', y: 10 });
        //   });

        //   myChart.reset();
        //   myChart.update();
        // }, 1000);
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
