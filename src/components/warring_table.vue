<template>
  <div>
    <lay-layer v-model="visible" :shade="false" :area="['550px', '300px']" :title=title :offset="offset" :titleStyle="titleStyle">
      <div style="width: 100%;height: 100%;overflow-y: hidden;">
        <lay-table :default-toolbar="false" :columns="columns" :data-source="dataSource" height="250px"></lay-table>
      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
export default {
  name: "warring_table",
  data() {
    return {
      title: "报警单站",
      visible: false,
      offset: "tr",
      titleStyle:{
        "color":"white",
        "border":"none",
        "font-size":"15px",
        "background-color": "rgb(68,118,167)"
      },
      tables: undefined,
      columns: [ //标题栏
        { key: 'City', title: '城市' }
        , { key: 'Station_Id_C', title: '站号' }
        , { key: 'Station_Name', title: '站名' }
        , { key: 'type', title: '类型' }
        , { key: 'value', title: '数据' }
      ],
      dataSource: []
    }
  },
  methods: {
    opentable(status, data) {
      let that = this
      that.dataSource = []
      that.visible = status
      that.dataSource = data
    }
  },
  mounted() {

  }
}

</script>

<style scoped>


</style>