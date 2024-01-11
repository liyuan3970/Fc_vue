<template>
  <div>
    <lay-button type="primary" @click="changeVisible">表格</lay-button>
    <lay-layer v-model="visible" :shade="false" :area="['1200px', '600px']" :btn="action" :resize="true" :title=title>
      <div id="button_table" ref="button_table">
        <lay-table :default-toolbar="false" :columns="columns5" :data-source="dataSource5" ></lay-table>  
      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
export default {
  name: "buttontable",
  data() {
    return {
      title: "我是表格",
      visible: false,
      tables: undefined,
      action: [
        {
          text: "确认",
          callback: () => {
            console.log("关闭")
            this.visible = true
            this.columns5 = [
              {
                title: "号码",
                width: "120px",
                key: "id"
              },
              {
                title: "姓名",
                width: "100px",
                key: "name"
              },
              {
                title: "性别",
                width: "100px",
                key: "sex"
              },
              {
                title: "地区",
                children: [
                  { title: "省", key: "prov", width: "100px" },
                  { title: "市", key: "city", width: "100px" },
                  { title: "区", key: "area", width: "100px" },
                ]
              },
              {
                title: "标记",
                width: "240px",
                key: "remark"
              },
            ]
          }
        },
        {
          text: "取消",
          callback: () => {
            // layer.confirm("取消操作", { shade: false });
            console.log("关闭")
            console.log("取消")
          }
        }
      ],
      columns5: [
        {
          title: "编号",
          width: "120px",
          key: "id"
        },
        {
          title: "名称",
          width: "100px",
          key: "name"
        },
        {
          title: "性别",
          width: "100px",
          key: "sex"
        },
        {
          title: "地址",
          children: [
            { title: "省", key: "prov", width: "100px" },
            { title: "市", key: "city", width: "100px" },
            { title: "区", key: "area", width: "100px" },
          ]
        },
        {
          title: "签名",
          width: "240px",
          key: "remark"
        },
      ],
      dataSource5: [
        { id: "10001", name: "夏娜1", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' },
        { id: "10002", name: "夏娜2", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' },
        { id: "10003", name: "夏娜3", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' },
        { id: "10004", name: "夏娜4", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' },
        { id: "10005", name: "夏娜5", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' },
        { id: "10006", name: "夏娜6", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' },
        { id: "10007", name: "夏娜7", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' },
        { id: "10008", name: "夏娜8", prov: "浙江", sex: "女", city: "杭州", area: "西湖区", remark: '不知江月待何人，但见长江送流水。' }
      ]
    }
  },
  methods: {
    changeVisible() {
      if (this.visible11) {
        console.log("关闭")
        this.visible = false
      }
      else {
        console.log("开启")
        this.visible = true
        this.$nextTick(() => {
          console.log("开启nextTick")
        })
      }
    },
    inittable() {

    }
  },
  mounted() {

  }
}

</script>

<style scoped>
#button_table {
  height: 490px;
  width: 100%;
}
</style>