<template>
  <div>
    <canvas :id="id"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
// import Chart from 'chart.js/auto';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, ChartConfiguration, Legend, Filler, Tooltip, ChartData } from 'chart.js';

export default defineComponent({
  name: 'LineChart',
  props: ['id'],
  setup(props) {
    const { id } = props;
    const skipped = (ctx: any, value: any) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
    const down = (ctx: any, value: any) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
    const labels = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
    ];
    const data = <ChartData> {
      labels: labels,
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 00, 132)',
        borderColor: 'rgb(255, 00, 132)',
        data: [0, 10, 5, null, 20, 30],
        tension: 0.5,
        pointStyle: 'circle',
        pointRadius: 10,
        pointHoverRadius: 15,
        spanGaps: true,
        stepped: true,
        segment: {
          borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
          borderDash: ctx => skipped(ctx, [6, 6])
        },
      }, {
        label: 'Dataset 2',
        data: [5, 15, 20, null, 23, 38],
        borderColor: 'blue',
        backgroundColor: 'blue',
        fill: true
      }]
    };

    const config: ChartConfiguration = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            display: true,
            labels: {
                color: 'rgb(255, 99, 132)'
            }
          },
          title: {
            display: true,
            text: 'Chart.js Line Chart',
            color: 'red'
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#FF00FF'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            },
            ticks: {
              color: 'yellow'
            },
            // suggestedMin: 0,
            // suggestedMax: 80
          }
        }
      }
    };

    onMounted(() => {
      let canvas = <HTMLCanvasElement> document.getElementById(id);
      if (canvas) {
        Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend, Filler, Tooltip);
        const myChart = new Chart(
          canvas,
          config
        );
        
        setTimeout(() => {
          (<any> myChart.data.labels).push('aaa');
          myChart.data.datasets.forEach((dataset) => {
            dataset.data.push(80);
          });
          myChart.reset();
          myChart.update();
        }, 500);
      }
    });

    return {
      id
    }
  },
});
</script>

<style scoped>

</style>
