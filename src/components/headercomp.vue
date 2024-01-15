<template>
  <div class="headercomp-div-main">
    <div style="width: 10%;;height: 100%;font-size: 22px;padding-left: 70px;padding-top: 5px;">
      台州风驰
    </div>
    <div style="width: 15%;;height: 100%;">
      <!-- 按钮组 -->

    </div>
    <div style="width: 30%;;height: 100%;">
      <!-- 通知栏 -->
      <lay-notice-bar :text="notice" mode="link"></lay-notice-bar>
    </div>
    <div style="display: inline-flex;;width: 45%;;height: 100%;">
      <!-- 用户组 -->
      <div style="display: inline-flex;width: 35%;height: 80%;text-align: center;">
        <div style="width: 60%;height: 90%;;text-align: center;">
          <!-- 搜索框 -->
        </div>
        <div style="width: 40%;height: 90%;;text-align: right;padding-top: 3%;padding-right: 5%;">
          {{ usertext }}
        </div>
      </div>
      <lay-button @click="login" style="border: none;"><lay-icon type="layui-icon-username"></lay-icon></lay-button>
      <lay-layer v-model="visible_login" :shade="false" :area="['340px', '300px']" :btn="action_login" :resize="true"
        :title=title_login>
        <div>
          <lay-form :model="model_login" style="padding-top: 40px;">
            <lay-form-item label="账号">
              <lay-input style="width: 70%;" v-model="model_login.user"></lay-input>
            </lay-form-item>
            <lay-form-item label="密码">
              <lay-input style="width: 70%;" v-model="model_login.paswd" type="password" autocomplete="off"></lay-input>
            </lay-form-item>
          </lay-form>
        </div>
      </lay-layer>
      <lay-button @click="setting" style="border: none;"><lay-icon type="layui-icon-set"></lay-icon></lay-button>
      <lay-layer v-model="visible_set" :shade="false" :area="['300px', '370px']" :btn="action_set" :resize="true" :titleStyle="titleStyle" 
        offset="rb" :title=title_set >
        <div style="border: 3px solid black;background-color: rgb(13, 13, 14);color:white"> 
          <lay-form :model="model_set" style="padding-top: 10px;height: 100%;">
            <lay-form-item label="显示选项">
              <lay-radio v-model="model_set.boundary_type" value="current" label="当前"></lay-radio>
              <lay-radio v-model="model_set.boundary_type" value="all" label="全省"></lay-radio>
            </lay-form-item>
            <lay-form-item label="风场选项">
              <lay-radio v-model="model_set.wind_suf_opt" value="barb" label="风羽"></lay-radio>
              <lay-radio v-model="model_set.wind_suf_opt" value="label" label="标签"></lay-radio>
            </lay-form-item>
            <lay-form-item label="文字大小">
              <lay-select style="width: 68%;" v-model="model_set.fontsize">
                <lay-select-option value="1.15" label="小"></lay-select-option>
                <lay-select-option value="1.8" label="中"></lay-select-option>
                <lay-select-option value="2.5" label="大"></lay-select-option>
              </lay-select>
            </lay-form-item>
            <lay-form-item label="数据级别">
              <lay-select style="width: 68%;" v-model="model_set.datarange">
                <lay-select-option value="nation" label="国家站"></lay-select-option>
                <lay-select-option value="regin" label="区域站"></lay-select-option>
                <lay-select-option value="all" label="所有站"></lay-select-option>
                <lay-select-option value="main" label="骨干站"></lay-select-option>
                <lay-select-option value="auto" label="全自动"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-form>
        </div>
      </lay-layer>

    </div>

  </div>
</template>

<script>
import { ref } from 'vue'
import { layer } from "@layui/layui-vue";
import axios from 'axios'

export default {
  name: "headercomp",
  data() {
    return {
      notice: "",
      title_set: "设置",
      visible_set: false,
      titleStyle: {
        "color": "black",
        "border": "none",
        "font-size": "15px",
        "background-color": "white"
      },
      action_set: [
        {
          text: "确认",
          style:{
            "color":"white",
            "background-color":"rgb(28,30,36)"
          },
          callback: () => {
            this.$parent.all_seetings.datarange = this.model_set.datarange
            this.$parent.all_seetings.wind_suf_opt = this.model_set.wind_suf_opt
            this.$parent.all_seetings.boundary_type = this.model_set.boundary_type
            this.$parent.themes.fontsize = this.model_set.fontsize
            this.$parent.flash_map()
            // this.$emit('header-event', this.model_set)
            this.visible_set = false
          }
        },
        {
          text: "取消",
          callback: () => {
            // layer.confirm("取消操作", { shade: false });
            this.visible_set = false
          }
        }
      ],
      model_set: {
        datarange: 'auto',
        wind_suf_opt: "barb",
        boundary_type: "current",
        fontsize:"1.8"
      },
      usertext: "",
      userlocal:undefined,
      title_login: "登录",
      visible_login: false,
      action_login: [
        {
          text: "确认",
          callback: () => {
            console.log("关闭---",this.usertext)
            var label = this.usertext
            this.sendmsg(label)
            this.visible_login = false
            layer.closeAll();
          }
        },
        {
          text: "取消",
          callback: () => {
            this.visible_login = false
            console.log("关闭")
            console.log("取消")
          }
        }
      ],
      model_login: {
        user: null,
        paswd: undefined
      },

    }
  },
  methods: {
    sendmsg(label) {

      let that = this
      var datarecv = undefined
      axios.post('http://127.0.0.1:9991/user/login', {
        username: this.model_login.user,
        password: this.model_login.paswd
      }).then(function (result) {
        // 正常处理

        if (result.data.code == 200){

          let data = result.data.data;
          localStorage.setItem("token", data.access);
          localStorage.setItem("userName", data.company_name);
          localStorage.setItem("companyType", data.company_type);
          localStorage.setItem("name", data.name);
          localStorage.setItem("roleType", data.role_type);
          localStorage.setItem("userId", data.user_id);
          localStorage.setItem("userShp", JSON.stringify(data.shp));
          localStorage.setItem("warringShp", JSON.stringify(data.war));
          that.userlocal = data
          that.usertext = data.company_name
        }
      }).catch(function (error) {
        //异常  
        console.log(error);
      }).finally(function () {
        // 总是会执行

      });    
    },
    login() {
      let that = this
      if (localStorage.userId!="none") {
        layer.confirm("是否退出登录",
          {
            title: "注销登录",
            anim: 6,
            btn: [
              {
                text: '是', callback: (id) => {
                  // layer.msg("站着看");      
                  localStorage.setItem("userId", "none");
                  that.usertext = ""
                  // console.log("注销用户",localStorage)
                  layer.close(id);
                }
              },
              {
                text: '否', callback: (id) => {
                  // layer.msg("坐着看");
                  layer.close(id);
                }
              }
            ]
          }
        );
      }
      else {
        if (this.visible_login) {
          this.visible_login = false
        }
        else {
          this.visible_login = true
        }

      }

    },
    setting() {
      if (this.visible_set) {
        console.log("关闭")
        this.visible_set = false
      }
      else {
        console.log("开启")
        this.visible_set = true
      }
    }
  },
  mounted() {
    // 添加默认用户名
    let that = this
    if (localStorage.userId!="none") {
      that.usertext = localStorage.getItem("userName")
    }   
  }
}
</script>
<style>
.headercomp-div-main {
  width: 100%;
  height: 100%;
  color: white;
  display: inline-flex;
}


/* .layui-layer-content {
  width: 100%;
  height: 100%;
  background-color: rgb(28, 30, 36);
} */
</style>