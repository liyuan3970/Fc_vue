<template>
  <div class="header">
    <audio id="audio" ref="audio" :src="mp3src" muted:true></audio>
    <headercomp @header-event="headerEvent"></headercomp>
  </div>
  <div class="side">
    <!-- <buttonmap></buttonmap>
      <buttondemo></buttondemo>
      <buttontable></buttontable>
      <buttonhightchart></buttonhightchart>
      <button>测试按钮</button> -->
    <sidecomp @side-event="sideEvent"></sidecomp>
    <warring_table ref="warring_table"></warring_table>
    <radar_section ref="radar_section"></radar_section>
    <extra_single ref="extra_single_main"></extra_single>
  </div>
  <div class="mainmap" id="mapmain">
  </div>
</template>

<script>
// 静态数据的引用
import zhejianglist from "./json/zhejianglist.json"
import taizhoulocal from "./json/331000.json"
import zhejiangcnty from './json/zhejiangcnty.json'
import zhejiangtownname from './json/zhejiangtownname'
import $ from 'jquery'
// 组件的引用
import { layer } from "@layui/layui-vue"
import { reactive, toRaw, markRaw } from 'vue'
import { shallowRef } from 'vue'

// import * as turf from '@turf/turf'
// import { point, circle, bboxPolygon, booleanPointInPolygon } from '@turf/turf'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-switch-basemap'
import './extendjs/js/turf.min.js'
import axios from 'axios'

import buttonmap from './components/buttonmap.vue'
import mapleaflet from './components/mapleaflet.vue'
import buttondemo from './components/buttondivdemo.vue'
import buttontable from './components/buttontable.vue'
import buttonhightchart from './components/buttonhightchart.vue'

import warring_table from './components/warring_table.vue'
import sidecomp from './components/sidecomp.vue'
import headercomp from './components/headercomp.vue'
import radar_section from "./components/radar_section.vue"
import extra_single from "./components/extra_single.vue"

export default {
  name: 'App',
  components: {
    buttonmap,
    mapleaflet,
    buttondemo,
    buttontable,
    buttonhightchart,
    sidecomp,
    headercomp,
    warring_table,
    radar_section,
    extra_single
  },
  data() {
    return {
      plot_data: undefined,
      plot_type: undefined,
      plot_colors: undefined,
      maps: undefined,
      mp3src: "http://127.0.0.1:9991/media/mp3/warring.mp3",
      mp3_play: false,
      warring_table_status: false,
      map_lines: undefined,
      wind_label: undefined,
      themes: {
        color: "white",
        windurl: "src/media/wind_white/",
        fontsize: 1.8
      },
      all_seetings: {
        datarange: 'auto',//数据显示的范围
        wind_suf_opt: "barb",//风场的渲染方式
        boundary_type: "current", //是否全省绘制
        map_class: "geo",// 地图类型
        data_type: "rain",// 数据绘制的类型
        data_times: "5min", //数据时次
        shpopt: true,
        rainopt: true,
        windopt: true,
        tempopt: true,
        viewopt: true,
        warring_rain_value: 0,
        warring_wind_value: 0,
        warring_temp_value: 0,
        warring_view_value: 0,
        real_flash_opt: 'silence',// 同步绘制开关
        warring_opt: 'silence',// 报警开关
        radar_opt: false,//雷达回波叠加的开关
        radar_sec: {
          plot_opt: false,
          p1: undefined,
          p2: undefined,
          line: undefined
        }
      },
      color_opt: {
        radar: {
          color_list: ['#AE0AF5', '#AD90F0', '#780084', '#FF00F0', '#C00000', '#D60000', '#FF9000', '#E7C000', '#FFFF00', '#019000', '#00C800'],
          level_list: [70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15]
        },
        rainmin: {
          color_list: ['#E431FF', '#D032E1', '#A632B4', '#A43237', '#C4343A', '#F13237', '#F2A932', '#F1D139', '#F1F837', '#46FA35', '#4EAB37', '#2983FF', '#29AAFF', '#29D3FD', '#A3FAFD'],
          level_list: [500, 350, 250, 200, 150, 100, 75, 50, 35, 25, 20, 15, 10, 5, 0]
        },
        rain12: {
          color_list: ['#E431FF', '#D032E1', '#A632B4', '#A43237', '#C4343A', '#F13237', '#F2A932', '#F1D139', '#F1F837', '#46FA35', '#4EAB37', '#2983FF', '#29AAFF', '#29D3FD', '#A3FAFD'],
          level_list: [110, 100, 90, 80, 70, 60, 50, 35, 25, 20, 15, 10, 5, 2, 0]
        },
        rain01: {
          color_list: ['#E431FF', '#D032E1', '#A632B4', '#A43237', '#C4343A', '#F13237', '#F2A932', '#F1D139', '#F1F837', '#46FA35', '#4EAB37', '#2983FF', '#29AAFF', '#29D3FD', '#A3FAFD'],
          level_list: [20, 17, 15, 13, 11, 10, 8, 7, 6, 5, 4, 3, 2, 1, 0]
        }
      },
      current_layer: [],
      current_points: [],
      current_labels: [],
      current_type: undefined,
      current_single_layer: undefined,
      current_staiton_layer: undefined
    }
  },
  created() {

  },
  methods: {
    main2siderfun() {
      // 向父组件传递参数
      let that = this
      var maindata = this.all_seetings
      if (that.all_seetings.boundary_type == "current") {
        var mapdata = that.maps.getBounds()
        var boundary = [mapdata['_southWest'].lat, mapdata['_northEast'].lat, mapdata['_southWest'].lng, mapdata['_northEast'].lng]
      }
      else {
        var boundary = [25, 35, 115, 125]
      }
      maindata.boundary = JSON.stringify(boundary)
      maindata.zoom = this.maps.getZoom()
      return maindata
    },
    headerEvent(value) {
      // 导航栏接收到的设置相关的参数
      // console.log("父组件接收的参数",value)
      // this.all_seetings.datarange = value.datarange
      // this.all_seetings.wind_suf_opt = value.wind_suf_opt
      // this.all_seetings.boundary_type = value.boundary_type
    },
    sideEvent(value) {
      // 侧边栏收到的参数 
      let that = this
      // 更具类型解析并判断如何调用方法


      if (value.send_type == "real_seeting") {
        //雷达剖面
        that.all_seetings.radar_opt = value.radar_opt
        that.all_seetings.radar_sec.plot_opt = value.plot_opt
        if (value.plot_opt) {
          that.radar_sec_on()
        }
        else {
          that.radar_sec_off()
        }
      }
    },
    flash_map() {
      let that = this
      // 更新地图
      that.plot_data = undefined
      that.plot_type = undefined
      that.plot_colors = undefined
      that.layer_points = []
      that.current_labels = []
      var docm = $('.leaflet-control-colotlabel')
      docm.remove()
      if (that.maps) {
        that.current_layer.forEach(function (item) {
          that.maps.removeLayer(item)
        })
        that.current_points.forEach(function (item) {
          item.remove()
        })
      }
    },
    add_colorbar(coloropt) {
      var docm = $('.leaflet-control-colotlabel')
      docm.remove()
      L.Control.Logo = L.Control.extend({
        options: {
          position: 'bottomright' //初始位置

        },
        initialize: function (options) {
          L.Util.extend(this.options, options);
        },
        onAdd: function (map) {
          //创建一个class为 leaflet-control-colotlabel的div
          this._container = L.DomUtil.create('div', 'leaflet-control-colotlabel');
          // 开始逻辑编写
          var insertDom = document.createElement('ul');
          let str = ``;
          var separatedColors = coloropt.color_list
          separatedColors.forEach(function (item, index) {
            str += `<li><i style="background: ${separatedColors[index]}"></i>${coloropt.level_list[index]}</li>`;
          })
          insertDom.innerHTML = str;
          this._container.appendChild(insertDom);
          return this._container;
        }
      });
      L.control.logo = function (options) {
        return new L.Control.Logo(options)
      };
      L.control.logo({ position: 'bottomright', data: "ok" }).addTo(this.maps);
    },
    add_single(item, zoom) {
      let that = this
      var layers = L.layerGroup();
      var latlng = L.latLng(item.lat, item.lon);
      if (zoom <= 9) {
        var circlerange = 18000
      }
      else if (zoom = 10) {
        var circlerange = 6000
      }
      else {
        var circlerange = 2000
      }
      var c = L.circleMarker([item.lat, item.lon], {
        weight: 0,
        radius: 0,
        opacity: 1,
        fill: false,
        color: "red",
        zIndex: 0,
        fillOpacity: 1,
        labelStyle: {
          text: item.Station_Name,
          collisionFlg: false,
          offsetY: 20,
          scale: 1.5,
          weight: 1,
          rotation: 0,
          fillStyle: "red",
          zIndex: 1000000
        }
      }).addTo(layers)
      that.maps.createPane('circlelop')
      that.maps.getPane('circlelop').style.zIndex = 500000
      var circle = new L.Circle([item.lat, item.lon], circlerange, {
        color: 'red', //颜色
        pane: 'circlelop',
        zIndex: 1000000,
        fill: false
      }).addTo(layers)
      if (that.current_single_layer) {
        that.current_single_layer.remove()
        layers.addTo(that.maps)
        that.current_single_layer = layers
      }
      else {
        layers.addTo(that.maps)
        that.current_single_layer = layers
      }
    },
    add_stations(data, dataType) {
      let that = this
      var layers = L.layerGroup();
      data.forEach(function (item) {
        if (dataType == "Station_Name") { var labels = item.Station_Name }
        else if (dataType == "Town") { var labels = item.Town }
        else if (dataType == "Station_Id_C") { var labels = item.Station_Id_C }
        else if (dataType == "Alti") { var labels = item.Alti }
        var c = L.circleMarker([item.Lat, item.Lon], {
          weight: 0,
          radius: 0,
          opacity: 1,
          fill: false,
          color: "red",
          zIndex: 0,
          fillOpacity: 1,
          labelStyle: {
            text: labels,
            collisionFlg: false,
            offsetY: 20,
            scale: 1.25,
            weight: 1,
            rotation: 0,
            fillStyle: "red",
            zIndex: 1000000
          }
        }).addTo(layers)
      })
      if (that.current_staiton_layer) {
        layers.addTo(that.maps)
        that.current_staiton_layer.remove()
        that.current_staiton_layer = layers
      }
      else {
        layers.addTo(that.maps)
        that.current_staiton_layer = layers
      }


    },
    plot_contour(contourf, coloropt) {
      // 绘制等值线
      let that = this
      var plotlayer = L.geoJSON(contourf, {
        style: function (feature) {
          return { color: feature.properties.stroke, weight: 0.5, fill: true, fillColor: feature.properties.stroke, fillOpacity: 0.7 };
        }
      })
      plotlayer.addTo(that.maps)
      // 绘制色bar
      that.add_colorbar(coloropt)
      that.current_layer.push(plotlayer)
    },
    plot_rain(data) {
      // 绘制文字标签
      function makecircleMarker(item, colors, tooltips) {
        if (item.PRE) {
          var text_item = item.PRE
        }
        else {
          var text_item = item.value
        }
        var latlng = L.latLng(item.Lat, item.Lon);

        var c = L.circleMarker(latlng, {
          stationname: item.Station_Name,
          stationnum: item.Station_Id_C,
          weight: 0,
          radius: 8,
          opacity: 0,
          fill: false,
          color: colors,
          fillColor: colors,
          fillOpacity: 1,
          zIndex: 1000,
          labelStyle: {
            text: text_item,
            collisionFlg: false,
            // offsetY: -25,
            scale: that.themes.fontsize,
            weight: 3,
            rotation: 0,
            fillStyle: colors,
            zIndex: 90
          }
        })
        // .bindTooltip(tooltips, {
        //   direction: "top",
        //   offset: L.point(0, -10)
        // }).openTooltip()  
        return c
      }
      let that = this
      var points_list = []

      // console.log("接受到的rain",data)
      data.forEach(function (item) {
        var tooltips = item.Station_Name + "-" + item.Station_Id_C + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
        that.current_labels.push(tooltips)
        if (that.all_seetings.data_times == "5min") {
          if (item.PRE > 0.1 && item.PRE <= 9999) {

            if (item.PRE > 0 && item.PRE <= 0.5) {
              // console.log("降水", item)
              var colors = "rgb(140,246,130)"
            }
            else if (item.PRE > 0.5 && item.PRE <= 1) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.PRE > 1 && item.PRE <= 2) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.PRE > 2 && item.PRE <= 3) {
              var colors = "rgb(14,104,246)"
            }
            else if (item.PRE > 3 && item.PRE <= 4) {
              var colors = "rgb(255,0,255)"
            }
            else if (item.PRE > 4 && item.PRE <= 5) {
              var colors = "rgb(255,0,255)"
            }
            else if (item.PRE > 5 && item.PRE <= 9999) {
              var colors = "red"
            }
            var c = makecircleMarker(item, colors, tooltips)
            points_list.push(c)
            that.current_points.push(c)
          }
        }
        else if (that.all_seetings.data_times == "now") {
          if (item.value > 0 && item.value < 9999) {

            if (item.value > 0 && item.value <= 1) {
              var colors = that.themes.color
            }
            else if (item.value > 1 && item.value <= 1.5) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.value > 1.5 && item.value <= 7) {
              var colors = "rgb(0,191,27)"
            }
            else if (item.value > 7 && item.value <= 15) {
              var colors = "rgb(62,185,255)"
            }
            else if (item.value > 15 && item.value <= 40) {
              var colors = "rgb(25,0,235)"
            }
            else if (item.value > 40 && item.value <= 50) {
              var colors = "rgb(255,0,255)"
            }
            else if (item.value > 50) {
              var colors = "rgb(140,0,65)"
            }
            var c = makecircleMarker(item, colors, tooltips)
            points_list.push(c)
            that.current_points.push(c)
          }
        }
        else if (that.all_seetings.data_times == "24hours") {
          if (item.value > 0 && item.value <= 9999) {

            if (item.value > 0 && item.value <= 1) {
              var colors = that.themes.color
            }
            else if (item.value > 1 && item.value <= 10) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.value > 10 && item.value <= 25) {
              var colors = "rgb(0,191,27)"
              var iflabel = false
            }
            else if (item.value > 25 && item.value <= 50) {
              var colors = "rgb(62,185,255)"
              var iflabel = false
            }
            else if (item.value > 50 && item.value <= 100) {
              var colors = "rgb(25,0,235)"
              var iflabel = false
            }
            else if (item.value > 100 && item.value <= 250) {
              var colors = "rgb(255,0,255)"
              var iflabel = false
            }
            else if (item.value > 250) {
              var colors = "rgb(140,0,65)"
              var iflabel = false
            }
            var c = makecircleMarker(item, colors, tooltips)
            points_list.push(c)
            that.current_points.push(c)

          }

        }
        else if (that.all_seetings.data_times == "12hours") {
          if (item.value > 0 && item.value <= 9999) {

            if (item.value > 0 && item.value <= 1) {
              var colors = that.themes.color
            }
            else if (item.value > 1 && item.value <= 5) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.value > 5 && item.value <= 15) {
              var colors = "rgb(0,191,27)"
            }
            else if (item.value > 15 && item.value <= 30) {
              var colors = "rgb(62,185,255)"
              var iflabel = false
            }
            else if (item.value > 30 && item.value <= 70) {
              var colors = "rgb(25,0,235)"
              var iflabel = false
            }
            else if (item.value > 70 && item.value <= 140) {
              var colors = "rgb(255,0,255)"
              var iflabel = false
            }
            else if (item.value > 140) {
              var colors = "rgb(140,0,65)"
              var iflabel = false
            }
            var c = makecircleMarker(item, colors, tooltips)
            points_list.push(c)
            that.current_points.push(c)

          }
        }
        else if (that.all_seetings.data_times == "6hours") {
          if (item.value > 0 && item.value <= 9999) {

            if (item.value > 0 && item.value <= 1) {
              var colors = that.themes.color
            }
            else if (item.value > 1 && item.value <= 4) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.value > 4 && item.value <= 13) {
              var colors = "rgb(0,191,27)"
            }
            else if (item.value > 13 && item.value <= 25) {
              var colors = "rgb(62,185,255)"
              var iflabel = false
            }
            else if (item.value > 25 && item.value <= 60) {
              var colors = "rgb(25,0,235)"
              var iflabel = false
            }
            else if (item.value > 60 && item.value <= 120) {
              var colors = "rgb(255,0,255)"
              var iflabel = false
            }
            else if (item.value > 120) {
              var colors = "rgb(140,0,65)"
              var iflabel = false
            }
            var c = makecircleMarker(item, colors, tooltips)
            points_list.push(c)
            that.current_points.push(c)
          }

        }
        else if (that.all_seetings.data_times == "3hours") {
          if (item.value > 0 && item.value <= 9999) {

            if (item.value > 0 && item.value <= 1) {
              var colors = that.themes.color
            }
            else if (item.value > 1 && item.value <= 3) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.value > 3 && item.value <= 10) {
              var colors = "rgb(0,191,27)"
              var iflabel = false
            }
            else if (item.value > 10 && item.value <= 20) {
              var colors = "rgb(62,185,255)"
              var iflabel = false
            }
            else if (item.value > 20 && item.value <= 50) {
              var colors = "rgb(25,0,235)"
              var iflabel = false
            }
            else if (item.value > 50 && item.value <= 70) {
              var colors = "rgb(255,0,255)"
              var iflabel = false
            }
            else if (item.value > 70) {
              var colors = "rgb(140,0,65)"
              var iflabel = false
            }
            var c = makecircleMarker(item, colors, tooltips)
            points_list.push(c)
            that.current_points.push(c)
          }
        }
        else {
          // 包含中长期
          if (item.value > 0 && item.value <= 9999) {

            if (item.value > 0 && item.value <= 1) {
              var colors = that.themes.color
            }
            else if (item.value > 1 && item.value <= 10) {
              var colors = "rgb(140,246,130)"
            }
            else if (item.value > 10 && item.value <= 25) {
              var colors = "rgb(0,191,27)"
            }
            else if (item.value > 25 && item.value <= 50) {
              var colors = "rgb(62,185,255)"
            }
            else if (item.value > 50 && item.value <= 100) {
              var colors = "rgb(62,185,255)"
            }
            else if (item.value > 100 && item.value <= 250) {
              var colors = "rgb(255,0,255)"
            }
            else if (item.value > 250) {
              var colors = "red"
            }
            var c = makecircleMarker(item, colors, tooltips)
            points_list.push(c)
            that.current_points.push(c)
          }
        }
      })
      return points_list

    },
    plot_wind(data) {
      // 绘制风场
      function wind_dir(dFy) {
        if (((dFy >= 0) && (dFy < 11.25)) || ((dFy > 348.75) && (dFy <= 360))) {
          var dfytest = "N"
        }
        else if ((dFy >= 11.25) && (dFy < 33.75)) {
          var dfytest = "NNW"
        }
        else if ((dFy >= 33.75) && (dFy < 56.25)) {
          var dfytest = "NW"
        }
        else if ((dFy >= 56.25) && (dFy < 78.75)) {
          var dfytest = "WNW"
        }
        else if ((dFy >= 78.75) && (dFy < 101.25)) {
          var dfytest = "W"
        }
        else if ((dFy >= 101.25) && (dFy < 123.75)) {
          var dfytest = "WSW"
        }
        else if ((dFy >= 123.75) && (dFy < 146.25)) {
          var dfytest = "SW"
        } // 
        else if ((dFy >= 146.25) && (dFy < 168.75)) {
          var dfytest = "SSW"
        }
        else if ((dFy >= 168.75) && (dFy < 191.25)) {
          var dfytest = "S"
        }
        else if ((dFy >= 191.25) && (dFy < 213.75)) {
          var dfytest = "SSE"
        }
        else if ((dFy >= 213.75) && (dFy < 236.25)) {
          var dfytest = "SE"
        }
        else if ((dFy >= 236.25) && (dFy < 258.75)) {
          var dfytest = "ESE"
        }
        else if ((dFy >= 258.75) && (dFy < 281.25)) {
          var dfytest = "E"
        }
        else if ((dFy >= 281.25) && (dFy < 303.75)) {
          var dfytest = "ENE"
        }
        else if ((dFy >= 303.75) && (dFy < 326.25)) {
          var dfytest = "NE"
        }
        else if ((dFy >= 326.25) && (dFy < 348.75)) {
          var dfytest = "NNE"
        }
        return dfytest
      }
      let that = this
      var points_list = []
      data.forEach(function (item) {

        if (that.all_seetings.wind_suf_opt == "barb") {
          if (((item.value > 0) && (item.value < 9999)) || ((item.WIN_S_Gust_Max > 0) && (item.WIN_S_Gust_Max < 9999))) {

            var tooltips = item.Station_Name + "-" + item.Station_Id_C + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
            that.current_labels.push(tooltips)
            if (((item.value > 0) && (item.value <= 4)) || ((item.WIN_S_Gust_Max > 0) && (item.WIN_S_Gust_Max <= 4))) {
              var iconurl = that.themes.windurl + "1.svg"
            }
            else if (((item.value > 4) && (item.value <= 8)) || ((item.WIN_S_Gust_Max > 4) && (item.WIN_S_Gust_Max <= 8))) {
              var iconurl = that.themes.windurl + "2.svg"
            }
            else if (((item.value > 8) && (item.value <= 10)) || ((item.WIN_S_Gust_Max > 8) && (item.WIN_S_Gust_Max <= 10))) {
              var iconurl = that.themes.windurl + "3.svg"
            }
            else if (((item.value > 10) && (item.value <= 12)) || ((item.WIN_S_Gust_Max > 10) && (item.WIN_S_Gust_Max <= 12))) {
              var iconurl = that.themes.windurl + "5.svg"
            }
            else if (((item.value > 12) && (item.value <= 14)) || ((item.WIN_S_Gust_Max > 12) && (item.WIN_S_Gust_Max <= 14))) {
              var iconurl = that.themes.windurl + "6.svg"
            }
            else if (((item.value > 14) && (item.value <= 16)) || ((item.WIN_S_Gust_Max > 14) && (item.WIN_S_Gust_Max <= 16))) {
              var iconurl = that.themes.windurl + "7.svg"
            }
            else if (((item.value > 16) && (item.value <= 17.2)) || ((item.WIN_S_Gust_Max > 16) && (item.WIN_S_Gust_Max <= 17.2))) {
              var iconurl = that.themes.windurl + "8.svg"
            }
            else if (((item.value > 17.2) && (item.value <= 19)) || ((item.WIN_S_Gust_Max > 17.2) && (item.WIN_S_Gust_Max <= 19))) {
              var iconurl = that.themes.windurl + "9.svg"
            }
            else {
              var iconurl = that.themes.windurl + "10.svg"
            }
            // 常规方法
            // var latlng = L.latLng(item.Lat, item.Lon);
            // var icon = L.icon({
            //   iconUrl: iconurl,
            //   iconSize: [70, 50],
            //   rotate: item.WIN_D_Gust_Max,
            //   rotationAngle: item.WIN_D_Gust_Max,
            //   stationnum: item.Station_Id_C,
            //   stationname: item.Station_Name,
            //   iconAnchor: [35, 35]
            // });
            // var marker = L.marker(latlng, {
            //   icon: icon,
            //   rotate: item.WIN_D_Gust_Max,
            //   rotationAngle: item.WIN_D_Gust_Max,
            //   zIndex: 5000000
            // })
            // .bindTooltip(tooltips, {
            //   direction: "top",
            //   offset: L.point(0, -10)
            // })
            // .openTooltip();
            // marker.setRotationAngle(item.WIN_D_Gust_Max);
            // points_list.push(marker)
            //换个策略
            var datobj = {
              lat: item.Lat,
              lon: item.Lon,
              iconopt: {
                iconUrl: iconurl,
                iconSize: [70, 50],
                rotate: item.WIN_D_Gust_Max,
                rotationAngle: item.WIN_D_Gust_Max,
                stationnum: item.Station_Id_C,
                stationname: item.Station_Name,
                iconAnchor: [35, 35]
              },
              markopt: {
                icon: undefined,
                tooltips: tooltips,
                rotate: item.WIN_D_Gust_Max,
                rotationAngle: item.WIN_D_Gust_Max,
                zIndex: 5000000
              },
              tooltips: tooltips,
              tipsopt: {
                direction: "top",
                offset: L.point(0, -10)
              }

            }
            points_list.push(datobj)

          }
        }
        else {
          if (((item.value > 0) && (item.value < 9999)) || ((item.WIN_S_Gust_Max > 0) && (item.WIN_S_Gust_Max < 9999))) {

            var wind_dir_text = wind_dir(item.WIN_D_Gust_Max)
            var tooltips = item.Station_Name + "-" + item.Station_Id_C + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
            that.current_labels.push(tooltips)
            if (((item.value >= 0) && (item.value <= 5.4)) || ((item.WIN_D_Gust_Max >= 0) && (item.WIN_D_Gust_Max <= 5.4))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "white"
            }
            else if (((item.value > 5.4) && (item.value <= 7.9)) || ((item.WIN_D_Gust_Max > 5.4) && (item.WIN_D_Gust_Max <= 7.9))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "white"
            }
            else if (((item.value > 7.9) && (item.value <= 10.7)) || ((item.WIN_D_Gust_Max > 7.9) && (item.WIN_D_Gust_Max <= 10.7))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "white"
            }
            else if (((item.value > 10.7) && (item.value <= 13.8)) || ((item.WIN_D_Gust_Max > 10.7) && (item.WIN_D_Gust_Max <= 13.8))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "#F3EBAB"
            }
            else if (((item.value > 13.8) && (item.value <= 17.1)) || ((item.WIN_D_Gust_Max > 13.8) && (item.WIN_D_Gust_Max <= 17.1))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "#ABC1F3"
              var iflabel = false

            }
            else if (((item.value > 17.1) && (item.value <= 20.7)) || ((item.WIN_D_Gust_Max > 17.1) && (item.WIN_D_Gust_Max <= 20.7))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "#F3ABF1"
              var iflabel = false
            }
            else if (((item.value > 20.7) && (item.value <= 24.4)) || ((item.WIN_D_Gust_Max > 20.7) && (item.WIN_D_Gust_Max <= 24.4))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "red"
              var iflabel = false
            }
            else if (((item.value > 24.4) && (item.value <= 28.4)) || ((item.WIN_D_Gust_Max > 24.4) && (item.WIN_D_Gust_Max <= 28.4))) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "red"
              var iflabel = false
            }
            else if ((item.value > 28.4) || (item.WIN_D_Gust_Max > 28.4)) {
              var texts = wind_dir_text + "/" + (item.WIN_S_Gust_Max).toString()
              var colors = "red"
              var iflabel = false
            }
            var latlng = L.latLng(item.Lat, item.Lon);
            // 添加散点插件
            var c = L.circleMarker(latlng, {
              stationname: item.Station_Name,
              stationnum: item.Station_Id_C,
              weight: 0,
              radius: 7,
              opacity: 1,
              fill: false,
              color: colors,
              fillColor: colors,
              fillOpacity: 1,
              labelStyle: {
                text: texts,
                collisionFlg: iflabel,
                fillStyle: colors,
                scale: that.themes.fontsize,
                weight: 3,
                rotation: 0,
                color: "red",
                zIndex: 60
              }
            })
            // .bindTooltip(tooltips, {
            //   direction: "top",
            //   offset: L.point(0, -10)
            // }).openTooltip();
            points_list.push(c)
            that.current_points.push(c)
          }
        }

      })
      return points_list
    },
    plot_temp(data) {
      let that = this
      var points_list = []

      data.forEach(function (item) {
        if ((item.value != -9999) || (item.TEM != -9999)) {
          var tooltips = item.Station_Name + "-" + item.Station_Id_C + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
          that.current_labels.push(tooltips)
          if ((item.value > 35) || (item.TEM > 35)) {
            var colors = "red"
            var iflabel = false
          }
          else if ((item.value < 3) || (item.TEM < 3)) {
            var colors = "blue"
            var iflabel = false
          }
          else {
            var colors = "white"
          }
          var latlng = L.latLng(item.Lat, item.Lon);
          var c = L.circleMarker(latlng, {
            stationname: item.Station_Name,
            stationnum: item.Station_Id_C,
            weight: 0,
            radius: 7,
            opacity: 1,
            fill: false,
            fillOpacity: 1,
            labelStyle: {
              text: item.value,
              collisionFlg: iflabel,
              fillStyle: colors,
              scale: that.themes.fontsize,
              weight: 5,
              rotation: 0,
              zIndex: 60
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          // map_toolbox_object.current_marker_list.push(marker)
          points_list.push(c)
          that.current_points.push(c)
        }

      })
      return points_list
    },
    plot_view(data) {
      let that = this
      var points_list = []

      data.forEach(function (item) {
        if (((item.value >= 0) && (item.value <= 30000)) || ((item.VIS_HOR_10MI >= 0) && (item.VIS_HOR_10MI <= 30000))) {
          var tooltips = item.Station_Name + "-" + item.Station_Id_C + "<br>" + "    纬度:" + item.Lat.toFixed(2).toString() + "  " + "经度:" + item.Lon.toFixed(2).toString() + "<br>" + "    " + item.City + "-" + item.Cnty + "-" + item.Town
          that.current_labels.push(tooltips)
          if (((item.value > 500) && (item.value <= 1000)) || ((item.VIS_HOR_10MI > 500) && (item.VIS_HOR_10MI <= 1000))) {
            var colors = "blue"
          }
          else if (((item.value > 200) && (item.value <= 500)) || ((item.VIS_HOR_10MI > 200) && (item.VIS_HOR_10MI <= 500))) {
            var colors = "#F8E811"
            var iflabel = false
          }
          else if (((item.value > 50) && (item.value <= 200)) || ((item.VIS_HOR_10MI > 50) && (item.VIS_HOR_10MI <= 200))) {
            var colors = "#F88109"
            var iflabel = false
          }
          else if ((item.value <= 50) || (item.VIS_HOR_10MI <= 50)) {
            var colors = "red"
            var iflabel = false
          }
          else {
            var colors = "white"
          }
          var latlng = L.latLng(item.Lat, item.Lon);
          var c = L.circleMarker(latlng, {
            stationname: item.Station_Name,
            stationnum: item.Station_Id_C,
            weight: 0,
            radius: 7,
            opacity: 1,
            fill: false,
            zIndex: 500,
            fillOpacity: 1,
            labelStyle: {
              text: item.value,
              collisionFlg: iflabel,
              scale: that.themes.fontsize, // 字体大小
              fillStyle: colors,  // 颜色
              weight: 2000,
              rotation: 0,
              zIndex: 200
            }
          })
          // .bindTooltip(tooltips, {
          //   direction: "top",
          //   offset: L.point(0, -10)
          // }).openTooltip();
          points_list.push(c)
          that.current_points.push(c)
        }
      })
      return points_list
    },
    point_event(points, model) {
      // 绘制单点数据
      let that = this
      points.forEach(function (item, index) {
        // console.log("测试",toRaw(item),toRaw(that.maps))
        item.bindTooltip(that.current_labels[index], {
          direction: "top",
          // zIndex: 2000,
          offset: L.point(0, -10)
        }).openTooltip()
        item.addTo(toRaw(that.maps)).on("click", function (e) {
          var station_id = undefined
          var plot_type = that.current_type
          var plot_num = e.sourceTarget.options.stationnum
          var plot_name = e.sourceTarget.options.stationname
          var labels = plot_name + ":" + plot_num
          that.$refs.extra_single_main.open_single(plot_type, plot_num, model)
        })
      })
    },
    mark_event(marks, model) {
      // 绘制图标型数据
      let that = this
      var ciLayer = L.canvasMarkerLayer({
        collisionFlg: false
      }).addTo(that.maps)
      // ciLayer.addLayers(marks)
      // that.current_layer.push(ciLayer)
      var wind_list = []
      marks.forEach(function (item) {
        var latlng = L.latLng(item.Lat, item.Lon);
        var icon = L.icon(item.iconopt);
        var markopt = item.markopt
        markopt.icon = icon
        var latlng = L.latLng(item.lat, item.lon)
        var marker = L.marker(latlng, markopt)
        // .bindTooltip(item.tooltips, {
        //   direction: "top",
        //   offset: L.point(0, -10)
        // }).openTooltip();
        marker.setRotationAngle(item.iconopt.rotationAngle);
        wind_list.push(marker)
      })
      ciLayer.addLayers(wind_list)
      that.current_layer.push(ciLayer)
      ciLayer.addOnClickListener(function (e, data) {
        var station_id = undefined
        var plot_type = that.current_type
        var plot_num = data[0].data.options.icon.options.stationnum
        var plot_name = data[0].data.options.icon.options.stationname
        var labels = plot_name + ":" + plot_num
        that.$refs.extra_single_main.open_single(plot_type, plot_num)
        // console.log("标记mark", e, data)
      })
      ciLayer.addOnHoverListener(function (e, data) {
        if (that.wind_label) {
          toRaw(that.wind_label).remove()
        }
        var latlng = L.latLng(data[0].data._latlng.lat, data[0].data._latlng.lng);
        var c = L.circleMarker(latlng, {
          weight: 0,
          radius: 20,
          opacity: 0,
          fill: false,
          zIndex: 1,
          fillOpacity: 1
        }).addTo(toRaw(that.maps))
          .bindTooltip(data[0].data.options.tooltips, {
            direction: "top",
            offset: L.point(0, -10)
          }).openTooltip()
        that.wind_label = toRaw(c)
      });
    },
    update_user_data(data) {
      let that = this
      var usershp = JSON.parse(localStorage.getItem("userShp"))
      var warringshp = JSON.parse(localStorage.getItem("warringShp"))
      var bbox = turf.bbox(warringshp);
      var warringList = []
      if (localStorage.getItem("userName") != "none") {
        var bbox = turf.bbox(warringshp);
      }
      else {
        var bbox = turf.bbox(taizhoulocal);
      }
      data.forEach(function (item) {
        // 判断区域
        if ((item.Lat > bbox[1]) && (item.Lat < bbox[3]) && (item.Lon > bbox[0]) && (item.Lon < bbox[2])) {
          // 判断预警等级
          if ((item.PRE > that.all_seetings.warring_rain_value) || (item.WIN_S_Gust_Max > that.all_seetings.warring_wind_value)) {

            if ((item.WIN_S_Gust_Max != undefined) && (that.all_seetings.windopt)) {
              var single = {
                'City': item.City,
                'Station_Id_C': item.Station_Id_C,
                'Station_Name': item.Station_Name,
                'type': "阵风",
                'value': item.WIN_S_Gust_Max.toString()
              }
            }
            else if ((item.PRE != undefined) && (that.all_seetings.rainopt)) {
              var single = {
                'City': item.City,
                'Station_Id_C': item.Station_Id_C,
                'Station_Name': item.Station_Name,
                'type': "降水",
                'value': item.PRE.toString()
              }
            }
            warringList.push(single)
          }
        }
      })
      return warringList
    },
    fclick(e) {
      let that = this
      that.all_seetings.radar_sec.p1 = e.latlng;//确定起点
      that.maps.off('click', that.sclick);//关闭slick：第二次鼠标点击事件触发函数
      that.maps.on('mousemove', that.mmove); //开始监听鼠标移动事件
    },
    sclick(e) {
      let that = this
      that.maps.off('mousemove', that.mmove); //关闭鼠标移动监听事件
      that.maps.off('click', that.sclick); //关闭第二次点击事件监听
      that.maps.on("click", that.fclick); //再次开始第一次点击事件监听，准备下次画线
      var start = that.all_seetings.radar_sec.p1.lng.toString() + "," + that.all_seetings.radar_sec.p1.lat.toString()
      var end = that.all_seetings.radar_sec.p2.lng.toString() + "," + that.all_seetings.radar_sec.p2.lat.toString()
      that.$refs.radar_section.changeVisible(start, end)
    },
    convert(lon, lat) {
      x = lon * 20037508.34 / 180
      y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)
      y = y * 20037508.34 / 180
      return [x, y]
    },
    mmove(e) {
      let that = this
      if (that.all_seetings.radar_sec.line) {
        if (that.maps.hasLayer(that.all_seetings.radar_sec.line)) {//判断之前是否有画线
          that.maps.removeLayer(that.all_seetings.radar_sec.line);	//清除所有线段
        }
      }
      that.all_seetings.radar_sec.p2 = e.latlng;//确定线段终点
      that.all_seetings.radar_sec.line = new L.polyline([that.all_seetings.radar_sec.p1, that.all_seetings.radar_sec.p2], {//画线
        color: 'red'//线段颜色
      }).addTo(that.maps);
      that.maps.off('click', that.fclick); //关闭第一次点击事件监听
      that.maps.on('click', that.sclick); //开始第二次点击事件监听
    },
    radar_sec_on() {
      let that = this
      that.maps.on('click', that.fclick)
      //开始ajax向后端要数据
    },
    radar_sec_off() {
      let that = this
      that.maps.off('click', that.fclick);
      that.maps.off('click', that.sclick);
      that.maps.off('mousemove', that.mmove);
      if (that.all_seetings.radar_sec.line) {
        if (that.maps.hasLayer(that.all_seetings.radar_sec.line)) { //清除当前折线
          that.maps.removeLayer(that.all_seetings.radar_sec.line);
        }
      }
    },
    // 以下是地图的图层
    layer_city_name() {
      let that = this
      var layers = L.layerGroup();
      var city_name = []
      zhejianglist[0].features.forEach(function (item) {
        var latlng = L.latLng(item.properties.center[1], item.properties.center[0]);
        var c = L.circleMarker(latlng, {
          weight: 0,
          radius: 1,
          opacity: 0,
          fill: false,
          zIndex: 2,
          fillOpacity: 1,
          labelStyle: {
            text: item.properties.name,
            collisionFlg: false,
            // offsetY: -25,
            scale: 1.5,
            weight: 1,
            rotation: 0,
            fillStyle: "white",
            zIndex: 1
          }
        }).addTo(layers)
      })
      return layers
    },
    layer_cnty_shp() {
      let that = this
      var layers = L.layerGroup();
      var lines = L.geoJSON(zhejiangcnty, {
        style: function (feature) {
          return { color: 'black', fill: false, weight: 1.5, fillOpacity: 0.1 };
        }
      }).addTo(layers)

      return layers
    },
    layer_cnty_name() {
      let that = this
      var layers = L.layerGroup();
      zhejiangcnty.features.forEach(function (item) {
        var latlng = L.latLng(item.properties.center[1], item.properties.center[0]);
        var c = L.circleMarker(latlng, {
          weight: 0,
          radius: 1,
          opacity: 0,
          fill: false,
          zIndex: 2,
          fillOpacity: 1,
          labelStyle: {
            text: item.properties.name,
            collisionFlg: false,
            // offsetY: -25,
            scale: 1.25,
            weight: 1,
            rotation: 0,
            fillStyle: "white",
            zIndex: 1
          }
        }).addTo(layers)

      })
      return layers


    },
    layer_town_name() {
      let that = this
      var layers = L.layerGroup();
      zhejiangtownname.forEach(function (item) {
        var latlng = L.latLng(item.lat, item.lon);
        var c = L.circleMarker(latlng, {
          weight: 0,
          radius: 1,
          opacity: 0,
          fill: false,
          zIndex: 2,
          fillOpacity: 1,
          labelStyle: {
            text: item.name,
            collisionFlg: false,
            // offsetY: -25,
            scale: 0.95,
            weight: 1,
            rotation: 0,
            fillStyle: "white",
            zIndex: 1
          }
        }).addTo(layers)

      })
      return layers

    }
  },
  mounted() {
    let that = this
    var lines = L.geoJSON(zhejianglist, {
      style: function (feature) {
        return { color: 'black', fill: false, weight: 3, fillOpacity: 0.1 };
      }
    })
    // var corner1 = L.latLng(10, 100),
    // corner2 = L.latLng(35, 145),
    // bound = L.latLngBounds(corner1, corner2);
    var corner1 = L.latLng(26, 115),
      corner2 = L.latLng(34, 125),
      bound = L.latLngBounds(corner1, corner2);
    var canvasLabel = new L.CanvasLabel({
      defaultLabelStyle: {
        collisionFlg: true,
        scale: 1,
        // strokeStyle: "#000",
        fillStyle: "white",
        lineWidth: 3
      }
    });

    L.TileLayer.Custom = L.TileLayer.extend({
      getTileUrl: function (coords) {
        var url = 'src/maps/map_geo/' + coords.z + '/' + coords.x + '/' + coords.y + '.jpg';
        return url;
      }
    })
    L.tileLayer.Custom = function () { return new L.TileLayer.Custom(); }
    var layer_geo = L.tileLayer.Custom()
    L.TileLayer.Custom = L.TileLayer.extend({
      getTileUrl: function (coords) {
        var url = 'src/maps/map_street/' + coords.z + '/' + coords.x + '/' + coords.y + '.png';
        return url;
      }
    })
    L.tileLayer.Custom = function () { return new L.TileLayer.Custom(); }
    var layer_street = L.tileLayer.Custom()
    var map = L.map("mapmain", {
      center: new L.LatLng(28.6, 120.9),//110.763, 41.376   39.62353145, 121.9937485
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
      layers: []
    });
    // layer_geo.addTo(map)
    var linecolor = L.geoJSON(zhejianglist, {
      style: function (feature) {
        return { color: feature.properties.color, fill: true, weight: 0, fillOpacity: 1 };
      }
    })
    // 地形图层
    var geogroup = L.layerGroup();
    layer_geo.addTo(geogroup)
    lines.addTo(geogroup)
    // 街道图层
    var streetgroup = L.layerGroup();
    layer_street.addTo(streetgroup)
    lines.addTo(streetgroup)

    // 纯净图层
    var cleangroup = L.layerGroup();
    linecolor.addTo(cleangroup)
    lines.addTo(cleangroup)
    var baseLayers = {
      '地形版': geogroup.addTo(map),
      '街道版': streetgroup,
      "纯净版": cleangroup
    };
    // -------额外图层-----
    var cnty_shp = that.layer_cnty_shp()
    var city_name = that.layer_city_name()
    var cnty_name = that.layer_cnty_name()
    var town_name = that.layer_town_name()


    var overlays = {
      '市县界线': cnty_shp,
      '地市名称': city_name,
      '市县名称': cnty_name,
      '乡镇名称': town_name,
    };
    // 最后整合
    var layerControl = L.control.layers(baseLayers, overlays)
    layerControl.options.position = "topleft"
    layerControl.addTo(map);
    this.maps = map
    map.on("baselayerchange", function (e) {
      // 监听
      switch (e.name) {
        case "地形版":
          // console.log("1", e.name);
          that.themes.windurl = "src/media/wind_white/"
          break;
        case "街道版":
          // console.log("2", e.name);
          that.themes.windurl = "src/media/wind_black/"
          break;
        case "纯净版":
          // console.log("3", e.name);
          that.themes.windurl = "src/media/wind_black/"
          break;
      }
    })

    // map.on("overlayadd", function (e) {
    //   // 监听
    //   console.log(e)
    //   if (e.name=="显示站名"){
    //     if(that.layer_points.length>0){
    //       console.log("ok")
    //     }

    //   }
    // })

    // 循环监听
    window.setInterval(function () {
      if (that.mp3_play) {
        that.$refs['audio'].play();
      }
      else {
        try {
          that.$refs['audio'].pause();
        }
        catch {
          // 处理异常吗  
        }
      }
    }, 100)
  }
}
</script>
<style>
.header {
  height: 5%;
  width: 2500px;
  display: flex;
  background-color: rgb(57, 61, 73);
}

.side {
  height: 95%;
  width: 15%;
  display: inline-block;
  /* flex-wrap:nowrap; */
  padding: 0;
  margin: 0;
  background-color: rgb(40, 43, 51);
}

.mainmap {
  height: 95%;
  width: 85%;
  /* display: inline-flex; */
  float: right;
  padding: 0;
  margin: 0;
  background-color: white;
}

.leaflet-control-colotlabel ul li {
  padding: 0;
  margin: 0;
  list-style: square;
  display: flex;
  align-items: center;
  color: #fff !important;
  /* margin-bottom: 5px; */
}

.leaflet-control-colotlabel ul li i {
  display: inline-block;
  width: 20px;
  height: 20px;
  color: #fff;
  /* border-radius: 50%; */
  margin-right: 5px;
}
</style>