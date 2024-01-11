<template>
  <div style="display: inline-flex;;width: 60px;">
    <lay-layer v-model="visible" :shade="false" :area="['800px', '880px']" :resize="true" :title=title>
      <div id="extra_plot_map" ref="extra_plot_map" >

      </div>
    </lay-layer>
  </div>
</template>

<script>
import { ref, nextTick, defineProps, defineEmits } from "vue";
export default {
  name: "extra_plot",
  data() {
    return {
      title: "绘图",
      visible: false,
      maps: undefined,
    }
  },
  methods: {
    open_map(value) {
      let that = this
      that.visible = false
      that.visible = value
      that.$nextTick(() => {
        that.initmap()
      })
    },
    initmap() {
      let that = this
      const map = L.map(that.$refs.extra_plot_map).setView([51.505, -0.09], 13)
      const marker = L.marker([51.5, -0.09]).addTo(map)
    }
  },
  mounted() {
    //  this.initmap()
  }
}

</script>

<style scoped>
#extra_plot_map {
  height: 700px;
  width:800px;
  /* background-color: white; */
}


</style>