<template>
  <div>
    <lay-layer v-model="visible" :shade="false" :area="['1400px', '750px']" :resize="true" :title=title
      :titleStyle="titleStyle">
      <div style="display: inline-flex;;width: 100%;height: 10%;border: 0;">
        <div style="width: 100%;height: 100%;border: 0;">
          <lay-form :model="model">
            <lay-form-item label="时段" style="padding-top: 8px;;" mode="inline">
              <lay-date-picker v-model="model.times" type='datetime' timestamp></lay-date-picker>
            </lay-form-item>
            <lay-form-item label="站号" mode="inline">
              <lay-input v-model="model.station_id"></lay-input>
            </lay-form-item>
            <lay-form-item label="类型" mode="inline">
              <lay-cascader v-model="model.cascader_value" :options="model.cascader_opt"></lay-cascader>
            </lay-form-item>
            <lay-form-item mode="inline">
              <!-- <lay-button type="primary" @click="get_line">数据</lay-button> -->
              <!-- <lay-button type="primary">查询</lay-button> -->
              <lay-button type="danger" @click="get_auto">查询</lay-button>
            </lay-form-item>
          </lay-form>
        </div>
        <!-- <div style="width: 40%;height: 100%;;padding-top: 12px;">
          
        </div> -->

      </div>
      <div :style="{ width: '100%', height: '600px' }" :id="id"></div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
import $ from 'jquery'

import Highcharts from "highcharts";
import Windbarb from 'highcharts/modules/windbarb'
Windbarb(Highcharts)

//可以根据实际需求来引入对应的包
export default {
  name: "extra_single",
  data() {
    return {
      title: "单站时序图",
      titleStyle: {
        "color": "white",
        "border": "none",
        "font-size": "15px",
        "background-color": "rgb(68,118,167)"
      },
      recv_single_data: [],
      visible: false,
      model: {
        station_id: "",
        times: "",
        cascader_value: "rain",
        cascader_opt: [
          {
            value: "rain",
            label: "降水"
          },
          {
            value: "wind",
            label: "风力"
          },
          {
            value: "temp",
            label: "温度"
          },
          {
            value: "view",
            label: "能见度"
          }

        ],
      },
      id: "highchartplot",
      chartOptions: {
        title: {
          text: '数据为空'
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
        series: []
      },
    }
  },
  methods: {
    get_auto() {
      let that = this
      var today = new Date()
      var y = today.getFullYear();
      var m = today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
      var d = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
      var h = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
      var min = today.getMinutes() < 10 ? "0" + today.getMinutes() + ":00" : today.getMinutes() + ":00"
      var today_str = y + "-" + m + "-" + d + " " + h + ":" + min;
      var ms = Math.abs(Date.parse(today_str) - Date.parse(that.model.times));
      var days = Math.floor(ms / (24 * 3600 * 1000));
      if (days < 120) {
        var model = "zdz"
        // console.log("数据分析")
      }
      else {
        var model = "zdz_history"
        // console.log("数据分析2")
      }
    },
    open_single(plot_type, plot_name, model) {
      let that = this
      var today = new Date()
      var y = today.getFullYear();
      var m = today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
      var d = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
      var h = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
      var min = today.getMinutes() < 10 ? "0" + today.getMinutes() + ":00" : today.getMinutes() + ":00"
      var today_str = y + "-" + m + "-" + d + " " + h + ":" + min;
      that.model.times = today_str
      that.visible = true
      if (this.visible) {
        this.visible = true
        this.$nextTick(() => {
          if (model == "zdz") {
            that.get_line(plot_type, plot_name, today_str)
          }
          else if(model == "his") {
            that.model.times = that.$parent.model_side.his_times
            that.get_his_line(plot_type, plot_name, that.$parent.model_side.his_times)
          }
          else{
            console.log("单站按钮禁用")
          }

        })
      }
    },
    get_his_line(plot_type, plot_name, plot_time) {
      let that = this
      $.ajax({
        url: "http://172.21.158.40:9001/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: {
          // 'csrfmiddlewaretoken': csrf,
          'model': 'single_history',
          'click_type': plot_type,
          'plot_time': plot_time,
          'button_value': plot_name
        },
        dataType: "json",
        success: function (recvdate) {
          // var all_data = JSON.parse(recvdate.value)                                                  
          var his = JSON.parse(recvdate.his)
          var now = JSON.parse(recvdate.now)
          var windhis = JSON.parse(recvdate.windhis)
          var windnow = JSON.parse(recvdate.windnow)
          var plot_data = that.decode_line(plot_type, his, now, windhis, windnow)
          var opt = that.decode_opt(plot_type, plot_data, model)
          that.rander_station(opt)
        }
      })

    },
    get_line(plot_type, plot_name, plot_time) {
      let that = this
      // var plot_type = "rain"
      // var plot_name = "58660"
      // var plot_time = "2023-12-16 15:11:02"
      var model = "zdz"
      if (plot_name) {
        $.ajax({
          url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
          type: "post",  // 请求方式
          timeout: 25000, //设置延迟上限
          data: {
            // 'csrfmiddlewaretoken': csrf,
            'model': 'single',
            'click_type': plot_type,
            'plot_time': plot_time,
            'button_value': plot_name
          },
          dataType: "json",
          success: function (recvdate) {
            var his = JSON.parse(recvdate.his)
            var now = JSON.parse(recvdate.now)
            var windhis = JSON.parse(recvdate.windhis)
            var windnow = JSON.parse(recvdate.windnow)
            var plot_data = that.decode_line(plot_type, his, now, windhis, windnow)
            var opt = that.decode_opt(plot_type, plot_data, model)
            that.rander_station(opt)
          }
        })
      }
    },
    decode_line(plot_type, his, now, windhis, windnow) {
      let that = this
      that.recv_single_data = []
      var data_time = []
      var data_his = [] // 历史数据
      var data_now = [] // 当前数据
      now.forEach(function (item, index) {
        if (plot_type == "rain") {
          data_time.push(item[0].substring(11, 16))
          that.recv_single_data.push(item[2])
          data_now.push(parseFloat(item[2]))
          data_his.push(null)
        }
        else if (plot_type == "wind" || plot_type == "sped") {
          var values = [parseFloat(item[2]), parseFloat(item[3])]
          data_time.push(item[0].substring(11, 16))
          data_now.push(values)
          data_his.push([null, null])
        }
        else if (plot_type == "tmax" || plot_type == "tmin" || plot_type == "temp") {
          data_time.push(item[0].substring(11, 16))
          data_now.push(parseFloat(item[2]))
          data_his.push(null)
        }
        else if (plot_type == "view") {
          data_time.push(item[0].substring(11, 16))
          data_now.push(parseFloat(item[2]))
          data_his.push(null)
        }
      })
      // 历史数据
      if (his != "none") {
        his.forEach(function (item, index) {
          if (plot_type == "rain") {
            data_time.push(item[0].substring(11, 16))
            that.recv_single_data.push(item[2])
            data_now.push(null)
            data_his.push(parseFloat(item[2]))
          }
          else if (plot_type == "wind" || plot_type == "sped") {
            var values = [parseFloat(item[2]), parseFloat(item[3])]
            data_time.push(item[0].substring(11, 16))
            data_now.push([null, null])
            data_his.push(values)
          }
          else if (plot_type == "tmax" || plot_type == "tmin" || plot_type == "temp") {
            data_time.push(item[0].substring(11, 16))
            data_now.push(null)
            data_his.push(parseFloat(item[2]))
          }
          else if (plot_type == "view") {
            data_time.push(item[0].substring(11, 16))
            data_now.push(null)
            data_his.push(parseFloat(item[2]))
          }
        })
      }
      else {
        data_his = []
      }
      if (plot_type == "wind" || plot_type == "sped") {
        var wind_time = []
        var wind_his = []
        var wind_now = []
        windnow.forEach(function (item, index) {
          wind_time.push(item[0].substring(11, 16))
          wind_his.push([null, null])
          wind_now.push([parseFloat(item[2]), parseFloat(item[1])])
        })
        if (windhis != "none") {
          windhis.forEach(function (item, index) {
            wind_time.push(item[0].substring(11, 16))
            wind_his.push([parseFloat(item[2]), parseFloat(item[1])])
            wind_now.push([null, null])
          })
        }
        else {
          windhis = undefined
        }

      }
      else {
        var wind_time = undefined
        var wind_his = undefined
        var wind_now = undefined
      }
      return [data_time, data_now, data_his, wind_time, wind_now, wind_his]
    },
    decode_opt(plot_type, plot_data, model) {
      let that = this
      var timeindex = plot_data[0]
      var now = plot_data[1]
      var his = plot_data[2]
      var opt = undefined
      var hoursindex = ['20:00', '21:00', '22:00', '23:00', '24:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
      if (plot_type == "rain") {
        opt = {
          chart: {
            type: 'column',
            zoomType: 'x',
            events: {
              selection: function (e) {
                // 事件处理代码，可以通过 console.log(e) 查看更多详细信息
                if (e.xAxis) {
                  var min = Math.ceil(e.xAxis[0].min);
                  var max = Math.floor(e.xAxis[0].max);
                  var sum_data = 0
                  that.recv_single_data.forEach(function (item, index) {
                    if (index > min && index < max) {
                      sum_data = sum_data + parseFloat(item)
                    }
                  })
                  var text = {
                    text: "累计降水" + sum_data.toFixed(2).toString() + "毫米,",
                    align: "left",
                    x: 50,
                    style: {
                      color: "black"
                    }
                  }
                  Highcharts.charts[Highcharts.charts.length - 1].setTitle(text);
                }
              }
            }
          },
          credits: {
            enabled: false//不显示LOGO
          },
          title: {
            text: '降水'
          },
          xAxis: [{
            categories: timeindex,
            // type:"linear",
            tickInterval: 60,
            lineColor: "black",
            lineWidth: 1,
            labels: {
              // step:12,
              rotation: 0,
              formatter: function () {
                // var index = parseInt(this.value)                                          
                var labe = this.value
                if (model == "zdz") {
                  if (this.value.substring(2, 5) == ":00") {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe) 
                  }
                  else {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe,this.value.substring(2,4)) 
                  }
                }
                else {
                  console.log("标签", labe)
                }

                return labe
              },
              // useHTML: true
            },
            offset: 0
          }
          ],
          yAxis: {
            min: 0,
            max: 50,
            title: {
              text: '降雨量 (mm)'
            },
            lineColor: "black",
            lineWidth: 2,
            gridLineColor: 'black',
            gridLineDashStyle: 'Dash'
            // gridLineWidth:1
            // gridLineDashStyle:'Dash'
          },
          tooltip: {
            useHTML: true,
            headerFormat: '<small>{point.key}</small><table>',
            pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
              '<td style="text-align: right"><b>{point.y} mm</b></td></tr>',
            footerFormat: '</table>',
            valueDecimals: 2

          },
          series: [
            {
              name: '昨天',
              color: "red",
              xAxis: 0,
              data: his
            }, {
              name: '今天',
              color: "blue",
              xAxis: 0,
              data: now
            }]
        }
      }
      else if (plot_type == "wind" || plot_type == "sped") {
        opt = {
          title: {
            text: '风场'
          },
          credits: {
            enabled: false//不显示LOGO
          },
          chart: {
            zoomType: 'x'
          },
          yAxis: {
            min: 0,
            title: {
              text: '风力 (m/s)'
            },
            lineColor: "black",
            lineWidth: 2
            // gridLineColor: 'black',
            // gridLineDashStyle: 'Dash'
            // gridLineWidth:1
            // gridLineDashStyle:'Dash'
          },
          xAxis: [{
            categories: plot_data[3],
            lineColor: "black",
            lineWidth: 2,
            offset: 40
          }, {
            categories: timeindex,
            lineColor: "black",
            tickInterval: 60,
            lineWidth: 2,
            labels: {
              // step:12,
              rotation: 0,
              formatter: function () {
                // var index = parseInt(this.value)                                          
                var labe = this.value
                if (model == "zdz") {
                  if (this.value.substring(2, 5) == ":00") {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe) 
                  }
                  else {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe,this.value.substring(2,4)) 
                  }
                }
                else {
                  console.log("标签", labe)
                }
                return labe
              },
              // useHTML: true
            },
            offset: 80
          }
          ],
          // plotOptions: {
          //     series: {
          //         pointStart: Date.UTC(2017, 0, 29),
          //         pointInterval: 36e5
          //     }
          // },
          series: [{
            type: 'windbarb',
            data: plot_data[4],
            // name: 'Wind',
            color: "blue",
            xAxis: 0,
            showInLegend: false,
            tooltip: {
              valueSuffix: ' m/s'
            }
          },
          {
            type: 'windbarb',
            data: plot_data[5],
            // name: 'Wind',
            color: "red",
            xAxis: 0,
            showInLegend: false,
            tooltip: {
              valueSuffix: ' m/s'
            }
          },
          {
            type: 'area',
            keys: ['y', 'rotation'], // rotation is not used here
            data: now,
            xAxis: 1,
            color: "blue",
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, "blue"],
                [
                  1,
                  "white"
                ]
              ]
            },
            name: '今天',
            tooltip: {
              valueSuffix: ' m/s'
            }
          },
          {
            type: 'area',
            keys: ['y', 'rotation'], // rotation is not used here
            data: his,
            xAxis: 1,
            color: "red",
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, "red"],
                [
                  1,
                  "white"
                ]
              ]
            },
            name: '昨天',
            tooltip: {
              valueSuffix: ' m/s'
            }
          },
          ]
        }

      }
      else if (plot_type == "tmax" || plot_type == "tmin" || plot_type == "temp") {
        opt = {
          chart: {
            type: 'spline',
            zoomType: 'x'
          },
          credits: {
            enabled: false//不显示LOGO
          },
          title: {
            text: '气温'
          },
          // subtitle: {
          //     text: '数据来源: WorldClimate.com'
          // },
          // plotOptions: {
          //     series: {
          //         pointStart: Date.UTC(2013, 11, 14, 0, 0, 0, 0),
          //         pointInterval: 6e5
          //     }
          // },
          xAxis: {
            categories: timeindex,
            // labels: {
            //     step: 12,
            // },
            lineColor: "black",
            lineWidth: 3,
            tickInterval: 60,
            labels: {
              // step:12,
              rotation: 0,
              formatter: function () {
                // var index = parseInt(this.value)                                          
                var labe = this.value
                if (model == "zdz") {
                  if (this.value.substring(2, 5) == ":00") {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe) 
                  }
                  else {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe,this.value.substring(2,4)) 
                  }
                }
                else {
                  console.log("标签", labe)
                }
                return labe
              },
              // useHTML: true
            },
            gridLineWidth: 0.2,
            gridLineColor: 'black',
            gridLineDashStyle: 'Dash'
          },
          yAxis: {
            // min: 0,
            title: {
              text: '气温 (mm)'
            },
            gridLineColor: 'black',
            gridLineDashStyle: 'Dash'
            // gridLineWidth:1
            // gridLineDashStyle:'Dash'
          },
          tooltip: {
            useHTML: true,
            headerFormat: '<small>{point.key}</small><table>',
            pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
              '<td style="text-align: right"><b>{point.y} ℃</b></td></tr>',
            footerFormat: '</table>',
            valueDecimals: 2

          },
          series: [{
            name: '昨天',
            color: "red",
            data: his
          }, {
            name: '今天',
            color: "blue",
            data: now
          }]
        }

      }
      else if (plot_type == "view") {
        opt = {
          chart: {
            type: 'spline',
            zoomType: 'x'

          },
          credits: {
            enabled: false//不显示LOGO
          },
          title: {
            text: '能见度'
          },
          // subtitle: {
          //     text: '数据来源: WorldClimate.com'
          // },
          // plotOptions: {
          //     series: {
          //         pointStart: Date.UTC(2013, 11, 14, 0, 0, 0, 0),
          //         pointInterval: 6e5
          //     }
          // },
          xAxis: {
            categories: timeindex,
            // labels: {
            //     step: 12,

            // },
            gridLineWidth: 0.2,
            gridLineColor: 'black',
            gridLineDashStyle: 'Dash',
            lineColor: "black",
            lineWidth: 2,
            tickInterval: 20,
            labels: {
              // step:12,
              rotation: 0,
              formatter: function () {
                // var index = parseInt(this.value)                                          
                var labe = this.value
                if (model == "zdz") {
                  if (this.value.substring(2, 5) == ":00") {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe) 
                  }
                  else {
                    var labe = this.value.substring(0, 2) + "时"
                    // console.log("---",this.value,labe,this.value.substring(2,4)) 
                  }
                }
                else {
                  console.log("标签", labe)
                }
                return labe
              },
              // useHTML: true
            }
          },
          yAxis: {
            min: 0,
            title: {
              text: '能见度 (m)'
            },
            gridLineColor: 'black',
            gridLineDashStyle: 'Dash'
            // gridLineWidth:1
            // gridLineDashStyle:'Dash'
          },
          tooltip: {
            backgroundColor: '#FCFFC5',   // 背景颜色
            borderColor: 'black',         // 边框颜色
            borderRadius: 10,             // 边框圆角
            borderWidth: 3,               // 边框宽度
            shadow: true,                 // 是否显示阴影
            animation: true,              // 是否启用动画效果
            style: {                      // 文字内容相关样式
              color: "#ff0000",
              fontSize: "12px",
              fontWeight: "blod",
              fontFamily: "Courir new"
            },
            pointFormatter: function () {

              return '<span style="color: ' + this.series.color + '">\u25CF</span> ' +
                this.series.name + ': <b>' + this.y + "米" + '</b><br/>.'
            },
            dateTimeLabelFormats: {
              millisecond: "%A, %b %e, %H:%M:%S.%L",
              second: "%A, %b %e, %H:%M:%S",
              minute: "%A, %b %e, %H:%M",
              hour: "%A, %b %e, %H:%M",
              // day: "%A, %b %e, %Y",
              // week: "Week from %A, %b %e, %Y",
              // month: "%B %Y",
              // year: "%Y"
            }
          },
          series: [{
            name: '昨天',
            color: "red",
            data: his
          }, {
            name: '今天',
            color: "blue",
            data: now
          }]
        }
      }
      return opt
    },
    rander_station(chartOptions) {
      let that = this
      var chart = Highcharts.chart(this.id, chartOptions);
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

