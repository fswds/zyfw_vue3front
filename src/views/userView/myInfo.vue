<template>
  <div class="app">
    <!--个人中心-->
    <div class="title" @click="handlePage">信息修改</div>
    <div class="list">
      <el-row>
        <el-col :span="24">
          <el-card>
            <template v-slot:header>
              <div class="clearfix">
                <span>基本资料</span>
              </div>
            </template>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本资料" name="userinfo">
                <userInfo :user="state.user"/>
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="resetPwd">
                <resetPwd/>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup name="Profile">
import {getUser} from "@/api/system/user";
import useUserStore from "@/store/modules/user.js";
import UserInfo from "@/views/system/user/profile/userInfo.vue";
import ResetPwd from "@/views/system/user/profile/resetPwd.vue";
import {useRouter} from "vue-router";

const {proxy} = getCurrentInstance();
const {
  sys_user_sex,
  sys_activity_status,
  sys_activity_type, sys_examine_status
} = proxy.useDict("sys_user_sex", "sys_activity_status", 'sys_activity_type', 'sys_examine_status');
const activeTab = ref("userinfo");
const userInfoData = useUserStore()
const router = useRouter();
const state = reactive({
  user: {},
});
const queryParams = ref({
  userId: userInfoData.user.userId,
  userApprovalStatus: '2',
  pageSize: 10,
  pageNum: 1,
})
const total = ref(0)


function handlePage() {
  router.push('/userIndex/profile')
}

function init() {
  getUserInfo()
}


function getUserInfo() {
  getUser(userInfoData.user.userId).then(response => {
    console.log(response)
    state.user = response.data;
  });
}


init()
</script>
<style lang="scss" scoped>
.app {
  margin: 20px;
}

.title {
  background: #409eff;
  color: #fff;
  text-align: center;
  padding: 10px;

  &:hover {
    cursor: pointer;
  }
}

.list {
  border: 3px solid #409eff;
  padding: 10px;
}

</style>
