<template>
  <div style="display: inline-flex;;width: 60px;">
    <lay-layer v-model="visible" :shade="false" :area="['1200px', '800px']" :resize="true" :title=title
      :titleStyle="titleStyle">
      <div
        style="display: inline-flex;width: 1160px;height: 720px;;margin-left: 20px;margin-top: 10px;overflow-y: hidden;overflow-x: hidden;">
        <lay-tab type="card" v-model="model.current_id" style="width: 100%;height: 720px;margin: 0;padding: 0;"
          @change="change">
          <lay-tab-item title="历史同期" id="his_data_compare" style="height: 100%;">
            <div style="width: 100%;height: 100%;">
              <div style="display: inline-flex;;width: 100%;height: 10%;">
                <div style="width: 60%;height: 100%;">
                  <lay-form :model="model">
                    <lay-form-item label="时间" style="padding-top: 12px;" mode="inline">
                      <lay-date-picker v-model="times" range type="datetime"
                        :placeholder="['开始日期', '结束日期']"></lay-date-picker>
                    </lay-form-item>
                  </lay-form>
                </div>
                <div style="width: 40%;height: 100%;;padding-top: 12px;">
                  <lay-radio-button v-model="selected3" value="1" @change="change">写作</lay-radio-button>
                  <lay-radio-button v-model="selected3" value="2" @change="change">画画</lay-radio-button>
                  <lay-radio-button v-model="selected3" value="3" @change="change">运动</lay-radio-button>
                  <lay-radio-button v-model="selected3" value="3" @change="change">运动</lay-radio-button>
                </div>
              </div>
              <lay-table :default-toolbar="false" :columns="model.his.columns" :data-source="model.his.dataSource"
                style="height: 30%;">
              </lay-table>
            </div>
          </lay-tab-item>
          <lay-tab-item title="智能网格" id="his_igrid" style="height: 100%;">
            <div style=";width: 100%;height: 100%;padding-left:25%">
              <div style="display: inline-block;;width: 600px;height:100%;;">
                <div
                  style="width: 100%;height: 6%;background-color: blue;text-align: center;padding-top:10px;font-family:STKaiti,KaiTi;font-size: medium;">
                </div>
                <div style="width: 100%;height: 93%;background-color: white;" id="his_igrid_map" ref="his_igrid_map">

                </div>
              </div>
            </div>
          </lay-tab-item>
          <lay-tab-item title="大陈航线" id="his_see_ec" style="height: 100%;">
            <div style="width: 100%;height: 100%;">
              <lay-table :default-toolbar="false" :columns="model.see.columns" :data-source="model.see.dataSource"
                style="height: 30%;">
                <template #toolbar>

                  <lay-button type="primary" size="sm" @click="sea_table_comput"
                    style="float: right;margin-left: 15px;">计算</lay-button>
                  <lay-button type="primary" size="sm" @click="sea_table_download" style="float: right;">下载</lay-button>
                </template>
              </lay-table>
              <div style="width: 100%;height: 60%;margin-top: 10%;margin-left: 5%;">
                <h4>大陈航线舒适度等级：</h4><br>
                1级，风平浪静，天气舒适，非常适宜出海游玩。<br><br>
                2级，微波起伏，天气宜人，稍有颠簸，适宜出海游玩。<br><br>
                3级，风浪稍大，踏浪而行，有点颠簸，较适宜出海游玩。<br><br>
                4级，风浪较大，舒适度不佳，不太适宜出游，不惧风浪者继续出游吧。<br><br>
                5级，风高浪急，船已停航，乖乖呆在陆地上玩耍吧！<br><br>
              </div>
            </div>
          </lay-tab-item>
        </lay-tab>
      </div>
      <!-- <div id="his_data"  ref="his_data"></div> -->
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
import $ from 'jquery'
import zhejianglist from "../json/zhejianglist.json"
import taizhoulocal from "../json/331000.json"
export default {
  name: "his_data",
  data() {
    return {
      title: "数据查询",
      visible: false,
      current_map: undefined,
      titleStyle: {
        "color": "white",
        "border": "none",
        "font-size": "15px",
        "background-color": "rgb(68,118,167)"
      },
      times: ['2001-01-01 01:01:00', '2001-02-1 01:01:00'],
      model: {
        current_id: "his_data_compare",
        see: {
          columns: [ //标题栏
            { key: 'time', title: '时间' }
            , { key: 'temp', title: '气温', edit: 'text' }
            , { key: 'rh', title: '湿度', edit: 'text' }
            , { key: 'wind', title: '风力', edit: 'text' }
            , { key: 'sun', title: '日照', edit: 'text' }
            , { key: 'fy', title: '阵风', edit: 'text' }
            , { key: 'result', title: '结果', edit: 'text' }
          ],
          dataSource: [
            { "time": "9月8日", "temp": 20.1, "rh": 0.78, "wind": 6.8, "sun": 11.8, "fy": 196, "result": 8 },
            { "time": "9月10日", "temp": 18.1, "rh": 0.79, "wind": 4.6, "sun": 11.7, "fy": 150, "result": 1 },
          ],
        },
        his: {
          columns: [ //标题栏
            { key: 'time', title: '时间' }
            , { key: 'temp', title: '气温', edit: 'text' }
            , { key: 'rh', title: '湿度', edit: 'text' }
            , { key: 'wind', title: '风力', edit: 'text' }
            , { key: 'sun', title: '日照', edit: 'text' }
            , { key: 'fy', title: '阵风', edit: 'text' }
            , { key: 'result', title: '结果', edit: 'text' }
          ],
          dataSource: [
            { "time": "9月8日", "temp": 20.1, "rh": 0.78, "wind": 6.8, "sun": 11.8, "fy": 196, "result": 8 },
            { "time": "9月10日", "temp": 18.1, "rh": 0.79, "wind": 4.6, "sun": 11.7, "fy": 150, "result": 1 },
          ],
        }
      }
    }
  },
  methods: {
    open_his_data() {
      let that = this
      that.visible = true
    },
    change(id) {
      let that = this
      if (id == "his_igrid") {
        if (!that.current_map) {
          that.$nextTick(() => {
            that.initmap()
          })
        }
      }
      else if (id == "his_data_compare") {

      }
      else if (id == "his_see_ec") {

      }
    },
    initmap() {
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
      var lines = L.geoJSON(taizhoulocal, {
        style: function (feature) {
          return { color: 'black', weight: 0.8, fill: false };
        }
      })
      var map = new L.Map(this.$refs['his_igrid_map'], {
        center: new L.LatLng(28.6, 121.15),//110.763, 41.376   39.62353145, 121.9937485
        renderer: canvasLabel,
        zoom: 8.5, //4
        maxZoom: 12,
        minZoom: 6,
        // zoomDelta: 0.25,
        zoomSnap: 0.01,
        zoomControl: false,
        // dragging: false,
        // scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false, //是否去除右下角标志
        // maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        layers: [lines]
      });

      that.current_map = map
    },
    sea_table_comput() {
      let that = this
      function thi(data) {
        var values = (data.temp * 1.8 + 32) - 0.55 * (1 - data.rh) * (1.8 * data.temp - 26)
        if ((values > 0) && (values <= 40)) {
          values = 1
        }
        else if ((values > 40) && (values <= 45)) {
          values = 3
        }
        else if ((values > 45) && (values <= 55)) {
          values = 5
        }
        else if ((values > 55) && (values <= 60)) {
          values = 7
        }
        else if ((values > 60) && (values <= 65)) {
          values = 9
        }
        else if ((values > 65) && (values <= 70)) {
          values = 7
        }
        else if ((values > 70) && (values <= 75)) {
          values = 5
        }
        else if ((values > 75) && (values <= 80)) {
          values = 3
        }
        else if (values > 80) {
          values = 1
        }
        return values
      }
      function ki(data) {
        var values = -(Math.sqrt(data.wind) * 10 + 10.45 - data.wind) * (33 - data.temp) + 8.55 * data.sun
        if ((values > -2000) && (values <= -1000)) {
          values = 1
        }
        else if ((values > -1000) && (values <= -800)) {
          values = 3
        }
        else if ((values > -800) && (values <= -600)) {
          values = 5
        }
        else if ((values > -600) && (values <= -300)) {
          values = 7
        }
        else if ((values > -300) && (values <= -200)) {
          values = 9
        }
        else if ((values > -200) && (values <= -50)) {
          values = 7
        }
        else if ((values > -50) && (values <= 80)) {
          values = 5
        }
        else if ((values > 80) && (values <= 160)) {
          values = 3
        }
        else if (values > 160) {
          values = 1
        }
        return values
      }
      function Kl(data) {
        var values = 1.8 * data.temp - 0.55 * (1.8 * data.temp - 26) * (1 - data.rh) - 3.2 * Math.sqrt(data.wind) + 32
        if ((values > -0) && (values <= 25)) {
          values = 1
        }
        else if ((values > 25) && (values <= 38)) {
          values = 3
        }
        else if ((values > 38) && (values <= 50)) {
          values = 5
        }
        else if ((values > 50) && (values <= 58)) {
          values = 7
        }
        else if ((values > 58) && (values <= 70)) {
          values = 9
        }
        else if ((values > 70) && (values <= 79)) {
          values = 7
        }
        else if ((values > 79) && (values <= 85)) {
          values = 5
        }
        else if ((values > 85) && (values <= 90)) {
          values = 3
        }
        else if (values > 90) {
          values = 1
        }
        return values
      }
      function hi(data) {
        var values = (8.3593246304406 - 0.0351185068164501 * data.fy + 0.000690156714818621 * data.fy * data.fy) / 10
        if ((values > 0) && (values <= 0.5)) {
          values = 9
        }
        else if ((values > 0.5) && (values <= 1)) {
          values = 7
        }
        else if ((values > 1) && (values <= 1.5)) {
          values = 5
        }
        else if ((values > 1.5) && (values <= 2)) {
          values = 3
        }
        else if ((values > 2) && (values <= 2.5)) {
          values = 1
        }
        else if (values > 2.5) {
          values = 0
        }
        return values
      }
      function final(data) {
        data.forEach(function (item) {
          var a = thi(item)
          var b = ki(item)
          var c = Kl(item)
          var d = hi(item)
          if (item.fy > 208) {
            item.result = 5
          }
          else {
            var values = 0.22 * a + 0.11 * b + 0.05 * c + 0.62 * d
            if ((values > 0) && (values <= 2.6)) {
              values = 4
            }
            else if ((values > 2.6) && (values <= 4)) {
              values = 3
            }
            else if ((values > 4) && (values <= 6.2)) {
              values = 2
            }
            else if (values > 6.2) {
              values = 1
            }
            item.result = values
          }
        })
        return data
      }
      var getdata = that.model.see.dataSource
      var computdata = final(getdata)
      that.model.see.dataSource = computdata
    },
    sea_table_download() {
      let that = this
      var ajaxdata = {
        // 'csrfmiddlewaretoken': csrf,
        'model': 'sea_download',
        'click_type': "none",// plot_type 风雨温
        'button_value': "none"
      }
      $.ajax({
        url: "http://172.21.158.40:9001/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: ajaxdata,
        dataType: "json",
        success: function (recvdate) {
          // console.log(recvdate)
          var getdata = recvdate.data
          that.model.see.dataSource = getdata
        }
      })

    }
  },
  mounted() {

  }
}

</script>

<style scoped>
#his_data {
  height: 490px;
  width: 100%;
}
</style>