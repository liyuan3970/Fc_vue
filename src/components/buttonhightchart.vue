<template>
  <div>
    <lay-button type="primary" @click="changeVisible">highchart</lay-button>
    <lay-layer v-model="visible" :shade="false" :area="['1200px', '600px']" :btn="action" :resize="true" :title=title>
      <div :style="{ width: '100%', height: '450px' }" :id="id"></div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";


import Highcharts from "highcharts";
import Windbarb from 'highcharts/modules/windbarb'
Windbarb(Highcharts)

//可以根据实际需求来引入对应的包
export default {
  name: "buttonhighchart",
  data() {
    return {
      title: "我是highchart",
      visible: false,
      id: "highchartplot",
      chartOptions: {
        title: {
          text: 'Highcharts Wind Barbs'
        },
        xAxis: {
          type: 'datetime',
          offset: 40
        },
        plotOptions: {
          series: {
            pointStart: Date.UTC(2017, 0, 29),
            pointInterval: 36e5
          }
        },
        series: [
          {
          type: 'area',
          keys: ['y', 'rotation'], // rotation is not used here
          data: [
            [9.8, 177.9],
            [10.1, 177.2],
            [11.3, 179.7],
            [10.9, 175.5],
            [9.3, 159.9],
            [8.8, 159.6],
            [7.8, 162.6],
            [5.6, 186.2],
            [6.8, 146.0],
            [6.4, 139.9],
            [3.1, 180.2],
            [4.3, 177.6],
            [5.3, 191.8],
            [6.3, 173.1],
            [7.7, 140.2],
            [8.5, 136.1],
            [9.4, 142.9],
            [10.0, 140.4],
            [5.3, 142.1],
            [3.8, 141.0],
            [3.3, 116.5],
            [1.5, 327.5],
            [0.1, 1.1],
            [1.2, 11.1]
          ],
          color: Highcharts.getOptions().colors[0],
          fillColor: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [
                1,
                Highcharts.color(Highcharts.getOptions().colors[0])
                  .setOpacity(0.25).get()
              ]
            ]
          },
          name: 'Wind speed',
          tooltip: {
            valueSuffix: ' m/s'
          }
        }]
      },
      action: [
        {
          text: "确认",
          callback: () => {
            console.log("关闭")
            this.visible = false
          }
        },
        {
          text: "取消",
          callback: () => {
            // layer.confirm("取消操作", { shade: false });
            console.log("关闭")
            console.log("取消")
          }
        }
      ]
    }
  },
  methods: {
    changeVisible() {
      if (this.visible11) {
        console.log("关闭")
        this.visible = false
      }
      else {
        console.log("开启")
        this.visible = true
        this.$nextTick(() => {
          console.log("开启nextTick")
          var chart = Highcharts.chart(this.id, this.chartOptions);
          var newseries = {
            type: 'windbarb',
            data: [
              [9.8, 177.9],
              [10.1, 177.2],
              [11.3, 179.7],
              [10.9, 175.5],
              [9.3, 159.9],
              [8.8, 159.6],
              [7.8, 162.6],
              [5.6, 186.2],
              [6.8, 146.0],
              [6.4, 139.9],
              [3.1, 180.2],
              [4.3, 177.6],
              [5.3, 191.8],
              [6.3, 173.1],
              [7.7, 140.2],
              [8.5, 136.1],
              [9.4, 142.9],
              [10.0, 140.4],
              [5.3, 142.1],
              [3.8, 141.0],
              [3.3, 116.5],
              [1.5, 327.5],
              [0.1, 1.1],
              [1.2, 11.1]
            ],
            name: 'Wind',
            color: Highcharts.getOptions().colors[1],
            showInLegend: false,
            tooltip: {
              valueSuffix: ' m/s'
            }
          }
          chart.addSeries(newseries)

        })

      }

    }

  },
  mounted() {
    
  }
}

</script>

<style scoped>
#button_highchart {
  height: 490px;
  width: 100%;
}
</style>

