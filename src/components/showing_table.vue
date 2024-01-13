<template>
  <div>
    <lay-layer v-model="visible" :shade="false" :area="['550px', '450px']" :title=title :offset="offset"
      :titleStyle="titleStyle">

      <div style="width: 100%;height: 100%;overflow-y: hidden;">
        <lay-table :default-toolbar="false" :columns="columns" :data-source="dataSource" @change="change" @row="rowchange"
          :page="model.page" height="400px">
          <template #toolbar>
            <lay-input v-model="model.input" style="width: 30%;margin-right: 20px;"></lay-input>
            <lay-button type="primary" size="sm" @click="reset">重置</lay-button>
            <lay-button type="primary" size="sm" @click="search">搜索</lay-button>
            <lay-button type="primary" size="sm" @click="user">筛选</lay-button>
            <lay-button type="primary" size="sm" @click="stationinfo">站名信息</lay-button>
            <lay-button type="primary" size="sm" @click="towninfo">乡镇界线</lay-button>
          </template>

        </lay-table>
      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
import { layer } from "@layui/layui-vue";
export default {
  name: "showing_table",
  data() {
    return {
      title: "站点数据",
      visible: false,
      offset: "tr",
      model: {
        input: "",
        page: { current: 1, limit: 10, total: 100 },
      },
      titleStyle: {
        "color": "white",
        "border": "none",
        "font-size": "15px",
        "background-color": "rgb(68,118,167)"
      },
      tables: undefined,
      columns: [ //标题栏
        { key: 'City', title: '城市' }
        , { key: 'Station_Id_C', title: '站号' }
        , { key: 'Station_Name', title: '站名' }
        , { key: 'Cnty', title: '区县' }
        , { key: 'value', title: '数据' }
      ],
      dataSource: [],
      bakdata: []
    }
  },
  methods: {
    rowchange(e) {
      // 行变化
      let that = this
      var zoom = that.$parent.$parent.maps.getZoom()
      that.$parent.$parent.maps.setView([e.Lat, e.Lon], zoom)
      var data = {
        lat: e.Lat,
        lon: e.Lon,
        Station_Name: e.Station_Name
      }
      that.$parent.$parent.add_single(data, zoom)
    },
    add_station(dataType) {
      // dataSource
      
      let that = this
      console.log(that.dataSource)
      that.$parent.$parent.add_stations(that.dataSource,dataType)
    },
    stationinfo() {
      let that = this
      layer.confirm("选择单站信息",
        {
          title:"",
          btn: [
            {
              text: '站名', callback: (id) => {
                that.add_station("Station_Name")
                layer.close(id);
              }
            },
            {
              text: '海拔', callback: (id) => {
                that.add_station("Alti")
                layer.close(id);
              }
            },
            {
              text: '站号', callback: (id) => {
                that.add_station("Station_Id_C")
                layer.close(id);
              }
            },
            {
              text: '乡镇', callback: (id) => {
                that.add_station("Town")
                layer.close(id);
              }
            },

          ]
        }
      );
    },
    towninfo(){},
    reset() {
      let that = this
      if (that.dataSource.length > 0) {
        that.dataSource = []
        that.dataSource = that.bakdata.slice(0, (that.model.page.limit - 1))
      }
      else {
        that.dataSource = that.bakdata.slice(0, (that.model.page.limit - 1))
      }
    },
    search() {
      let that = this
      var returndata = that.bakdata
      var search_data = []
      returndata.forEach(function (item) {
        if ((item.Station_Id_C == that.model.input) || (item.Station_Name == that.model.input) || (item.City == that.model.input) || (item.Cnty == that.model.input)) {
          search_data.push(item)
        }
      })
      that.dataSource = []
      that.dataSource = search_data.slice(0, (that.model.page.limit - 1))
      that.bakdata = search_data
    },
    user() {
      let that = this
      if (localStorage.userName) {
        var returndata = that.bakdata
        var search_data = []
        returndata.forEach(function (item) {
          if ((item.City == localStorage.userName) || (item.Cnty == localStorage.userName) || (item.Town == localStorage.userName)) {
            search_data.push(item)
          }
        })
        that.dataSource = []
        that.dataSource = search_data.slice(0, (that.model.page.limit - 1))
        that.bakdata = search_data
      }
      else {

        var returndata = that.bakdata
        var search_data = []
        returndata.forEach(function (item) {
          if ((item.City == "台州市") || (item.Cnty == "台州市") || (item.Town == "台州市")) {
            search_data.push(item)
          }
        })
        that.dataSource = []
        that.dataSource = search_data.slice(0, (that.model.page.limit - 1))
        that.bakdata = search_data
      }
    },
    opentable(status, data) {
      let that = this
      that.dataSource = []
      that.bakdata = []
      that.visible = status
      var current_data = data.slice(0, (that.model.page.limit - 1))
      that.dataSource = current_data
      that.bakdata = data
    },
    change(page) {
      let that = this
      var start = (page.current - 1) * that.model.page.limit
      var end = (page.current) * that.model.page.limit - 1
      var current_data = that.bakdata.slice(start, end)
      that.dataSource = current_data
      // setTimeout(() => {

      // }, 1000);
    }

  },
  mounted() {

  }
}

</script>

<style scoped></style>