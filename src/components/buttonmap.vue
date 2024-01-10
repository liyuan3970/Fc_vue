<template>
	<div style="display: inline-flex;;width: 60px;">
    <lay-button type="primary" @click="changeVisible">地图</lay-button>
    <lay-layer v-model="visible" :shade="false" :area="['600px', '600px']" :btn="action" :resize="true" :title=title>
      <div id="button_map"  ref="button_map">

      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
export default {
  name: "buttonmap",
  data(){
    return {
      title:"我是地图",
      visible: false,
      maps: undefined, 
      action: [
        {
          text: "确认",
          callback: () => {
            console.log("关闭")
            this.visible = false
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
      ]
    }
  },
  methods: {
    changeVisible() {
      if (this.visible) {
        console.log("关闭")
        this.visible = false     
      }
      else {
        console.log("开启")
        this.visible = true 
        this.$nextTick(() => {
          console.log("开启nextTick")
          var button_map =  this.$refs.button_map
          const map = L.map(button_map).setView([51.505, -0.09], 13)
          const marker = L.marker([51.5, -0.09]).addTo(map)
          console.log("最后打印map",map)
        })
      }
    },
    initmap(){
      var map = L.map(this.$refs['button_map']).setView([51.505, -0.09], 13);
    }
  },
  mounted(){
    
  }
}

</script>

<style scoped>
    #button_map  { 
        height:490px;
        width: 100%;
    }

</style>