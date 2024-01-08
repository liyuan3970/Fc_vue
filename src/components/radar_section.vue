<template>
  <div style="display: inline-flex;;width: 40px;margin-left: 10px;">
    <lay-layer v-model="visible" :shade="false" :area="['820px', '600px']" :resize="true" :title=title :titleStyle="titleStyle">
      <div id="radar_section" ref="radar_section">
      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
import $ from 'jquery'
export default {
  name: "radar_section",
  data() {
    return {
      title: "雷达剖面",
      titleStyle: {
        "color": "white",
        "border": "none",
        "font-size": "15px",
        "background-color": "rgb(68,118,167)"
      },
      visible: false,
    }
  },
  methods: {
    changeVisible(start, end) {
      this.visible = true
      $.ajax({
        url: "http://127.0.0.1:9991/station_zdz_data",  // 请求的地址
        type: "post",  // 请求方式
        timeout: 25000, //设置延迟上限
        data: {
          // 'csrfmiddlewaretoken': csrf,
          'model': "radar_sec",
          'click_type': start,
          'button_value': end
        },
        dataType: "json",
        success: function (recvdate) {
          // 获取数据
          // console.log("雷达切面数据",recvdate.img)
          var img = new Image()
          img.src = recvdate.img
          img.style = "max-width: 100%;max-height: 100%;"
          $("#radar_section").html(img)
        }
      })
    },
    initdemo() {

    }
  },
  mounted() {

  }
}

</script>

<style scoped>
#radar_section {
  height: 490px;
  width: 100%;
}
</style>