<template>
  <div style="display: inline-flex;overflow-x: hidden;;width: 60px;">
    <!-- 地图 -->
    <lay-layer v-model="visible" :shade="false" :area="['800px', '880px']" :resize="true" :title=title
      :titleStyle="titleStyle">
      <div id="extra_plot_map" ref="extra_plot_map">
      </div>
      <lay-field title="快报" style="overflow-y: scroll;">{{ text }}</lay-field>
    </lay-layer>
  </div>
  <lay-layer v-model="visible_confirm" :shade="false" :area="['400px', '200px']" :btn="action" title="选择范围">
    <lay-form :model="model">
      <lay-form-item label="选项" style="padding-top: 25px;" mode="inline">
        <lay-cascader v-model="model.cascader_value" :options="model.cascader_real_opt"
          style="width: 100%;"></lay-cascader>
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
  name: "extra_plot",
  data() {
    return {
      title: "绘图",
      visible_confirm: false,
      visible: false,
      maps: undefined,
      contour: undefined,
      text: "",
      model: {
        cascader_value: "rain/now",
        cascader_real_opt: [
          {
            value: "rain",
            label: "风雨快报",
            children: [
              {
                value: "now",
                label: "实时",
              },
              {
                value: "1hours",
                label: "1小时",
              },
              {
                value: "3hours",
                label: "3小时",
              },
              {
                value: "6hours",
                label: "6小时",
              },
              {
                value: "12hours",
                label: "12小时",
              },
              {
                value: "24hours",
                label: "24小时",
              },
            ],
          },
          {
            value: "province",
            label: "全省通报",
            children: [
              {
                value: "now",
                label: "实时",
              },
              {
                value: "1hours",
                label: "1小时",
              },
              {
                value: "3hours",
                label: "3小时",
              },
              {
                value: "6hours",
                label: "6小时",
              },
              {
                value: "12hours",
                label: "12小时",
              },
              {
                value: "24hours",
                label: "24小时",
              },
            ],
          }

        ]
      },
      titleStyle: {
        "color": "white",
        "border": "none",
        "font-size": "15px",
        "text-align": "center",
        "background-color": "blue"
      },
      action: [
        {
          text: "确认",
          callback: () => {
            let that = this
            var value_index = this.model.cascader_value.slice(0, 4)
            if (value_index == "rain") {
              var tables_name = this.model.cascader_value.slice(5, this.model.cascader_value.length)
              var value_index = "rain"
            }
            else {
              var tables_name = this.model.cascader_value.slice(9, this.model.cascader_value.length)
              var value_index = "province"
            }
            // 开始绘图
            this.visible = true
            this.visible_confirm = false
            that.$nextTick(() => {
              this.get_data(value_index, tables_name)
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
    activate_extra_plot_opt() {
      let that = this
      that.visible_confirm = true
    },
    get_data(value_index, tables_name) {
      let that = this
      var today = new Date()
      var y = today.getFullYear();
      var m = today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
      var d = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
      var h = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
      var min = today.getMinutes() < 10 ? "0" + today.getMinutes() + ":00" : today.getMinutes() + ":00"
      var today_str = y + "-" + m + "-" + d + " " + h + ":" + min;
      var values_times = {
        "24hours": "近24小时",
        "12hours": "近12小时",
        "6hours": "近6小时",
        "3hours": "近3小时",
        "2hours": "近2小时",
        "1hours": "近1小时",
        "45mins": "近45分钟",
        "30mins": "近30分钟",
        "now": "近十分钟"
      }
      var values_times_int = {
        "24hours": 24,
        "12hours": 12,
        "6hours": 6,
        "3hours": 3,
        "2hours": 2,
        "1hours": 1,
        "45mins": 0.45,
        "30mins": 0.3,
        "now": 0.1
      }
      var values_class = {
        "rain": "累积降水",
        "wind": " 最大风力",
        "sped": " 最大风力",
        "tmax": " 最高气温",
        "tmin": " 最低气温",
      }
      var label = today_str + " " + values_times[tables_name] + "风雨快报"
      that.title = label
      // 
      if (localStorage.getItem("name")) {
        var city_code = localStorage.getItem("name")
      }
      else {
        var city_code = "331000"
      }
      if (value_index == "rain") {
        var send_data = "none"
      }
      else {
        var send_data = value_index
      }
      var ajaxdata = {
        'model': 'plot_image',
        'click_type': value_index,
        'button_value': city_code,// 城市
        'time_hours': values_times_int[tables_name],
        'current_data': send_data,
        'js_status': "False"
      }
      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: ajaxdata,
        dataType: "json",
        success: function (recvdate) {
          var contourf = JSON.parse(recvdate.contour)
          var marker = JSON.parse(recvdate.mark)
          var text = recvdate.text
          that.text = text
          var reallayer = L.geoJSON(contourf, {
            style: function (feature) {
              return { color: feature.properties.stroke, weight: 1, fill: true, fillColor: feature.properties.stroke, fillOpacity: 1 };
            }
          })
          that.initmap(reallayer, marker, value_index,tables_name)
        }
      })
    },
    plot_mark(plot_data, map) {
      plot_data.forEach(function (item) {
        if ((item.value > 0) && (item.value < 100)) {
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
            speed: (item.value * 2.5)
          });
          var marker = L.marker([item.Lat, item.Lon], {
            icon: icon,
            name: item.Station_Id_C,
            stationname: item.Station_Name,
            stationnum: item.Station_Id_C,
            deg: item.WIN_D_Gust_Max,
            sped: item.value * 2.5,
            station: item.Station_Name
          })
          marker.addTo(map)
        }
      })


    },
    add_colorbar(tables_name, map) {
      var values_times_int = {
        "24hours": 24,
        "12hours": 12,
        "6hours": 6,
        "3hours": 3,
        "2hours": 2,
        "1hours": 1,
        "45mins": 0.45,
        "30mins": 0.3,
        "now": 0.1
      }
      var hours = values_times_int[tables_name]
      if (hours > 24) {
        var rain_list = [0, 5, 10, 15, 20, 25, 35, 50, 75, 100, 150, 200, 250, 350, 500].reverse()
      }
      else if (hours >= 1) {
        var rain_list = [0, 2, 5, 10, 15, 20, 25, 35, 50, 60, 70, 80, 90, 100, 110].reverse()
      }
      else {
        var rain_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 15, 17, 20].reverse()
      }
      var docm = $('.leaflet-control-extra-plot')
      docm.remove()
      L.Control.Logo = L.Control.extend({
        options: {
          position: 'bottomright' //初始位置

        },
        initialize: function (options) {
          L.Util.extend(this.options, options);
        },
        onAdd: function (map) {
          //创建一个class为 leaflet-control-extra-plot的div
          this._container = L.DomUtil.create('div', 'leaflet-control-extra-plot');
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
      L.control.logo({ position: 'bottomright', data: "ok" }).addTo(map);

    },
    initmap(reallayer, marker, value_index,tables_name) {
      let that = this
      var canvasLabel = new L.CanvasLabel({
        defaultLabelStyle: {
          collisionFlg: true,
          scale: 1,
          strokeStyle: "#000",
          fillStyle: "black",
          lineWidth: 3
        }
      });
      const map = L.map(that.$refs.extra_plot_map, {
        center: new L.LatLng(28.7, 121.15),
        renderer: canvasLabel,
        zoom: 9, //4
        maxZoom: 12,
        minZoom: 6,
        // zoomDelta: 0.25,
        zoomSnap: 0.01,
        zoomControl: false,
        doubleClickZoom: false,
        attributionControl: false
      })
      reallayer.addTo(map)
      that.plot_mark(marker, map)
      if (value_index == "rain") {
        var shplayer = JSON.parse(localStorage.getItem('userShp'))
        if (shplayer) {
          L.mask(shplayer, {
            fitBounds: false,
            restrictBounds: false,
            color: "black",
            fillColor: "white",// 边框颜色
            fillOpacity: 1,
          }).addTo(map);
        }
        else {
          L.mask(taizhoulocal, {
            fitBounds: false,
            restrictBounds: false,
            color: "black",
            fillColor: "white",// 边框颜色
            fillOpacity: 1,
          }).addTo(map);
        }

      }
      else {
        L.mask(zhejianglist, {
          // fitBounds:true,
          fitBounds: false,
          restrictBounds: false,
          color: "black",
          fillColor: "white",// 边框颜色
          fillOpacity: 1,
        }).addTo(map)

      }
      that.add_colorbar(tables_name, map) 
    }
  },
  mounted() {
    //  this.initmap()
  }
}

</script>

<style scoped>
#extra_plot_map {
  height: 670px;
  width: 800px;
  background-color: white;
}

.leaflet-control-extra-plot ul li{
  padding: 0;
  margin: 0;
  list-style: square;
  display: flex;
  align-items: center;
  color: black !important;
  /* margin-bottom: 5px; */
}

.leaflet-control-extra-plot ul li i{
  display: inline-block;
  width: 20px;
  height: 20px;
  color: black;
  /* border-radius: 50%; */
  margin-right: 15px;
}
</style>