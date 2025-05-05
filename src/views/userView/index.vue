<template>
  <div class="user_app">
    <!-- 标题 -->
    <el-row class="user_title">
      <div class="title-container">
        <el-image :src="src" class="logo"></el-image>
        <div class="title">{{ settings.title }}</div>
      </div>
    </el-row>
    <!--导航栏-->
    <el-row class="user_top" :gutter="20">
      <!-- <el-col class="title" :span="6">{{ settings.title }}</el-col>
      <el-col :span="10">
        <div class="bar">
          <div class="item" v-for="item in barList">
            <div @click="goPage(item.route)">{{ item.name }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="4"></el-col>
      <el-col :span="2" @click="goPage('/index')">管理系统</el-col>
      <el-col :span="2" @click="logout">退出</el-col> -->
      <el-menu
    :default-active="currentIndex"
    class="el-menu-demo"
    mode="horizontal"
    background-color="#2d5299"
    text-color="#fff"
    active-text-color="#ffd04b"
    :ellipsis="false"
  >
    <el-menu-item v-for="(item,index) in barList" :index="index"  @click="goPage(item.route)">{{ item.name }}</el-menu-item>
    <div class="flex-grow" />
    <el-menu-item  @click="goPage('/index')" :index="barList.lenght"> 管理系统 </el-menu-item>
    <el-menu-item  @click="logout" :index="barList.lenght-1">退出</el-menu-item>
  </el-menu>
    </el-row>
    <!--内容区域-->
    <div>
      <router-view/>
    </div>
  </div>
</template>

<script setup>
import settings from "@/settings.js";
import {ElMessageBox} from "element-plus";
import useUserStore from "@/store/modules/user.js";
import {useRouter} from "vue-router";
import {barList} from "@/views/userView/data.js";
import VolSwiper from "@/views/userView/compoents/volSwiper.vue";
import Cookies from "js-cookie";

let currentIndex = ref(0);
let src = '/src/assets/images/party_default.png'

const {proxy} = getCurrentInstance();
for(let i = 0;i< barList.length;i++){
   if(proxy.$router.currentRoute.value.path === barList[i].route){
      currentIndex.value = i;
   }
}
const {
  sys_activity_status, sys_activity_type, sys_examine_status
} = proxy.useDict('sys_activity_status', 'sys_activity_type', 'sys_examine_status');
const userStore = useUserStore()
const router = useRouter()
const state = reactive({
  user: {},
  roleGroup: {},
});


/*页面跳转*/
function goPage(route) {
  Cookies.set("allowAdminIndex", "true")
  router.push(route)
}

/*退出登录*/
function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index';
    })
  }).catch(() => {
  });
}

</script>

<style scoped lang="scss">

.user_app {
  padding: 0 10px;
}
.user_title{
  height: 70px;
  display: flex;
  align-items: center;
  
  .title-container {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-left: 20px;
  }

  .logo {
    width: 60px;
    height: 60px;
  }

  .title {
    font-size: 22px;
    color: #2d5299;
    font-weight: bolder;
  }
}

.user_top {
  height: 60px;
  line-height: 60px;
  color: #FFFFFF;
  font-weight: bold;
  background-color: #2d5299;
}

.el-menu-demo{
  width: 50%;
  margin: 0 auto;
}
.el-menu-item{
  font-size: 16px;
}

.flex-grow {
  flex-grow: 1;
}



.info {
  cursor: pointer;

  &:hover {
    color: #fa6d7c;
  }
}
</style>
