<template>
  <div>
    <lay-layer 
      v-model="visible" 
      :shade="false" 
      :area="['550px', '450px']" 
      :title=title 
      :offset="offset"
      
      :titleStyle="titleStyle">
      
      <div style="width: 100%;height: 100%;overflow-y: hidden;">
        <lay-table :default-toolbar="false" :columns="columns" :data-source="dataSource" @change="change" :page="model.page" height="400px">
          <template #toolbar>
            <lay-input v-model="model.input" style="width: 60%;margin-right: 20px;"></lay-input>
            <lay-button type="primary" size="sm" @click="reset">重置</lay-button>
            <lay-button type="primary" size="sm" @click="search">搜索</lay-button>
            <lay-button type="primary" size="sm" @click="user">筛选</lay-button>
          </template>
        </lay-table>
      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
export default {
  name: "showing_table",
  data() {
    return {
      title: "站点数据",
      visible: false,
      offset: "tr",
      model: {
        input: "",
        page:{ current: 1, limit: 10, total: 100 },
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
    reset() {
      let that = this
      if (that.dataSource.length > 0) {
        that.dataSource = []
        that.dataSource = that.bakdata.slice(0,(that.model.page.limit-1))
      }
      else {
        that.dataSource = that.bakdata.slice(0,(that.model.page.limit-1))
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
      that.dataSource = search_data.slice(0, (that.model.page.limit-1))
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
        that.dataSource = search_data.slice(0, (that.model.page.limit-1))
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
        that.dataSource = search_data.slice(0, (that.model.page.limit-1))
        that.bakdata = search_data
      }
    },
    opentable(status, data) {
      let that = this
      that.dataSource = []
      that.bakdata = []
      that.visible = status
      var current_data = data.slice(0, (that.model.page.limit-1))
      that.dataSource = current_data
      that.bakdata = data
    },
    change(page){
      let that = this
      var start = (page.current-1)*that.model.page.limit
      var end = (page.current)*that.model.page.limit - 1 
      var current_data = that.bakdata.slice(start,end)
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