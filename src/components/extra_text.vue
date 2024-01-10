<template>
  <div style="display: inline-flex;;width: 60px;">
    <lay-layer v-model="visible" :shade="false" :area="['1600px', '900px']" :resize="true" :title=title
      :titleStyle="titleStyle">
      <div
        style="display: inline-flex;width: 1560px;height: 830px;;margin-left: 20px;margin-top: 10px;overflow-y: hidden;overflow-x: hidden;">
        <div style="width: 50%;height: 100%;">
          <div style="width: 100%;height: 60%;">
            <lay-table :default-toolbar="false" :columns="columns" :data-source="dataSource" height="490px"
              :default-expand-all="false" >
              <template #toolbar>
                <lay-input v-model="model.input" style="width: 30%;margin-right: 20px;"></lay-input>
                <lay-button type="primary" size="sm" @click="reset">重置</lay-button>
                <lay-button type="primary" size="sm" @click="search">搜索</lay-button>
                <lay-button type="primary" size="sm" @click="rain">降水</lay-button>
                <lay-button type="primary" size="sm" @click="wind">风力</lay-button>
                <lay-button type="primary" size="sm" @click="tmax">高温</lay-button>
                <lay-button type="primary" size="sm" @click="view">能见度</lay-button>
              </template>
            </lay-table>
          </div>
          <div id="extra_text_msg" class="scrollbar"
            style="width: 96%;height: 40%;overflow-y:scroll;font-size: 15px;line-height: 2em;padding:2%;">
          </div>
        </div>
        <div style="width: 50%;height: 100%;">
          <div id="extra_text_label"
            style="width: 100%;height: 4%;background-color: blue;text-align: center;padding-top:10px;font-family:STKaiti,KaiTi;font-size: medium;color: white;">
          </div>
          <div id="extra_text_map" ref="extra_text_map" style="width: 100%;height: 87%;;background-color: white;">
          </div>
          <div style="width: 100%;height: 8%;padding-top: 10px;padding-left: 80%;">
            <lay-button type="primary" @click="remain">复核</lay-button>
            <lay-button type="primary" @click="plot">绘图</lay-button>
          </div>
        </div>
      </div>
    </lay-layer>
  </div>
  <lay-layer v-model="visible_confirm" :shade="false" :area="['600px', '200px']" :btn="action" title="快报选项">
    <lay-form :model="model">
      <lay-form-item label="时间" style="padding-top: 25px;" mode="inline">
        <lay-date-picker v-model="times" range type="datetime" :placeholder="['开始日期', '结束日期']"></lay-date-picker>
      </lay-form-item>
    </lay-form>
  </lay-layer>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
import $ from 'jquery'
import zhejianglist from "../json/zhejianglist.json"
import taizhoulocal from "../json/331000.json"
export default {
  name: "extra_text",
  data() {
    return {
      title: "气象快报",
      titleStyle: {
        "color": "white",
        "border": "none",
        "font-size": "15px",
        "background-color": "rgb(68,118,167)"
      },
      visible: false,
      visible_confirm: false,
      maps: undefined,
      current_map: undefined,
      current_list: [],
      times: ['2001-01-01 01:01:00', '2001-02-1 01:01:00'],
      model: {
        input: "",
        page: { current: 1, limit: 10, total: 100 }
      },
      columns: [ //标题栏
        { key: 'IIIII', title: 'ID' }
        , { key: 'Province', title: '省' }
        , { key: 'City', title: '地市' }
        , { key: 'Cnty', title: '县' }
        , { key: 'Town', title: '乡镇' }
        , { key: 'StationName', title: '站名' }
        , { key: 'rain', title: '雨量', sort: true }
      ],
      dataSource: [],
      recv_data: {
        extra_text: "",
        extra_rain: undefined,
        extra_tmax: undefined,
        extra_view: undefined,
        extra_wind: undefined,
      },
      action: [
        {
          text: "确认",
          callback: () => {
            let that = this
            that.$nextTick(() => {
              // this.get_data(value_index, tables_name)
              that.get_data()
              that.visible = true
              that.visible_confirm = false

            })
          }
        },
        {
          text: "取消",
          callback: () => {
            this.visible_confirm = false
          }
        }
      ]
    }
  },
  methods: {
    activate_extra_text_opt() {
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
      that.visible_confirm = true
    },
    reset() {
      let that = this
      that.rain()
    },
    search() {
      let that = this
      var returndata = that.dataSource
      var search_data = []
      returndata.forEach(function (item) {
        if ((item.IIIII == that.model.input) || (item.StationName == that.model.input) || (item.City == that.model.input) || (item.Cnty == that.model.input)) {
          search_data.push(item)
        }
      })
      that.dataSource = []
      that.dataSource = search_data
    },
    del_rain(station_id) {
      let that = this
      var newArray = that.recv_data.extra_rain.filter(function (item) {
        return item.IIIII !== station_id
      });
      that.recv_data.extra_rain = undefined
      that.recv_data.extra_rain = newArray
    },
    flush_map() {
      let that = this
      if (that.current_map) {
        that.current_list.forEach(function (item) {
          that.current_map.removeLayer(item)
        })
      }
    },
    remain() {
      let that = this
      if (localStorage.userId) {
        var city_code = localStorage.name
        var city_type = localStorage.companyType
      }
      else {
        var city_code = "331000"
        var city_type = "1"
      }
      var send_rain = JSON.stringify(that.recv_data.extra_rain)
      var send_wind = JSON.stringify(that.recv_data.extra_wind)
      var send_tmax = JSON.stringify(that.recv_data.extra_tmax)
      var send_view = JSON.stringify(that.recv_data.extra_view)
      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: {
          // 'csrfmiddlewaretoken': csrf,
          'model': "extra_geojosn_remain",
          'rain': send_rain, // 降水
          'wind': send_wind, // 风力
          'city_code': city_code,
          'tmax': send_tmax, // 高温
          'view': send_view // 能见度
        },
        dataType: "json",
        success: function (recvdate) {
          // 获取数据
          that.recv_data.extra_text = recvdate.extra_text
          $("#extra_text_msg").html("")
          $("#extra_text_msg").html(recvdate.extra_text)
          that.recv_data.extra_rain = JSON.parse(recvdate.extra_rain)
          that.recv_data.extra_wind = JSON.parse(recvdate.extra_wind)
          that.recv_data.extra_tmax = JSON.parse(recvdate.extra_tmax)
          that.recv_data.extra_view = JSON.parse(recvdate.extra_view)
          that.flush_map()
          that.rain()
        }
      })
    },
    add_colorbar(hours, plot_type) {
      let that = this
      if (hours > 24) {
        var rain_list = [0, 5, 10, 15, 20, 25, 35, 50, 75, 100, 150, 200, 250, 350, 500].reverse()
      }
      else if (hours >= 1) {
        var rain_list = [0, 2, 5, 10, 15, 20, 25, 35, 50, 60, 70, 80, 90, 100, 110].reverse()
      }
      else {
        var rain_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 15, 17, 20].reverse()
      }
      var docm = $('.leaflet-control-extra-text')
      docm.remove()
      L.Control.Logo = L.Control.extend({
        options: {
          position: 'bottomright' //初始位置

        },
        initialize: function (options) {
          L.Util.extend(this.options, options);
        },
        onAdd: function (map) {
          //创建一个class为 leaflet-control-extra-text的div
          this._container = L.DomUtil.create('div', 'leaflet-control-extra-text');
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
      L.control.logo({ position: 'bottomright', data: "ok" }).addTo(that.current_map);
    },
    plot() {
      let that = this
      that.flush_map()
      // extra_text_label
      $("#extra_text_label").html("")
      var values = {
        "rain": " 累积雨量（毫米）",
        "wind": " 最大风力",
        "tmax": " 最高气温",
        "tmin": " 最低气温",
      }
      // console.log($("#plot_img-startDate-1").val(), $("#plot_img-endDate-1").val())
      var label = that.times[0].substring(5, 7) + "月" + that.times[0].substring(8, 10) + "日" + that.times[0].substring(11, 13) + "时" + "～"
      label = label + that.times[1].substring(5, 7) + "月" + that.times[1].substring(8, 10) + "日" + that.times[1].substring(11, 13) + "时"
      label = label + values["rain"]
      $("#extra_text_label").html(label)
      if (localStorage.userId) {
        var city_code = localStorage.name
        var city_type = localStorage.companyType
      }
      else {
        var city_code = "331000"
        var city_type = "1"
      }
      var send_data = JSON.stringify(that.recv_data.extra_rain)
      var send_type = "rain"
      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: {
          // 'csrfmiddlewaretoken': csrf,
          'model': "extra_geojosn_plot",
          'start': that.times[0],
          'end': that.times[1],
          'city_code': city_code,
          'click_type': send_type, // 绘图类型
          'button_value': send_data // 绘图数据
        },
        dataType: "json",
        success: function (recvdate) {
          // 获取数据
          var contourf = JSON.parse(recvdate.contour)
          that.flush_map()
          var reallayer = L.geoJSON(contourf, {
            style: function (feature) {
              return { color: feature.properties.stroke, weight: 1, fill: true, fillColor: feature.properties.stroke, fillOpacity: 1 };
            }
          }).addTo(that.current_map)
          that.current_list.push(reallayer)
          var shplayer = JSON.parse(localStorage.getItem('userShp'))
          if (shplayer) {
            L.mask(shplayer, {
              fitBounds: false,
              restrictBounds: false,
              color: "black",
              fillColor: "white",// 边框颜色
              fillOpacity: 1,
            }).addTo(that.current_map);
          }
          else {
            L.mask(taizhoulocal, {
              fitBounds: false,
              restrictBounds: false,
              color: "black",
              fillColor: "white",// 边框颜色
              fillOpacity: 1,
            }).addTo(that.current_map);
          }
          that.add_colorbar(recvdate.hours, "rain")
        }
      })

    },
    rain() {
      let that = this
      that.dataSource = []
      that.columns = [ //标题栏
        { key: 'IIIII', title: 'ID' }
        , { key: 'Province', title: '省' }
        , { key: 'City', title: '地市' }
        , { key: 'Cnty', title: '县' }
        , { key: 'Town', title: '乡镇' }
        , { key: 'StationName', title: '站名' }
        , { key: 'rain', title: '雨量', sort: true }
      ]
      that.dataSource = that.recv_data.extra_rain
      that.flush_map()
      that.recv_data.extra_rain.forEach(function (item) {
        var latlng = L.latLng(item.Lat, item.Lon);
        var tooltips = item.StationName + "-" + item.IIIII + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
        if (item.rain > 0 && item.rain <= 5) {
          var colors = "white"
          var iflabel = false
        }
        else if (item.rain > 5 && item.rain <= 17) {
          var colors = "green"
          var iflabel = false
        }
        else if (item.rain > 17 && item.rain <= 38) {
          var colors = "blue"
          var iflabel = false
        }
        else if (item.rain > 38 && item.rain <= 74) {

          var colors = "red"
          // var colors = "blue"
          var iflabel = false
        }
        else if (item.rain > 74) {
          var colors = "rgb(210,5,234)"
          var iflabel = false
        }
        if (item.std > 0) {
          var circle = L.circleMarker(latlng, {
            stationname: item.StationName,
            stationnum: item.IIIII,
            radius: 20,
            fill: false,
            color: "red"
          }).addTo(that.current_map)
          that.current_list.push(circle)
        }

        // 添加散点插件
        var c = L.circleMarker(latlng, {
          stationname: item.StationName,
          stationnum: item.IIIII,
          weight: 0,
          radius: 8,
          opacity: 0,
          fill: false,
          color: colors,
          fillColor: colors,
          fillOpacity: 1,
          labelStyle: {
            text: item.rain,
            collisionFlg: false,
            // offsetY: -25,
            scale: 1.5,
            weight: 3,
            rotation: 0,
            fillStyle: colors,
            zIndex: 60
          }
        })
        // .bindTooltip(tooltips, {
        //   direction: "top",
        //   offset: L.point(0, -10)
        // }).openTooltip();
        that.current_list.push(c)
        c.addTo(that.current_map).on("click", function (e) {
          that.del_rain(e.sourceTarget.options.stationnum)
          that.flush_map()
          that.rain()
        })
      })
    },
    wind() {
      let that = this
      that.columns = [ //标题栏
        { key: 'IIIII', title: 'ID', sort: true }
        , { key: 'Province', title: '省' }
        , { key: 'City', title: '地市' }
        , { key: 'Cnty', title: '县' }
        , { key: 'Town', title: '乡镇' }
        , { key: 'StationName', title: '站名' }
        , { key: 'wind', title: '风力', sort: true }
      ]
      that.dataSource = that.recv_data.extra_wind
      that.flush_map()
      that.recv_data.extra_wind.forEach(function (item) {
        var tooltips = item.StationName + "-" + item.IIIII + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
        if (item.wind > 17.3) {
          var colors = "red"
          var latlng = L.latLng(item.Lat, item.Lon);
          // 添加散点插件
          var c = L.circleMarker(latlng, {
            stationname: item.StationName,
            stationnum: item.IIIII,
            weight: 0,
            radius: 8,
            opacity: 0,
            fill: false,
            color: colors,
            fillColor: colors,
            fillOpacity: 1,
            labelStyle: {
              text: item.wind,
              collisionFlg: false,
              // offsetY: -25,
              scale: 1.5,
              weight: 3,
              rotation: 0,
              fillStyle: colors,
              zIndex: 60
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          that.current_list.push(c)
          c.addTo(that.current_map)
        }

      })
    },
    tmax() {
      let that = this
      that.columns = [ //标题栏
        { key: 'IIIII', title: 'ID', sort: true }
        , { key: 'Province', title: '省' }
        , { key: 'City', title: '地市' }
        , { key: 'Cnty', title: '县' }
        , { key: 'Town', title: '乡镇' }
        , { key: 'StationName', title: '站名' }
        , { key: 'tmax', title: '高温', sort: true }
      ]
      that.dataSource = that.recv_data.extra_tmax
      that.flush_map()
      that.recv_data.extra_wind.forEach(function (item) {
        var latlng = L.latLng(item.Lat, item.Lon);
        var tooltips = item.StationName + "-" + item.IIIII + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
        if (item.tmax > 37 && item.tmax < 40) {
          var colors = "pink"
          var iflabel = false
          // 添加散点插件
          var c = L.circleMarker(latlng, {
            stationname: item.StationName,
            stationnum: item.IIIII,
            weight: 0,
            radius: 8,
            opacity: 0,
            fill: false,
            color: colors,
            fillColor: colors,
            fillOpacity: 1,
            labelStyle: {
              text: item.tmax,
              collisionFlg: false,
              // offsetY: -25,
              scale: 1.5,
              weight: 3,
              rotation: 0,
              fillStyle: colors,
              zIndex: 60
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          that.current_list.push(c)
          c.addTo(that.current_map)
        }
        else if ((item.tmax >= 40) && (item.tmax <= 500)) {
          var colors = "red"
          var iflabel = false
          // 添加散点插件
          var c = L.circleMarker(latlng, {
            stationname: item.StationName,
            stationnum: item.IIIII,
            weight: 0,
            radius: 8,
            opacity: 0,
            fill: false,
            color: colors,
            fillColor: colors,
            fillOpacity: 1,
            labelStyle: {
              text: item.tmax,
              collisionFlg: false,
              // offsetY: -25,
              scale: 1.5,
              weight: 3,
              rotation: 0,
              fillStyle: colors,
              zIndex: 60
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          that.current_list.push(c)
          c.addTo(that.current_map)
        }
      })
    },
    view() {
      let that = this
      that.columns = [ //标题栏
        { key: 'IIIII', title: 'ID', sort: true }
        , { key: 'Province', title: '省' }
        , { key: 'City', title: '地市' }
        , { key: 'Cnty', title: '县' }
        , { key: 'Town', title: '乡镇' }
        , { key: 'StationName', title: '站名' }
        , { key: 'view', title: '能见度', sort: true }
      ]
      that.dataSource = that.recv_data.extra_view
      that.flush_map()
      that.recv_data.extra_view.forEach(function (item) {
        var latlng = L.latLng(item.Lat, item.Lon);
        var tooltips = item.StationName + "-" + item.IIIII + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
        if (item.view > 500 && item.view <= 1000) {
          var colors = "blue"
          // 添加散点插件
          var c = L.circleMarker(latlng, {
            stationname: item.StationName,
            stationnum: item.IIIII,
            weight: 0,
            radius: 8,
            opacity: 0,
            fill: false,
            color: colors,
            fillColor: colors,
            fillOpacity: 1,
            labelStyle: {
              text: item.view,
              collisionFlg: true,
              // offsetY: -25,
              scale: 1.5,
              weight: 3,
              rotation: 0,
              fillStyle: colors,
              zIndex: 60
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          that.current_list.push(c)
          c.addTo(that.current_map)
        }
        else if (item.view > 200 && item.view < 500) {
          var colors = "orange"
          var iflabel = false
          // 添加散点插件
          var c = L.circleMarker(latlng, {
            stationname: item.StationName,
            stationnum: item.IIIII,
            weight: 0,
            radius: 8,
            opacity: 0,
            fill: false,
            color: colors,
            fillColor: colors,
            fillOpacity: 1,
            labelStyle: {
              text: item.view,
              collisionFlg: true,
              // offsetY: -25,
              scale: 1.5,
              weight: 3,
              rotation: 0,
              fillStyle: colors,
              zIndex: 60
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          that.current_list.push(c)
          c.addTo(that.current_map)
        }
        else if (item.view < 50 && item.view > 0) {
          var colors = "red"
          var iflabel = false
          // 添加散点插件
          var c = L.circleMarker(latlng, {
            stationname: item.StationName,
            stationnum: item.IIIII,
            weight: 0,
            radius: 8,
            opacity: 0,
            fill: false,
            color: colors,
            fillColor: colors,
            fillOpacity: 1,
            labelStyle: {
              text: item.view,
              collisionFlg: true,
              // offsetY: -25,
              scale: 1.5,
              weight: 3,
              rotation: 0,
              fillStyle: colors,
              zIndex: 60
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          that.current_list.push(c)
          c.addTo(that.current_map)
        }
      })
    },
    get_data() {
      let that = this
      if (localStorage.userId) {
        var city_code = localStorage.name
        var city_type = localStorage.companyType
      }
      else {
        var city_code = 331000
        var city_type = "1"
      }
      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: {
          // 'csrfmiddlewaretoken': csrf,
          'model': "extra_download",
          'start': that.times[0],
          'end': that.times[1],
          'click_type': city_code, // 城市
          'button_value': city_type // 乡镇
        },
        dataType: "json",
        success: function (recvdate) {
          // 获取数据
          that.recv_data.extra_text = recvdate.extra_text
          $("#extra_text_msg").html("")
          $("#extra_text_msg").html(recvdate.extra_text)
          that.recv_data.extra_rain = JSON.parse(recvdate.extra_rain)
          that.recv_data.extra_wind = JSON.parse(recvdate.extra_wind)
          that.recv_data.extra_tmax = JSON.parse(recvdate.extra_tmax)
          that.recv_data.extra_view = JSON.parse(recvdate.extra_view)
          that.initmap()
          that.rain()
        }
      })
    },
    initmap() {
      let that = this
      var canvasLabel = new L.CanvasLabel({
        defaultLabelStyle: {
          collisionFlg: true,
          scale: 1,
          strokeStyle: "#000",
          fillStyle: "#fff",
          lineWidth: 3
        }
      })
      var lines = L.geoJSON(zhejianglist, {
        style: function (feature) {
          return { color: 'black', fill: false, weight: 1, fillOpacity: 0.1 };
        }
      })
      var corner1 = L.latLng(26, 115),
        corner2 = L.latLng(34, 125),
        bound = L.latLngBounds(corner1, corner2);
      var map_extra = new L.Map(that.$refs.extra_text_map, {
        center: new L.LatLng(28.6, 121.3),//110.763, 41.376   39.62353145, 121.9937485
        crs: L.CRS.EPSG3857,
        renderer: canvasLabel,
        zoom: 9, //4
        maxZoom: 12,
        minZoom: 8,
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        attributionControl: false, //是否去除右下角标志
        maxBounds: bound,
        maxBoundsViscosity: 1.0,
        layers: [lines]
      });
      that.current_map = map_extra

    }
  },
  mounted() {

  }
}

</script>

<style scoped>
#extra_text_map {
  height: 700px;
  width: 800px;
  /* background-color: white; */
}

.leaflet-control-extra-text ul li {
  padding: 0;
  margin: 0;
  list-style: square;
  display: flex;
  align-items: center;
  color: black !important;
  /* margin-bottom: 5px; */
}

.leaflet-control-extra-text ul li i {
  display: inline-block;
  width: 20px;
  height: 20px;
  color: black;
  /* border-radius: 50%; */
  margin-right: 15px;
}

.scrollbar::-webkit-scrollbar {
  display: none;
}
</style>