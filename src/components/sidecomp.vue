<template>
  <div class="sidecomp-div-main">
    <div style="width: 100%;height: 100%;;overflow-y: scroll;" class="scrollbar">
      <!-- 实况监测 -->
      <div class="side-title-main">
        实况监测
      </div>
      <div style="width: 100%;height: 134px;" @click="warring_div">
        <!-- 实况监测内容 -->
        <lay-form :model="model_side" style="padding-top: 10px;color:white;">
          <lay-form-item label="实况同步">
            <lay-radio v-model="model_side.real_flash_opt" value="update" @change="real_change">同步</lay-radio>
            <lay-radio v-model="model_side.real_flash_opt" value="silence" @change="real_change">隐藏</lay-radio>
          </lay-form-item>
          <lay-form-item label="短临报警">
            <lay-radio v-model="model_side.warring_opt" value="warring" label="警报" @change="warring_change"></lay-radio>
            <lay-radio v-model="model_side.warring_opt" value="silence" label="静音" @change="warring_change"></lay-radio>
          </lay-form-item>
          <lay-layer v-model="visible_warring" :shade="true" :area="['450px', '650px']" :btn="action_warring"
            :title=title_warring>
            <div style="padding: 30px 15px;">
              <lay-panel style="width: 90%;height: 420px;">
                <lay-form-item label="数据" mode="inline" style="width: 100%;padding-top: 20px;">
                  <div style="display: inline-flex;;width: 100%;">
                    <lay-select v-model="model_side.datarange">
                      <lay-select-option value="10min" label="实时"></lay-select-option>
                      <lay-select-option value="rain1" label="1小时"></lay-select-option>
                      <lay-select-option value="rain3" label="3小时"></lay-select-option>
                      <lay-select-option value="rain6" label="6小时"></lay-select-option>
                      <lay-select-option value="rain12" label="12小时"></lay-select-option>
                      <lay-select-option value="rain24" label="24小时"></lay-select-option>
                    </lay-select>
                    <lay-checkbox v-model="model_side.dataopt">边界</lay-checkbox>
                  </div>
                </lay-form-item>
                <lay-form-item label="降水" mode="inline" style="width: 100%;padding-top: 20px;">
                  <div style="display: inline-flex;;width: 100%;">
                    <lay-select v-model="model_side.rainrange">
                      <lay-select-option value="3" label="3毫米"></lay-select-option>
                      <lay-select-option value="10" label="10毫米"></lay-select-option>
                      <lay-select-option value="30" label="30毫米"></lay-select-option>
                      <lay-select-option value="40" label="40毫米"></lay-select-option>
                      <lay-select-option value="50" label="50毫米"></lay-select-option>
                      <lay-select-option value="70" label="70毫米"></lay-select-option>
                      <lay-select-option value="90" label="90毫米"></lay-select-option>
                    </lay-select>
                    <lay-checkbox v-model="model_side.rainopt">开启</lay-checkbox>
                  </div>
                </lay-form-item>
                <lay-form-item label="风力" mode="inline" style="width:100%;">
                  <div style="display: inline-flex;;width: 100%;">
                    <lay-select v-model="model_side.windrange">
                      <lay-select-option value="17.3" label="8级"></lay-select-option>
                      <lay-select-option value="20.9" label="9级"></lay-select-option>
                      <lay-select-option value="22.3" label="10级"></lay-select-option>
                      <lay-select-option value="25" label="12级以上"></lay-select-option>
                    </lay-select>
                    <lay-checkbox v-model="model_side.windopt">开启</lay-checkbox>
                  </div>
                </lay-form-item>
                <lay-form-item label="浓雾" mode="inline" style="width: 100%;">
                  <div style="display: inline-flex;;width: 100%;">
                    <lay-select v-model="model_side.viewrange">
                      <lay-select-option value="1000" label="1000米"></lay-select-option>
                      <lay-select-option value="500" label="500米"></lay-select-option>
                      <lay-select-option value="200" label="200米"></lay-select-option>
                      <lay-select-option value="50" label="50米"></lay-select-option>
                    </lay-select>
                    <lay-checkbox v-model="model_side.viewopt">开启</lay-checkbox>
                  </div>
                </lay-form-item>
              </lay-panel>
            </div>
          </lay-layer>
        </lay-form>
      </div>
      <!-- *************************************************************** -->
      <!-- 实况统计 -->
      <div class="side-title-main">
        实况统计
      </div>
      <div style="width: 100%;height: 264px;color:white;">
        <!-- 实况统计内容 -->
        <lay-form :model="model_side" style="padding-top: 10px;color:white;">
          <lay-form-item label="数据类型" style="padding-top: 10px;color:white;">
            <lay-cascader v-model="model_side.cascader_value" :options="model_side.cascader_real_opt"
              style="width: 75%;"></lay-cascader>
          </lay-form-item>
          <lay-form-item label="叠加回波">
            <lay-radio v-model="model_side.radar_opt" value="plot" label="叠加" @change="radar_change"></lay-radio>
            <lay-radio v-model="model_side.radar_opt" value="none" label="隐藏" @change="radar_change"></lay-radio>
          </lay-form-item>
          <lay-form-item label="雷达剖面">
            <lay-radio v-model="model_side.radar_sec_opt" value="plot" label="绘制" @change="sec_change"></lay-radio>
            <lay-radio v-model="model_side.radar_sec_opt" value="none" label="隐藏" @change="sec_change"></lay-radio>
          </lay-form-item>

        </lay-form>
        <lay-button-container style="text-align: center;">

          <lay-button type="primary" class="side-button" @click="open_extra_plot_map">绘图</lay-button>
          <lay-button type="primary" class="side-button" @click="open_extra_text_map">快报</lay-button>
          <lay-button type="primary" class="side-button" @click="open_single_station">单站</lay-button>
          <lay-button type="primary" class="side-button" @click="data_real_load">加载</lay-button>
        </lay-button-container>

      </div>
      <!-- *************************************************************** -->
      <!-- 历史回放 -->
      <div class="side-title-main">
        历史回放
      </div>
      <div style="width: 100%;height: 200px;">
        <!-- 历史回放内容 -->
        <lay-form :model="model_side" style="padding-top: 10px;color:white;">
          <lay-form-item label="历史时间" style="padding-top: 10px;color:white;">
            <lay-date-picker v-model="model_side.his_times" type='datetime'
              style="width: 75%;padding: 0"></lay-date-picker>
          </lay-form-item>
          <lay-form-item label="数据类型">
            <lay-cascader v-model="model_side.cascader_his_value" :options="model_side.cascader_his_opt"
              style="width: 75%;;"></lay-cascader>
          </lay-form-item>

        </lay-form>
        <lay-button-container style="text-align: center;">
          <lay-button type="primary" class="side-button" @click="open_his_data">数据</lay-button>
          <lay-button type="primary" class="side-button" @click="open_clander">日历</lay-button>
          <lay-button type="primary" class="side-button">刷新</lay-button>
          <lay-button type="primary" class="side-button">查询</lay-button>
        </lay-button-container>


      </div>
      <!-- *************************************************************** -->
      <!-- 常用网址 -->
      <div class="side-title-main">
        常用网址
      </div>
      <div class="side-website">
        <!-- 常用网址内容 -->
        <lay-button-container style="text-align: center;">
          <lay-button type="primary" class="side-button" @click="webclick(1)">观测</lay-button>
          <lay-button type="primary" class="side-button" @click="webclick(2)">模式</lay-button>
          <lay-button type="primary" class="side-button" @click="webclick(3)">雷达</lay-button>
          <lay-button type="primary" class="side-button" @click="webclick(4)">省网</lay-button>
        </lay-button-container>
      </div>
    </div>

  </div>
  <extra_map ref="extra_map"></extra_map>
  <extra_text ref="extra_text"></extra_text>
  <his_clander ref="his_clander"></his_clander>
  <his_data ref="his_data"></his_data>
  <extra_single ref="extra_single"></extra_single>
  <showing_table ref="showing_table"></showing_table>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import $ from 'jquery'
import { layer } from "@layui/layui-vue"
import { reactive, h, resolveComponent } from 'vue'
import extra_map from './extra_plot.vue'
import extra_text from './extra_text.vue'
import extra_single from './extra_single.vue'
import his_clander from './his_clander.vue'
import his_data from './his_data.vue'
import showing_table from './showing_table.vue'


export default {
  name: "sidecomp",
  data() {
    return {
      website: [
        "https://www.baidu.com/",
        "https://www.baidu.com/",
        "https://www.baidu.com/",
        "https://www.baidu.com/",
        "https://www.baidu.com/"
      ],
      visible_warring: false,
      title_warring: "报警设置",
      action_warring: [
        {
          text: "确认",
          callback: () => {
            this.$parent.all_seetings.data_times = this.model_side.datarange
            this.$parent.all_seetings.dataopt = this.model_side.dataopt
            this.$parent.all_seetings.rainopt = this.model_side.rainopt
            this.$parent.all_seetings.windopt = this.model_side.windopt
            this.$parent.all_seetings.viewopt = this.model_side.viewopt
            this.$parent.all_seetings.warring_rain_value = parseInt(this.model_side.rainrange)
            this.$parent.all_seetings.warring_wind_value = parseInt(this.model_side.windrange)
            this.$parent.all_seetings.warring_view_value = parseInt(this.model_side.viewrange)
            this.visible_warring = false
          }
        },
        {
          text: "取消",
          callback: (id) => {
            // layer.confirm("取消操作", { shade: false });
            this.visible_warring = false
          }
        }
      ],
      model_side: {
        real_flash_opt: 'silence',
        warring_opt: 'silence',
        datarange: '10min',
        dataopt: true,
        rainrange: "3",
        rainopt: true,
        windrange: "17.3",
        windopt: true,
        viewrange: "500",
        viewopt: false,
        temprange: "15",
        viewopt: false,
        // 实况
        cascader_value: "rain/now",
        cascader_real_opt: [
          {
            value: "rain",
            label: "降水",
            children: [
              {
                value: "now",
                label: "实时",
              },
              {
                value: "30mins",
                label: "30分钟",
              },
              {
                value: "1hours",
                label: "近1小时",
              },
              {
                value: "2hours",
                label: "2小时",
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
              }
            ],
          },
          {
            value: "wind",
            label: "风力",
            children: [
              {
                value: "now",
                label: "实时",
              },
              {
                value: "30mins",
                label: "30分钟",
              },
              {
                value: "1hours",
                label: "近1小时",
              },
              {
                value: "2hours",
                label: "2小时",
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
              }
            ],
          },
          {
            value: "tmax",
            label: "高温",
            children: [
              {
                value: "now",
                label: "实时",
              },
              {
                value: "30mins",
                label: "30分钟",
              },
              {
                value: "1hours",
                label: "近1小时",
              },
              {
                value: "2hours",
                label: "2小时",
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
              }
            ],
          },
          {
            value: "tmin",
            label: "低温",
            children: [
              {
                value: "now",
                label: "实时",
              },
              {
                value: "30mins",
                label: "30分钟",
              },
              {
                value: "1hours",
                label: "近1小时",
              },
              {
                value: "2hours",
                label: "2小时",
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
              }
            ],
          },
          {
            value: "view",
            label: "能见度",
            children: [
              {
                value: "now",
                label: "实时",
              },
              {
                value: "30mins",
                label: "30分钟",
              },
              {
                value: "1hours",
                label: "近1小时",
              },
              {
                value: "2hours",
                label: "2小时",
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
              }
            ],
          }

        ],
        cascader_his_value: "rain/3hours",
        cascader_his_opt: [
          {
            value: "rain",
            label: "降水",
            children: [
              {
                value: "3hours",
                label: "近三小时",
              },
              {
                value: "6hours",
                label: "近6小时",
              },
              {
                value: "12hours",
                label: "近12小时",
              },
              {
                value: "24hours",
                label: "近一天",
              },
              {
                value: "48hours",
                label: "近两天",
              },
              {
                value: "72hours",
                label: "近三天",
              },
              {
                value: "96hours",
                label: "近四天",
              }
            ],
          },
          {
            value: "wind",
            label: "风力",
            children: [
              {
                value: "12hours",
                label: "近12小时",
              },
              {
                value: "6hours",
                label: "近6小时",
              }
            ],
          },
          {
            value: "temp",
            label: "温度",
            children: [
              {
                value: "tmax",
                label: "24小时高温",
              },
              {
                value: "tmin",
                label: "24小时低温",
              }
            ],
          },
          {
            value: "view",
            label: "能见度",
            children: [
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

        ],
        // 历史
        radar_opt: "none",
        radar_sec_opt: "none",
        his_times: "2023-12-14 19:49:00"
      }
    }
  },
  components: {
    extra_map,
    extra_text,
    extra_single,
    his_clander,
    his_data,
    showing_table
  },
  methods: {
    real_change(value) {
      let that = this
      // console.log("同步切换",value)
      if (value == "silence") {
        that.$parent.all_seetings.data_times = that.model_side.datarange
        that.$parent.all_seetings.real_flash_opt = "silence"
      }
      else {
        that.$parent.all_seetings.data_times = that.model_side.datarange
        that.$parent.all_seetings.real_flash_opt = "update"
      }
    },
    warring_change(value) {
      let that = this
      // console.log("报警切换",value)
      if (value == "silence") {
        that.$parent.all_seetings.warring_opt = "silence"
        that.$parent.mp3_play = false
      }
      else {
        that.$parent.all_seetings.warring_opt = "warring"
      }
    },
    radar_change(value) {
      let that = this
      if (value == "plot") {
        var send_data = {}
        send_data.send_type = "real_seeting"
        send_data.radar_opt = true
        that.$emit('side-event', send_data)
      }
    },
    sec_change(value) {
      let that = this
      if (value == "plot") {
        var send_data = {}
        send_data.send_type = "real_seeting"
        send_data.plot_opt = true
        that.$emit('side-event', send_data)
      }
      else {
        var send_data = {}
        send_data.send_type = "real_seeting"
        send_data.plot_opt = false
        that.$emit('side-event', send_data)
      }
    },
    data_real_load() {
      // 实况数据的请求

      let that = this
      var loadid = layer.load(0)
      var value_index = this.model_side.cascader_value.slice(0, 4)
      var tables_obj = {
        "rain": 0,
        "tmax": 1,
        "tmin": 2,
        "wind": 3,
        "view": 4
      }
      var tables_index = tables_obj[value_index]
      var tables_name = this.model_side.cascader_value.slice(5, this.model_side.cascader_value.length)
      var model = "zdz"
      var maindata = that.$parent.main2siderfun()

      var post_data = {
        "model": model,
        "table_type": maindata.datarange,//数据类型
        "table_index": tables_index,
        "boundary": maindata.boundary,
        "click_type": value_index,
        "zoom": maindata.zoom,
        "button_value": tables_name
      }
      var recve = undefined

      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        // async: true,
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: post_data,
        dataType: "json",
        beforeSend: function (XMLHttpRequest) {

        },
        success: function (recvdate) {
          recve = recvdate.data
          // 全局参数调配
          that.$parent.flash_map()
          that.$parent.current_type = recvdate.click_type
          that.$parent.all_seetings.data_times = recvdate.tables_name
          var data = JSON.parse(recvdate.data)
          if (recvdate.click_type == "rain") {
            var rain_points = that.$parent.plot_rain(data)
            that.$parent.point_event(rain_points, "zdz")
          }
          else if (recvdate.click_type == "wind") {
            var wind_points = that.$parent.plot_wind(data)
            if (that.$parent.all_seetings.wind_suf_opt == "barb") {
              that.$parent.mark_event(wind_points, "zdz")
            }
            else {
              that.$parent.point_event(wind_points, "zdz")
            }
          }
          else if ((recvdate.click_type == "tmax") || (recvdate.click_type == "tmin")) {
            var temp_points = that.$parent.plot_temp(data)
            that.$parent.point_event(temp_points, "zdz")
          }
          else if (recvdate.click_type == "view") {
            var view_points = that.$parent.plot_view(data)
            that.$parent.point_event(view_points, "zdz")
          }
          that.$refs.showing_table.opentable(true, data)
        },
        complete: function () {
          layer.close(loadid)
        }

      })

    },
    open_single_station() {
      var station_id = undefined
      var plot_type = undefined
      this.$refs.extra_single.open_single(plot_type, station_id)
    },
    open_his_data() {
      this.$refs.his_data.open_his_data()
    },
    open_clander() {
      this.$refs.his_clander.activate_his_clander()
    },
    open_extra_plot_map() {
      this.$refs.extra_map.activate_extra_plot_opt()
    },
    open_extra_text_map() {
      this.$refs.extra_text.activate_extra_text_opt()
    },
    webclick(ind) {
      window.open(this.website[ind]);
    },
    warring_div() {
      if (this.visible_warring) {
        this.visible_warring = false
      }
      else {
        this.visible_warring = true
      }
    },
    request_warring() {
      let that = this
      var post_data = {
        "rain_type": that.model_side.datarange,
        "name": localStorage.getItem("name")
      }
      $.ajax({
        url: "http://127.0.0.1:9991/api/warring_sync",  // 请求的地址
        // async: true,
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: JSON.stringify(post_data),
        dataType: "json",
        success: function (recvdate) {
          // console.log("数据接收成功",post_data,recvdate)
          if ((that.$parent.all_seetings.real_flash_opt == "update") || (that.$parent.all_seetings.warring_opt == "warring")) {
            that.$parent.flash_map()
            // 数据操作
            var contourf = JSON.parse(recvdate.radar)
            var colotopt = that.$parent.color_opt.radar
            var rain = JSON.parse(recvdate.rain)
            var wind = JSON.parse(recvdate.wind)
            var view = JSON.parse(recvdate.view)
            var rainList = that.$parent.update_user_data(rain)
            var windList = that.$parent.update_user_data(wind)
            var viewList = that.$parent.update_user_data(view)

            const mergedArray = [...rainList, ...windList]
            if (viewList.length>0){
              viewList.forEach(function(item){
                if (item){
                  mergedArray.push(item)
                }
              });
              console.log(viewList)
            }
            if (that.$parent.all_seetings.real_flash_opt == "update") {
              // 更新地图
              if (that.$parent.all_seetings.shpopt) {
                if (localStorage.getItem("userName") != "none") {
                  var shpdata = JSON.parse(localStorage.getItem('userShp'))
                  var shplayer = L.geoJSON(shpdata, {
                    style: function (feature) {
                      return { color: 'red', weight: 1.5, fillOpacity: 0.01 };
                    }
                  })
                  shplayer.addTo(that.$parent.maps)
                  that.$parent.current_layer.push(shplayer)
                }
              }
              // 绘图
              that.$parent.all_seetings.data_times = that.model_side.datarange
              that.$parent.plot_contour(contourf, colotopt)
              // 绘图降水
              var rain_points = that.$parent.plot_rain(rain)
              var model = "warring"
              that.$parent.point_event(rain_points,model)
              // 绘图风力
              that.$parent.all_seetings.wind_suf_opt = "barb"
              var wind_points = that.$parent.plot_wind(wind)
              that.$parent.mark_event(wind_points,model)
            }
            if (that.$parent.all_seetings.warring_opt == "warring") {
              if (mergedArray.length > 0) {
                that.$parent.mp3_play = true
              }
              else {
                that.$parent.mp3_play = false
              }
            }
            // 打开表格
            that.$parent.$refs.warring_table.opentable(true, mergedArray)
          }
        }
      })
    }
  },
  mounted() {
    let that = this

    var today = new Date()
    var y = today.getFullYear();
    var m = today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
    var d = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
    var h = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
    var min = today.getMinutes() < 10 ? "0" + today.getMinutes() + ":00" : today.getMinutes() + ":00"
    var today_str = y + "-" + m + "-" + d + " " + h + ":" + min;
    that.model_side.his_times = today_str
    let timer = setInterval(() => {
      //需要定时执行的代码
      if ((that.model_side.real_flash_opt == "update") || (that.model_side.warring_opt == "warring")) {
        this.request_warring()
      }
      else {
        // 定时获取reids数据
      }
    }, 10000)
  }

}
</script>
<style>
.side-button {
  width: 21%;
  padding-left: 10px;
}

.layui-unselect>span {
  color: #fff !important;
}

.sidecomp-div-main {
  width: 100%;
  height: 100%;
}

.side-title-main {
  width: 100%;
  height: 36px;
  background-color: rgb(22, 186, 170);
  text-align: center;
  font-size: 14px;
  color: white;
  line-height: 2.5;
}

.scrollbar::-webkit-scrollbar {
  display: none;
}

.side-website {
  width: 100%;
  height: 60px;
  /* background-color:rgb(28,30,36); */
  padding-top: 25px;
  text-align: center;
}

.layui-input-wrapper>span {
  display: none;
}

/* .layui-input-prefix-icon {
  display: none;
} */
</style>