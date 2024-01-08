import { createApp } from 'vue'
import './style.css'
import App from './App.vue'



// 全局注册layui
import Layui from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'
// 
import axios from 'axios'
// 地图
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-switch-basemap'
// 地图额外插件的引用
// import './extendjs/js/iconLayers.js'
// import './extendjs/css/iconLayers.css'
import './extendjs/js/markerrotate.js'
import './extendjs/js/leaflet.mask.js'
import './extendjs/js/leaflet-windbarb.js'
import './extendjs/js/Leaflet.canvasmarker'
import './extendjs/js/leaflet.canvaslabel'


// 地图包的引用
// import {CanvasLabel} from "@panzhiyue/leaflet-canvaslabel"
// import {CanvasMarkerLayer} from "@panzhiyue/leaflet-canvasmarker"
// highchart 引用
import Highcharts from 'highcharts/highstock';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsDrilldown from 'highcharts/modules/drilldown';
import Highcharts3D from 'highcharts/highcharts-3d';
import Highmaps from 'highcharts/modules/map';
import Windbarb from 'highcharts/modules/windbarb'
HighchartsMore(Highcharts)
HighchartsDrilldown(Highcharts);
Highcharts3D(Highcharts);
Highmaps(Highcharts);
Windbarb(Highcharts)

// turf的引用
// import * as turf from '@turf/turf'


// import * as echarts from 'echarts'

//全局数据
const app = createApp(App).use(Layui).use(Highcharts).mount('#app')

