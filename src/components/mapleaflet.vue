<template>
  <div id="mapdiv"></div>
</template>

<script>
// 引入leaflet 

export default {
  name: "mapleaflet",
  mounted() {
    const map = L.map('mapdiv').setView([51.505, -0.09], 13)
    const marker = L.marker([51.5, -0.09]).addTo(map)
  }

}

</script>
<style scoped>

    #mapdiv  { 

        height:100%;

        width: 100%;

    }

</style>