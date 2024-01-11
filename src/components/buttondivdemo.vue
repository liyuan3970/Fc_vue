<template>
	<div style="display: inline-flex;;width: 40px;margin-left: 10px;">
    <lay-button type="primary" @click="changeVisible">demo</lay-button>
    <lay-layer v-model="visible" :shade="false" :area="['600px', '600px']" :btn="action" :resize="true" :title=title>
      <div id="button_demo"  ref="button_demo">

      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
export default {
  name: "buttondemo",
  data(){
    return {
      title:"我是demo",
      visible: false,
      demos: undefined, 
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
    initdemo(){
      
    }
  },
  mounted(){
    
  }
}

</script>

<style scoped>
    #button_demo  { 
        height:490px;
        width: 100%;
    }

</style>