<template>
  <div style="display: inline-flex;;width: 60px;">
    <lay-layer v-model="visible" :shade="false" :area="['1400px', '800px']" :resize="true" :title=title
      :titleStyle="titleStyle">
      <div
        style="display: inline-flex;width: 1355px;height: 720px;;margin-left: 20px;margin-top: 10px;overflow-y: hidden;overflow-x: hidden;">
        <div style="width: 50%;height: 100%;">
          <div style="width: 100%;height: 8%;">
            <lay-form :model="model">
              <lay-form-item label="时段" style="padding-top: 8px;;" mode="inline">
                <lay-date-picker v-model="times" range type="datetime" :placeholder="['开始日期', '结束日期']"
                  @change="datechange"></lay-date-picker>
              </lay-form-item>
            </lay-form>
          </div>
          <div id="echart-line" style="width: 100%;height: 62%;">

          </div>
          <div id="daily_text" style="width: 100%;height: 30%;font-size: 15px;line-height: 2em;padding:2%;">

          </div>

        </div>
        <div id="his_clander_map" ref="his_clander_map" style="width: 50%;height: 100%;background-color: white;">

        </div>
      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
import * as echarts from 'echarts'
import $ from 'jquery'
import zhejianglist from "../json/zhejianglist.json"
import taizhoulocal from "../json/331000.json"
export default {
  name: "his_clander",
  data() {
    return {
      title: "日历",
      titleStyle: {
        "color": "white",
        "border": "none",
        "font-size": "15px",
        "background-color": "rgb(68,118,167)"
      },
      visible: false,
      times: ['2001-01-01 01:01:00', '2001-02-1 01:01:00'],
      chart: undefined,
      current_map: undefined,
      current_list: []
    }
  },
  methods: {
    activate_his_clander() {
      let that = this
      var today = new Date()
      var y = today.getFullYear();
      var m = today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
      var d = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
      var h = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
      var min = today.getMinutes() < 10 ? "0" + today.getMinutes() + ":00" : today.getMinutes() + ":00"
      var today_str = y + "-" + m + "-" + d + " " + h + ":" + min;
      var timeslist = [today_str, today_str]
      that.times = timeslist
      that.visible = true
      that.$nextTick(() => {
        that.get_data()
      })
    },
    datechange() {
      let that = this
      that.initChart()
    },
    initChart(data) {
      let that = this
      let getchart = echarts.init(document.getElementById('echart-line'));
      var option;
      const dateList = data
      const heatmapData = [];
      const lunarData = [];
      for (let i = 0; i < dateList.length; i++) {
        heatmapData.push([dateList[i][1], dateList[i][5]]);
        lunarData.push([dateList[i][1], dateList[i][3]]);
      }
      option = {
        tooltip: {
          formatter: function (params) {
            return '降雨量: ' + params.value[1].toFixed(2);
          }
        },
        visualMap: {
          show: true,
          type: 'piecewise',
          min: 0,
          max: 300,
          calculable: true,
          seriesIndex: [2],
          orient: 'horizontal',
          left: 'center',
          right: 0,
          bottom: 10,
          pieces: [
            { min: 150, color: 'rgb(140,0,65)' },//,label:""
            { min: 100, max: 150, color: 'rgb(255,0,255)' },
            { min: 50, max: 100, color: 'rgb(25,0,235)' },
            { min: 25, max: 50, color: 'rgb(62,185,255)' },
            { min: 10, max: 25, color: 'rgb(0,191,27)' },
            { max: 10, color: 'white' }
          ],
          inRange: {
            // color: ['#e0ffff', '#006edd'],
            opacity: 0.8
          },
          controller: {
            inRange: {
              opacity: 0.5
            }
          }
        },
        calendar: [
          {
            left: 'center',
            top: 'middle',
            cellSize: [70, 50],
            yearLabel: { show: false },
            orient: 'vertical',
            dayLabel: {
              firstDay: 1,
              nameMap: 'cn'
            },
            monthLabel: {
              show: false
            },
            range: [dateList[0][1], dateList[dateList.length - 1][1]]
          }
        ],
        series: [
          {
            type: 'scatter',// 日期
            coordinateSystem: 'calendar',
            symbolSize: 0,
            label: {
              show: true,
              formatter: function (params) {
                var d = echarts.number.parseDate(params.value[0]);
                return d.getDate() + '\n\n'
              },
              color: '#000'
            },
            data: lunarData,
            silent: true
          },
          {
            type: 'scatter',// 风力
            coordinateSystem: 'calendar',
            symbolSize: 0,
            label: {
              show: true,
              formatter: function (params) {
                if (params.value[1] > 30) {
                  var label = params.value[1]
                }
                else {
                  var label = ""
                }
                return (label);
              },
              fontSize: 14,
              fontWeight: 700,
              color: 'red'
            },
            data: lunarData,
            silent: true
          },
          {
            name: '降雨量', // 降水
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: heatmapData
          }
        ]
      };
      getchart.setOption(option);
      //随着屏幕大小调节图表
      getchart.on('click', function (e) {
        // console.log(e, e.value)
        that.get_daily(e.value[0])
      })
      window.addEventListener("resize", () => {
        getchart.resize();
      });
    },
    initmap() {
      let that = this
      var lines = L.geoJSON(taizhoulocal, {
        style: function (feature) {
          return { color: 'black', weight: 0.8, fill: false };
        }
      })
      var canvasLabel = new L.CanvasLabel({
        defaultLabelStyle: {
          collisionFlg: true,
          scale: 1,
          strokeStyle: "#000",
          fillStyle: "black",
          lineWidth: 3
        }
      });
      var map_image = new L.Map(that.$refs.his_clander_map, {
        center: new L.LatLng(28.6, 121.1),//110.763, 41.376   39.62353145, 121.9937485
        renderer: canvasLabel,
        zoom: 9, //4
        maxZoom: 12,
        minZoom: 8,
        zoomControl: false,
        // dragging: false,
        // scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false, //是否去除右下角标志
        // maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        layers: [lines]
      });
      that.current_map = map_image
      that.add_colorbar()
    },
    flash_map() {
      let that = this
      if (that.current_map) {
        that.current_list.forEach(function (item) {
          that.current_map.removeLayer(item)
        })
      }
    },
    plot_mark(plot_data) {
      let that = this
      plot_data.forEach(function (item) {
        if ((item.WIN_S_Gust_Max > 17) && (item.WIN_S_Gust_Max < 100)) {
          var colors = "red" // 粉色
          var latlng = L.latLng(item.Lat, item.Lon);
          var icon = L.WindBarb.icon({
            color: "red",
            deg: item.WIN_D_Gust_Max,
            pointRadius: 8,
            strokeColor: colors,
            strokeLength: 10,
            forceDir: true,
            // barbSpaceing:4,
            // barbHeight:20,
            fillColor: colors,
            speed: (item.WIN_S_Gust_Max * 2.5)
          });
          var marker = L.marker([item.Lat, item.Lon], {
            icon: icon,
            name: item.Station_Id_C,
            stationname: item.Station_Name,
            stationnum: item.Station_Id_C,
            deg: item.WIN_D_Gust_Max,
            sped: item.WIN_S_Gust_Max * 2.5,
            station: item.Station_Name
          })
          marker.addTo(that.current_map)
          that.current_list.push(marker)
        }
      })

    },
    add_colorbar() {
      let that = this
      var rain_list = [0, 5, 10, 15, 20, 25, 35, 50, 75, 100, 150, 200, 250, 350, 500].reverse()
      L.Control.Logo = L.Control.extend({
        options: {
          position: 'bottomright' //初始位置
        },
        initialize: function (options) {
          L.Util.extend(this.options, options);
        },
        onAdd: function (map) {
          //创建一个class为 leaflet-control-his-clander的div
          this._container = L.DomUtil.create('div', 'leaflet-control-his-clander');
          // 开始逻辑编写
          var insertDom = document.createElement('ul');
          let str = ``;
          var separatedColors = ['#A3FAFD', '#29D3FD', '#29AAFF', '#2983FF', '#4EAB37', '#46FA35', '#F1F837', '#F1D139', '#F2A932', '#F13237', '#C4343A', '#A43237', '#A632B4', '#D032E1', '#E431FF'];
          separatedColors.reverse().forEach(function (item, index) {
            str += `<li style="padding:0;margin:0"><i style="background-color: ${separatedColors[index]};color: ${separatedColors[index]};padding:0;margin:0;">""</i>&nbsp;&nbsp;${rain_list[index]}</li>`
          })
          insertDom.innerHTML = str;
          this._container.appendChild(insertDom);
          return this._container;
        }
      });
      L.control.logo = function (options) {
        return new L.Control.Logo(options)
      };
      // L.control.logo({position: 'topright'}).addTo(extra_server_obj.current_map); 传参数的测试
      L.control.logo({ position: 'bottomright', data: "ok" }).addTo(that.current_map);
    },
    get_daily(times) {
      let that = this
      // console.log("daily",times)
      var ajaxdata = {
        // 'csrfmiddlewaretoken': csrf,
        'model': 'daily_single',
        'click_type': "taihzou",// 城市
        'button_value': "rain",// 请求类型
        'times': times
      }
      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: ajaxdata,
        dataType: "json",
        success: function (recvdate) {
          that.flash_map()
          var contourf = JSON.parse(recvdate.contour)
          var reallayer = L.geoJSON(contourf, {
            style: function (feature) {
              return { color: feature.properties.stroke, weight: 1, fill: true, fillColor: feature.properties.stroke, fillOpacity: 1 };
            }
          }).addTo(that.current_map)
          that.current_list.push(reallayer)
          that.plot_mark(JSON.parse(recvdate.wind_json))
          L.mask(taizhoulocal, {
            // fitBounds:true,
            fitBounds: false,
            restrictBounds: false,
            color: "black",
            fillColor: "white",// 边框颜色
            fillOpacity: 1,
          }).addTo(that.current_map);
          // daily_obj.add_colorbar(values_times_int[real_times_class], "rain")
          // 文字
          $("#daily_text").html("")
          $("#daily_text").html("【风雨快报】" + recvdate.text)
        }
      })

    },
    get_data() {
      let that = this
      var ajaxdata = {
        // 'csrfmiddlewaretoken': csrf,
        'model': 'daily_clander',
        'click_type': "taihzou",// 城市
        'button_value': "rain"// 请求类型
      }
      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: ajaxdata,
        dataType: "json",
        success: function (recvdate) {
          var datalist = JSON.parse(recvdate.data)
          that.initChart(datalist)
          that.initmap()
        }
      })

    }
  },
  mounted() {
    let that = this
  }
}

</script>

<style scoped>
#his_clander_map {
  height: 700px;
  width: 800px;
  /* background-color: white; */
}
.leaflet-control-his-clander ul li {
  padding: 0;
  margin: 0;
  list-style: square;
  display: flex;
  align-items: center;
  color: black !important;
  /* margin-bottom: 5px; */
}

.leaflet-control-his-clander ul li i {
  display: inline-block;
  width: 20px;
  height: 20px;
  color: black;
  /* border-radius: 50%; */
  margin-right: 15px;
}
</style>